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
        if (req.getShopId() == null) {
            throw new RuntimeException("Shop ID is required.");
        }
        if (req.getAddressId() == null) {
            throw new RuntimeException("Delivery Address ID is required.");
        }
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new RuntimeException("Cannot place order with empty items.");
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
            if (req.getLatitude() == null || req.getLongitude() == null) {
                throw new RuntimeException("Current location is required for nearby delivery orders.");
            }
            double distanceKm = ShopService.calculateDistanceKm(
                    req.getLatitude(), req.getLongitude(), shop.getLatitude(), shop.getLongitude());
            double radiusKm = ShopService.normalizeDeliveryRadius(shop.getDeliveryRadiusKm());
            if (distanceKm > radiusKm) {
                throw new RuntimeException("This shop is outside your local delivery radius.");
            }
        }

        // 2. Validate Address range and delivery
        UserDeliveryAddress address = addressRepository.findAddressByIdAndUserId(req.getAddressId(), userId)
                .orElseThrow(() -> new RuntimeException("Specified delivery address not found in your address book."));

        String shopCity = shop.getCity() != null ? shop.getCity().trim() : "";
        String userCity = address.getCity() != null ? address.getCity().trim() : "";
        if (!shopCity.equalsIgnoreCase(userCity)) {
            throw new RuntimeException("This shop cannot deliver to a different city.");
        }

        // 3. Re-verify lease holds or hold immediately if checkout skipped hold step
        holdInventoryLeases(userId, req.getItems());

        // 4. Calculate pricing structure
        double subtotal = 0.0;
        List<OnlineOrderItem> orderItems = new ArrayList<>();

        for (CartItemRequest itemReq : req.getItems()) {
            ShopProductResponse product = productRepository.findProductById(itemReq.getProductId()).get();
            if (product.getShopId() == null || !product.getShopId().equals(shop.getId())) {
                throw new RuntimeException("Product does not belong to the selected shop: " + product.getTitle());
            }
            if (!Boolean.TRUE.equals(product.getIs_active()) || !Boolean.TRUE.equals(product.getOnlineDelivery())) {
                throw new RuntimeException("Product is not available for delivery: " + product.getTitle());
            }
            double mrp = product.getMrp() != null ? product.getMrp() : 0.0;
            double price = product.getPrice() != null ? product.getPrice() : 0.0;
            double itemTotal = price * itemReq.getQuantity();
            subtotal += itemTotal;

            orderItems.add(OnlineOrderItem.builder()
                    .productId(product.getId())
                    .productTitle(product.getTitle())
                    .mrpAtPurchase(mrp)
                    .quantity(itemReq.getQuantity())
                    .price(price)
                    .build());
        }

        double minOrder = shop.getMinOrderValue() != null ? shop.getMinOrderValue() : 0.0;
        if (subtotal < minOrder) {
            throw new RuntimeException("Order total of INR " + subtotal + " does not meet minimum shop threshold of INR " + minOrder);
        }

        double deliveryFee = shop.getBaseDeliveryFee() != null ? shop.getBaseDeliveryFee() : 0.0;

        String paymentMethod = req.getPaymentMethod() != null ? req.getPaymentMethod().toUpperCase() : "COD";

        // Generate unique order number  e.g. TKT-20260619-A3F7B2
        String orderNumber = "TKT-" +
                java.time.LocalDate.now().toString().replace("-", "") + "-" +
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // Calculate total MRP, discount, and grand total
        double totalMrp = orderItems.stream()
                .mapToDouble(i -> (i.getMrpAtPurchase() != null ? i.getMrpAtPurchase() : i.getPrice()) * i.getQuantity())
                .sum();
        double totalDiscount = Math.max(0, totalMrp - subtotal);
        double grandTotal = subtotal + deliveryFee;

        // Create the actual order inside the PG Database
        Long orderId = orderRepository.createOrder(
                userId,
                shop.getId(),
                address.getId(),
                orderNumber,
                totalMrp,
                totalDiscount,
                subtotal,
                deliveryFee,
                grandTotal,
                paymentMethod,
                orderChannel,
                req.getNotes()
        );

        // Populate and insert order lines with price snapshots
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

        // Associate lease holds to order ID so they don't expire for checkouts in progress
        orderRepository.associateLeasesWithOrder(userId, orderId);

        // Record initial status in history
        String initialStatus = "COD".equals(paymentMethod) ? "PENDING_CONFIRMATION" : "DRAFT";
        orderRepository.insertStatusHistory(orderId, initialStatus, "Order placed by consumer", "CONSUMER");

        // Adjust state if COD, transition immediately to PENDING_CONFIRMATION
        if ("COD".equals(paymentMethod)) {
            orderRepository.updateOrderStatus(orderId, "PENDING_CONFIRMATION", "PENDING");
        }

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
            }
        }
    }
}
