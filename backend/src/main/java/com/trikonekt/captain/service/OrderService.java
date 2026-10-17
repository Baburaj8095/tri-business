package com.trikonekt.captain.service;

import com.trikonekt.captain.model.*;
import com.trikonekt.captain.repository.AddressRepository;
import com.trikonekt.captain.repository.OrderRepository;
import com.trikonekt.captain.repository.ProductRepository;
import com.trikonekt.captain.repository.ShopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final AddressRepository addressRepository;
    private final ShiprocketService shiprocketService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        ShopRepository shopRepository, AddressRepository addressRepository,
                        ShiprocketService shiprocketService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.shopRepository = shopRepository;
        this.addressRepository = addressRepository;
        this.shiprocketService = shiprocketService;
    }

    /**
     * Pre-checkout lease block logic. Acquires temporary lease holds for 10 minutes on cart items.
     */
    @Transactional
    public void holdInventoryLeases(Long userId, List<CartItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new RuntimeException("Cannot acquire lease holds on empty cart.");
        }

        for (CartItemRequest item : items) {
            ShopProductResponse product = productRepository.findProductById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));

            if (!Boolean.TRUE.equals(product.getIs_active())) {
                throw new RuntimeException("Product is inactive and cannot be ordered: " + product.getTitle());
            }

            // Available = Physical Stock - Active Lease Holds from others
            int otherLeases = orderRepository.getActiveLeasedQuantity(product.getId());
            int availableStock = (product.getStockQty() != null ? product.getStockQty() : 0) - otherLeases;

            if (item.getQuantity() > availableStock) {
                throw new RuntimeException("Insufficient inventory available for " + product.getTitle() +
                        ". In stock: " + availableStock + " (Requested: " + item.getQuantity() + ")");
            }

            // Acquire 10 min hold lease
            orderRepository.acquireInventoryLease(product.getId(), item.getQuantity(), userId);
        }
    }

    /**
     * Initializes or places an Order.
     * Starts as DRAFT for online pre-payments, or directly PENDING_CONFIRMATION for Cash on Delivery (COD).
     */
    @Transactional
    public OnlineOrder placeOrder(Long userId, CreateOrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order with empty items.");
        }

        // Auto-resolve shopId from items if omitted
        if (req.getShopId() == null) {
            for (CartItemRequest it : req.getItems()) {
                if (it.getProductId() != null) {
                    Optional<ShopProductResponse> prodOpt = productRepository.findProductById(it.getProductId());
                    if (prodOpt.isPresent() && prodOpt.get().getShopId() != null) {
                        req.setShopId(prodOpt.get().getShopId());
                        break;
                    }
                }
            }
        }

        if (req.getShopId() == null) {
            throw new RuntimeException("Shop ID is required.");
        }

        // 1. Verify Active Shop supports service
        ShopResponse shop = shopRepository.findActiveShopById(req.getShopId())
                .orElseThrow(() -> new RuntimeException("Shop does not exist or is inactive."));

        if ("OFFLINE".equalsIgnoreCase(shop.getServiceMode())) {
            throw new RuntimeException("This shop operates only in OFFLINE mode.");
        }

        String orderChannel = req.getOrderChannel() != null ? req.getOrderChannel().toUpperCase() : "ONLINE_DELIVERY";
        if ("NEARBY_DELIVERY".equals(orderChannel)) {
            if (!Boolean.TRUE.equals(shop.getHomeDeliveryEnabled())) {
                throw new RuntimeException("This shop does not provide home delivery.");
            }
            if (req.getLatitude() != null && req.getLongitude() != null && shop.getLatitude() != null && shop.getLongitude() != null) {
                double distanceKm = ShopService.calculateDistanceKm(
                        req.getLatitude(), req.getLongitude(), shop.getLatitude(), shop.getLongitude());
                double radiusKm = ShopService.normalizeDeliveryRadius(shop.getDeliveryRadiusKm());
                if (distanceKm > radiusKm) {
                    throw new RuntimeException("This shop is outside your local delivery radius.");
                }
            }
        }

        // 2. Resolve delivery address
        Long addressId = req.getAddressId();
        UserDeliveryAddress address = null;
        if (addressId != null) {
            address = addressRepository.findAddressByIdAndUserId(addressId, userId).orElse(null);
        }

        if (address == null) {
            List<UserDeliveryAddress> userAddresses = addressRepository.findAddressesByUserId(userId);
            if (!userAddresses.isEmpty()) {
                address = userAddresses.get(0);
                addressId = address.getId();
            }
        }

        if (address == null) {
            String addrText = req.getDeliveryAddress() != null && !req.getDeliveryAddress().isBlank()
                    ? req.getDeliveryAddress().trim()
                    : (shop.getAddress() != null ? shop.getAddress() : "Customer Local Delivery");
            String recName = req.getConsumerName() != null && !req.getConsumerName().isBlank() ? req.getConsumerName().trim() : "Customer";
            String recPhone = req.getConsumerPhone() != null && !req.getConsumerPhone().isBlank() ? req.getConsumerPhone().trim() : "";
            String city = shop.getCity() != null && !shop.getCity().isBlank() ? shop.getCity() : "Bangalore";
            try {
                addressRepository.insertAddress(userId, recName, recPhone, addrText, "", "", city, "Karnataka", "560001", true);
                List<UserDeliveryAddress> createdList = addressRepository.findAddressesByUserId(userId);
                if (!createdList.isEmpty()) {
                    address = createdList.get(0);
                    addressId = address.getId();
                }
            } catch (Exception ignored) {}
        }

        if (addressId == null) {
            addressId = -1L;
        }

        // 3. Best-effort inventory lease holds (don't block purchase if stock is unmanaged)
        try {
            holdInventoryLeases(userId, req.getItems());
        } catch (Exception leaseErr) {
            log.warn("Inventory lease hold notice: {}", leaseErr.getMessage());
        }

        // 4. Calculate pricing structure
        double subtotal = 0.0;
        List<OnlineOrderItem> orderItems = new ArrayList<>();

        for (CartItemRequest itemReq : req.getItems()) {
            Optional<ShopProductResponse> prodOpt = productRepository.findProductById(itemReq.getProductId());
            double mrp = 0.0;
            double price = 0.0;
            String productTitle = "Item";

            if (prodOpt.isPresent()) {
                ShopProductResponse product = prodOpt.get();
                mrp = product.getMrp() != null ? product.getMrp() : (product.getPrice() != null ? product.getPrice() : 0.0);
                price = product.getPrice() != null ? product.getPrice() : mrp;
                productTitle = product.getTitle() != null ? product.getTitle() : "Product #" + product.getId();
            }

            int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
            double itemTotal = price * qty;
            subtotal += itemTotal;

            orderItems.add(OnlineOrderItem.builder()
                    .productId(itemReq.getProductId())
                    .productTitle(productTitle)
                    .mrpAtPurchase(mrp)
                    .quantity(qty)
                    .price(price)
                    .build());
        }

        double deliveryFee = shop.getBaseDeliveryFee() != null ? shop.getBaseDeliveryFee() : 0.0;
        String paymentMethod = req.getPaymentMethod() != null ? req.getPaymentMethod().toUpperCase() : "COD";

        boolean isPrepaid = Boolean.TRUE.equals(req.getIsPaid())
                || "PAID".equalsIgnoreCase(req.getPaymentStatus())
                || "ONLINE_RAZORPAY".equalsIgnoreCase(paymentMethod)
                || "WALLET".equalsIgnoreCase(paymentMethod);

        String initialStatus = isPrepaid || "COD".equalsIgnoreCase(paymentMethod) ? "PENDING_CONFIRMATION" : "DRAFT";
        String initialPaymentStatus = isPrepaid ? "PAID" : "PENDING";
        String paymentRef = req.getTransactionRef() != null ? req.getTransactionRef() : "";

        // Generate unique order number e.g. TKT-20261017-A3F7B2
        String orderNumber = "TKT-" +
                java.time.LocalDate.now().toString().replace("-", "") + "-" +
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        double totalMrp = orderItems.stream()
                .mapToDouble(i -> (i.getMrpAtPurchase() != null ? i.getMrpAtPurchase() : i.getPrice()) * i.getQuantity())
                .sum();
        double totalDiscount = Math.max(0, totalMrp - subtotal);
        double grandTotal = subtotal + deliveryFee;

        // Create the actual order inside the PostgreSQL database
        Long orderId = orderRepository.createOrder(
                userId,
                shop.getId(),
                addressId,
                orderNumber,
                totalMrp,
                totalDiscount,
                subtotal,
                deliveryFee,
                grandTotal,
                paymentMethod,
                orderChannel,
                req.getNotes(),
                initialStatus,
                initialPaymentStatus,
                paymentRef
        );

        for (OnlineOrderItem item : orderItems) {
            orderRepository.createOrderItem(
                    orderId,
                    item.getProductId(),
                    item.getProductTitle(),
                    item.getMrpAtPurchase() != null ? item.getMrpAtPurchase() : item.getPrice(),
                    item.getQuantity(),
                    item.getPrice()
            );
        }

        try {
            orderRepository.associateLeasesWithOrder(userId, orderId);
        } catch (Exception ignored) {}

        String historyNote = isPrepaid ? "Order placed and payment verified via " + paymentMethod : "Order placed by consumer";
        orderRepository.insertStatusHistory(orderId, initialStatus, historyNote, "CONSUMER");

        return orderRepository.findOrderById(orderId).orElseThrow(() -> new RuntimeException("Order initialization failed."));
    }

    /**
     * Executes order state-machine transitions seamlessly.
     */
    @Transactional
    public OnlineOrder transitionOrderStatus(Long orderId, String targetStatus, Long userId, Long shopId) {
        return transitionOrderStatus(orderId, targetStatus, userId, shopId, null);
    }

    @Transactional
    public OnlineOrder transitionOrderStatus(Long orderId, String targetStatus, Long userId, Long shopId,
                                             OrderStateTransitionRequest req) {
        OnlineOrder order = orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with reference: " + orderId));

        // Check permission boundary
        if (userId != null && !userId.equals(order.getUserId())) {
            throw new RuntimeException("Unauthorized. You are not the owner of this order.");
        }
        if (shopId != null && !shopId.equals(order.getShopId())) {
            throw new RuntimeException("Unauthorized. This order does not belong to your shop.");
        }

        String currentStatus = order.getStatus();
        String paymentStatus = order.getPaymentStatus();

        if (currentStatus.equals(targetStatus)) {
            return order; // State unchanged
        }

        // Evaluate validity of transitions
        switch (targetStatus) {
            case "PENDING_CONFIRMATION":
                if (!"DRAFT".equals(currentStatus)) {
                    throw new RuntimeException("Order can only transition to PENDING_CONFIRMATION from DRAFT state.");
                }
                paymentStatus = "PAID"; // Assuming online callback verified
                break;

            case "CONFIRMED":
                if (!"PENDING_CONFIRMATION".equals(currentStatus)) {
                    throw new RuntimeException("Order can only be CONFIRMED from PENDING_CONFIRMATION state.");
                }
                // Merchant has accepted. Deduct stock permanently and remove lease holds.
                deductPhysicalStock(order);
                if ("ONLINE_DELIVERY".equalsIgnoreCase(order.getOrderChannel())) {
                    try {
                        shiprocketService.scheduleShiprocketShipment(order);
                    } catch (Exception e) {
                        // Log and swallow so order confirmation itself is never blocked
                        log.error("Failed to trigger Shiprocket dispatch: {}", e.getMessage());
                    }
                }
                break;

            case "PREPARING":
                if (!"CONFIRMED".equals(currentStatus)) {
                    throw new RuntimeException("Order must be CONFIRMED before entering PREPARING state.");
                }
                break;

            case "SHIPPED":
                if (!"CONFIRMED".equals(currentStatus) && !"PREPARING".equals(currentStatus)) {
                    throw new RuntimeException("Order must be CONFIRMED or PREPARING before entering SHIPPED state.");
                }
                break;

            case "DISPATCHED":
                if (!"PREPARING".equals(currentStatus) && !"SHIPPED".equals(currentStatus)) {
                    throw new RuntimeException("Order must be under PREPARING or SHIPPED state before DISPATCHED.");
                }
                break;

            case "COMPLETED":
                if (!"DISPATCHED".equals(currentStatus) && !"SHIPPED".equals(currentStatus)) {
                    throw new RuntimeException("Order must be DISPATCHED or SHIPPED before completion.");
                }
                if ("COD".equalsIgnoreCase(order.getPaymentMethod()) && !"NEARBY_DELIVERY".equalsIgnoreCase(order.getOrderChannel())) {
                    paymentStatus = "PAID";
                }
                // Delete association leases now that inventory replenishment is settled
                orderRepository.clearUserTemporaryLeases(order.getUserId());
                break;

            case "CANCELLED":
                if ("COMPLETED".equals(currentStatus) || "CANCELLED".equals(currentStatus)) {
                    throw new RuntimeException("Cannot cancel an order that is already: " + currentStatus);
                }

                // If cancelled after previous logical deduction (during CONFIRMED, PREPARING, SHIPPED, DISPATCHED), replenish stock
                if ("CONFIRMED".equals(currentStatus) || "PREPARING".equals(currentStatus) || "SHIPPED".equals(currentStatus) || "DISPATCHED".equals(currentStatus)) {
                    replenishPhysicalStock(order);
                }

                // Delete any holding leases
                orderRepository.clearUserTemporaryLeases(order.getUserId());
                break;

            default:
                throw new RuntimeException("Invalid order state transition targeting: " + targetStatus);
        }

        orderRepository.updateOrderStatus(orderId, targetStatus, paymentStatus);

        // Always record transition in history log
        String actor = (userId != null) ? "CONSUMER" : (shopId != null ? "MERCHANT" : "SYSTEM");
        orderRepository.insertStatusHistory(orderId, targetStatus, null, actor);

        // If cancelling, persist the reason text if provided in request
        if ("CANCELLED".equals(targetStatus) && req != null && req.getCancellationReason() != null) {
            orderRepository.setCancellationReason(orderId, req.getCancellationReason());
        }

        return orderRepository.findOrderById(orderId).get();
    }

    /**
     * Deducts the catalog physical inventory from database when order is confirmed.
     */
    private void deductPhysicalStock(OnlineOrder order) {
        for (OnlineOrderItem item : order.getItems()) {
            ShopProductResponse product = productRepository.findProductById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found inside inventory: " + item.getProductTitle()));

            int currentStock = product.getStockQty() != null ? product.getStockQty() : 0;
            int newStock = Math.max(0, currentStock - item.getQuantity());

            productRepository.updateProduct(
                    product.getId(),
                    product.getTitle(),
                    product.getDescription(),
                    product.getMrp(),
                    product.getPrice(),
                    product.getDiscountPercent(),
                    product.getOnlineDelivery(),
                    product.getOfflineDelivery(),
                    newStock,
                    product.getImage(),
                    product.getIs_active()
            );

            productRepository.recordStockMovement(
                    product.getId(),
                    order.getShopId(),
                    order.getUserId(),
                    "CONSUMER",
                    "ORDER_CONFIRMATION",
                    -item.getQuantity(),
                    currentStock,
                    newStock,
                    "Order confirmed: " + order.getOrderNumber(),
                    order.getOrderNumber()
            );
        }
    }

    /**
     * Restores/replenishes catalog physical inventory if confirmed order gets cancelled.
     */
    private void replenishPhysicalStock(OnlineOrder order) {
        for (OnlineOrderItem item : order.getItems()) {
            Optional<ShopProductResponse> prodOpt = productRepository.findProductById(item.getProductId());
            if (prodOpt.isPresent()) {
                ShopProductResponse product = prodOpt.get();
                int currentStock = product.getStockQty() != null ? product.getStockQty() : 0;
                int newStock = currentStock + item.getQuantity();

                productRepository.updateProduct(
                        product.getId(),
                        product.getTitle(),
                        product.getDescription(),
                        product.getMrp(),
                        product.getPrice(),
                        product.getDiscountPercent(),
                        product.getOnlineDelivery(),
                        product.getOfflineDelivery(),
                        newStock,
                        product.getImage(),
                        product.getIs_active()
                );

                productRepository.recordStockMovement(
                        product.getId(),
                        order.getShopId(),
                        order.getUserId(),
                        "SYSTEM",
                        "ORDER_CANCELLATION",
                        item.getQuantity(),
                        currentStock,
                        newStock,
                        "Order cancelled: " + order.getOrderNumber(),
                        order.getOrderNumber()
                );
            }
        }
    }
}
