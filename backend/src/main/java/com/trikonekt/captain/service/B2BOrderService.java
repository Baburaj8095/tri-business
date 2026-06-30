package com.trikonekt.captain.service;

import com.trikonekt.captain.model.*;
import com.trikonekt.captain.repository.B2BOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class B2BOrderService {

    private final B2BOrderRepository repository;

    public B2BOrderService(B2BOrderRepository repository) {
        this.repository = repository;
    }

    public CartValidationResponse validateCart(Long buyerId, CartValidationRequest req) {
        if (req == null || req.getShopId() == null) {
            return invalid(null, null, "Shop ID is required.", List.of(), 0.0);
        }
        if (req.getItems() == null || req.getItems().isEmpty()) {
            return invalid(req.getShopId(), null, "Cart is empty.", List.of(), 0.0);
        }

        List<CartItemResponse> responses = new ArrayList<>();
        boolean allValid = true;
        Long expectedSellerId = null;
        String shopName = null;
        double subtotal = 0.0;

        boolean isDeliverable = true;
        String deliverabilityMessage = null;
        boolean deliveryCheckDone = false;

        for (CartItemRequest itemReq : req.getItems()) {
            Integer quantity = itemReq != null ? itemReq.getQuantity() : null;
            Long productId = itemReq != null ? itemReq.getProductId() : null;
            if (productId == null || quantity == null || quantity < 1) {
                responses.add(CartItemResponse.builder()
                        .productId(productId)
                        .title("Invalid item")
                        .price(0.0)
                        .quantity(quantity != null ? quantity : 0)
                        .subTotal(0.0)
                        .isAvailable(false)
                        .message("Valid product and quantity are required.")
                        .build());
                allValid = false;
                continue;
            }

            Optional<Map<String, Object>> rowOpt = repository.findOrderableProduct(productId);
            if (rowOpt.isEmpty()) {
                responses.add(unavailable(productId, "Unknown product", quantity, "Product does not exist."));
                allValid = false;
                continue;
            }

            Map<String, Object> row = rowOpt.get();
            String title = str(row.get("title"), "Product");
            Long shopId = num(row.get("shop_id"));
            Long sellerId = num(row.get("seller_id"));
            shopName = str(row.get("shop_name"), shopName);

            String failure = validateProductRow(row, buyerId, req.getShopId(), quantity);
            if (failure != null) {
                responses.add(unavailable(productId, title, quantity, failure));
                allValid = false;
                continue;
            }

            if (!deliveryCheckDone) {
                Boolean homeDeliveryEnabled = (Boolean) row.get("home_delivery_enabled");
                Double deliveryRadiusKm = dblOrNull(row.get("delivery_radius_km"));
                Double sellerLat = dblOrNull(row.get("latitude"));
                Double sellerLng = dblOrNull(row.get("longitude"));
                String serviceMode = str(row.get("service_mode"), "OFFLINE").toUpperCase();

                if (Boolean.TRUE.equals(homeDeliveryEnabled) && (serviceMode.equals("BOTH") || serviceMode.equals("OFFLINE"))) {
                    Optional<Map<String, Object>> buyerShopOpt = repository.findBuyerShop(buyerId);
                    if (buyerShopOpt.isPresent()) {
                        Map<String, Object> buyerShop = buyerShopOpt.get();
                        Double buyerLat = dblOrNull(buyerShop.get("latitude"));
                        Double buyerLng = dblOrNull(buyerShop.get("longitude"));
                        if (buyerLat != null && buyerLng != null && sellerLat != null && sellerLng != null) {
                            double distanceKm = ShopService.calculateDistanceKm(buyerLat, buyerLng, sellerLat, sellerLng);
                            double radius = deliveryRadiusKm != null ? Math.min(deliveryRadiusKm, 25.0) : 5.0;
                            if (distanceKm > radius) {
                                isDeliverable = false;
                                deliverabilityMessage = "This wholesale seller is outside your delivery area (distance: " + String.format("%.1f", distanceKm) + " KM, max: " + radius + " KM).";
                            }
                        } else {
                            isDeliverable = false;
                            deliverabilityMessage = "Please configure your shop coordinates in the profile to verify local delivery availability.";
                        }
                    } else {
                        isDeliverable = false;
                        deliverabilityMessage = "Please register your store profile to verify local delivery availability.";
                    }
                }
                deliveryCheckDone = true;
            }

            if (expectedSellerId == null) expectedSellerId = sellerId;
            if (!Objects.equals(expectedSellerId, sellerId) || !Objects.equals(req.getShopId(), shopId)) {
                responses.add(unavailable(productId, title, quantity, "Only one seller/shop is allowed per B2B cart."));
                allValid = false;
                continue;
            }

            double price = dbl(row.get("price"));
            double lineTotal = price * quantity;
            subtotal += lineTotal;
            responses.add(CartItemResponse.builder()
                    .productId(productId)
                    .title(title)
                    .price(price)
                    .quantity(quantity)
                    .subTotal(lineTotal)
                    .isAvailable(true)
                    .message("In Stock")
                    .build());
        }

        boolean finalValid = allValid && isDeliverable;
        String finalMessage = finalValid 
                ? "B2B cart validated successfully." 
                : (deliverabilityMessage != null ? deliverabilityMessage : "Some B2B cart items are invalid.");

        return CartValidationResponse.builder()
                .shopId(req.getShopId())
                .shopName(shopName)
                .isDeliverable(isDeliverable)
                .subTotal(subtotal)
                .deliveryFee(0.0)
                .minOrderValue(0.0)
                .total(subtotal)
                .items(responses)
                .isValid(finalValid)
                .message(finalMessage)
                .build();
    }

    @Transactional
    public B2BOnlineOrder placeOrder(Long buyerId, CreateB2BOrderRequest req) {
        if (req == null || req.getShopId() == null) throw new RuntimeException("Shop ID is required.");
        if (req.getItems() == null || req.getItems().isEmpty()) throw new RuntimeException("Cannot place an empty B2B order.");

        CartValidationRequest validationRequest = CartValidationRequest.builder()
                .shopId(req.getShopId())
                .items(req.getItems())
                .build();
        CartValidationResponse validation = validateCart(buyerId, validationRequest);
        if (!Boolean.TRUE.equals(validation.getIsValid())) {
            throw new RuntimeException(validation.getMessage());
        }

        Long sellerId = null;
        double subtotal = 0.0;
        double totalMrp = 0.0;
        List<Map<String, Object>> rows = new ArrayList<>();

        for (CartItemRequest item : req.getItems()) {
            Map<String, Object> row = repository.findOrderableProduct(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));
            sellerId = num(row.get("seller_id"));
            double price = dbl(row.get("price"));
            double mrp = dbl(row.get("mrp"));
            subtotal += price * item.getQuantity();
            totalMrp += (mrp > 0 ? mrp : price) * item.getQuantity();
            rows.add(row);
        }

        String orderNumber = "B2B-" + LocalDate.now().toString().replace("-", "") + "-" +
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        double discount = Math.max(0.0, totalMrp - subtotal);
        Long orderId = repository.createOrder(
                buyerId, sellerId, req.getShopId(), orderNumber,
                subtotal, totalMrp, discount, subtotal, "MANUAL", req.getNotes()
        );

        for (int i = 0; i < req.getItems().size(); i++) {
            CartItemRequest item = req.getItems().get(i);
            Map<String, Object> row = rows.get(i);
            double price = dbl(row.get("price"));
            double mrp = dbl(row.get("mrp"));
            repository.createOrderItem(orderId, item.getProductId(), str(row.get("title"), "Product"),
                    item.getQuantity(), price, mrp > 0 ? mrp : price, price * item.getQuantity());
        }

        repository.insertHistory(orderId, "PENDING_CONFIRMATION", "PENDING", "B2B order placed by buyer", "BUYER", buyerId);
        return repository.findOrderById(orderId).orElseThrow(() -> new RuntimeException("B2B order creation failed."));
    }

    public List<B2BOnlineOrder> listBuyerOrders(Long buyerId) {
        return repository.findOrdersByBuyerId(buyerId);
    }

    public B2BOnlineOrder getBuyerOrder(Long buyerId, Long orderId) {
        return repository.findOrderByIdAndBuyerId(orderId, buyerId)
                .orElseThrow(() -> new RuntimeException("B2B order not found or unauthorized."));
    }

    public List<B2BOnlineOrder> listSellerOrders(Long sellerId) {
        return repository.findOrdersBySellerId(sellerId);
    }

    public B2BOnlineOrder getSellerOrder(Long sellerId, Long orderId) {
        return repository.findOrderByIdAndSellerId(orderId, sellerId)
                .orElseThrow(() -> new RuntimeException("Seller B2B order not found or unauthorized."));
    }

    @Transactional
    public B2BOnlineOrder cancelBuyerOrder(Long buyerId, Long orderId, String reason) {
        B2BOnlineOrder order = getBuyerOrder(buyerId, orderId);
        if (!Set.of("PENDING_CONFIRMATION", "CONFIRMED").contains(order.getStatus())) {
            throw new RuntimeException("This B2B order can no longer be cancelled by buyer.");
        }
        if ("CONFIRMED".equals(order.getStatus())) replenish(order);
        repository.updateOrderStatus(orderId, "CANCELLED");
        repository.setCancellationReason(orderId, reason != null ? reason : "Cancelled by buyer");
        repository.insertHistory(orderId, "CANCELLED", order.getPaymentStatus(), "Cancelled by buyer", "BUYER", buyerId);
        return getBuyerOrder(buyerId, orderId);
    }

    @Transactional
    public B2BOnlineOrder transitionSellerOrder(Long sellerId, Long orderId, OrderStateTransitionRequest req) {
        String target = req != null && req.getStatus() != null ? req.getStatus().trim().toUpperCase() : "";
        B2BOnlineOrder order = getSellerOrder(sellerId, orderId);
        String current = order.getStatus();

        if (current.equals(target)) return order;

        switch (target) {
            case "CONFIRMED":
                require(current, "PENDING_CONFIRMATION", "Only pending B2B orders can be accepted.");
                validateStockForConfirmation(order);
                deduct(order);
                break;
            case "REJECTED":
                require(current, "PENDING_CONFIRMATION", "Only pending B2B orders can be rejected.");
                break;
            case "PACKING":
                require(current, "CONFIRMED", "B2B order must be confirmed before packing.");
                break;
            case "DISPATCHED":
                require(current, "PACKING", "B2B order must be packing before dispatch.");
                if (!"PAID".equals(order.getPaymentStatus())) throw new RuntimeException("Payment must be approved before dispatch.");
                break;
            case "DELIVERED":
                require(current, "DISPATCHED", "B2B order must be dispatched before delivered.");
                break;
            case "COMPLETED":
                require(current, "DELIVERED", "B2B order must be delivered before completion.");
                break;
            case "CANCELLED":
                if (!Set.of("PENDING_CONFIRMATION", "CONFIRMED", "PACKING").contains(current)) {
                    throw new RuntimeException("This B2B order can no longer be cancelled.");
                }
                if (Set.of("CONFIRMED", "PACKING").contains(current)) replenish(order);
                repository.setCancellationReason(orderId, req != null ? req.getCancellationReason() : "Cancelled by seller");
                break;
            default:
                throw new RuntimeException("Invalid B2B order status: " + target);
        }

        repository.updateOrderStatus(orderId, target);
        repository.insertHistory(orderId, target, order.getPaymentStatus(), req != null ? req.getNotes() : null, "SELLER", sellerId);
        return getSellerOrder(sellerId, orderId);
    }

    @Transactional
    public B2BOnlineOrder submitPayment(Long buyerId, Long orderId, B2BPaymentRequest req) {
        B2BOnlineOrder order = getBuyerOrder(buyerId, orderId);
        if (Set.of("CANCELLED", "REJECTED", "COMPLETED").contains(order.getStatus())) {
            throw new RuntimeException("Cannot submit payment for a terminal B2B order.");
        }
        if ("PAID".equals(order.getPaymentStatus())) throw new RuntimeException("This B2B order is already paid.");

        double amount = req != null && req.getAmount() != null ? req.getAmount() : 0.0;
        double expected = order.getGrandTotal() != null ? order.getGrandTotal() : order.getSubtotal();
        if (Math.abs(amount - expected) > 1.0) throw new RuntimeException("Payment amount must match B2B order total: ₹" + expected);

        String method = req != null && req.getPaymentMethod() != null ? req.getPaymentMethod().trim().toUpperCase() : "MANUAL";
        String reference = req != null ? req.getReference() : null;
        String notes = req != null ? req.getNotes() : null;
        repository.createPayment(orderId, buyerId, order.getSellerId(), order.getShopId(), amount, method, reference, notes);
        repository.updateOrderPaymentStatus(orderId, "PENDING_APPROVAL", reference);
        repository.insertHistory(orderId, order.getStatus(), "PENDING_APPROVAL", "Manual B2B payment submitted", "BUYER", buyerId);
        return getBuyerOrder(buyerId, orderId);
    }

    @Transactional
    public B2BOnlineOrder actionPayment(Long sellerId, Long orderId, B2BPaymentActionRequest req) {
        B2BOnlineOrder order = getSellerOrder(sellerId, orderId);
        if (!"PENDING_APPROVAL".equals(order.getPaymentStatus())) {
            throw new RuntimeException("No B2B payment is pending approval for this order.");
        }
        String action = req != null && req.getAction() != null ? req.getAction().trim().toUpperCase() : "";
        if ("ACCEPT".equals(action) || "APPROVE".equals(action)) {
            int updated = repository.updateLatestPendingPayment(orderId, "APPROVED");
            if (updated == 0) throw new RuntimeException("Pending B2B payment record was not found.");
            repository.updateOrderPaymentStatus(orderId, "PAID", null);
            repository.insertHistory(orderId, order.getStatus(), "PAID", req != null ? req.getNotes() : "Payment approved", "SELLER", sellerId);
        } else if ("REJECT".equals(action)) {
            int updated = repository.updateLatestPendingPayment(orderId, "REJECTED");
            if (updated == 0) throw new RuntimeException("Pending B2B payment record was not found.");
            repository.updateOrderPaymentStatus(orderId, "REJECTED", null);
            repository.insertHistory(orderId, order.getStatus(), "REJECTED", req != null ? req.getNotes() : "Payment rejected", "SELLER", sellerId);
        } else {
            throw new RuntimeException("Invalid payment action. Use ACCEPT or REJECT.");
        }
        return getSellerOrder(sellerId, orderId);
    }

    private void validateStockForConfirmation(B2BOnlineOrder order) {
        for (B2BOnlineOrderItem item : order.getItems()) {
            Map<String, Object> row = repository.findOrderableProduct(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductTitle()));
            int stock = integer(row.get("stock_qty"));
            if (stock < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + item.getProductTitle() + ". Available: " + stock);
            }
        }
    }

    private String validateProductRow(Map<String, Object> row, Long buyerId, Long expectedShopId, Integer quantity) {
        Long shopId = num(row.get("shop_id"));
        Long sellerId = num(row.get("seller_id"));
        if (!Objects.equals(shopId, expectedShopId)) return "Product does not belong to the selected seller shop.";
        if (Objects.equals(sellerId, buyerId)) return "You cannot place a B2B order for your own product.";
        if (!"merchant".equalsIgnoreCase(str(row.get("seller_category"), ""))) return "Product seller is not a B2B merchant.";
        if (!bool(row.get("seller_active"))) return "Seller account is inactive.";
        if (!"ACTIVE".equalsIgnoreCase(str(row.get("shop_status"), ""))) return "Seller shop is inactive.";
        String serviceMode = str(row.get("service_mode"), "OFFLINE").toUpperCase();
        if (!Set.of("ONLINE", "BOTH").contains(serviceMode)) return "Seller shop is not online-enabled.";
        if (!bool(row.get("is_active"))) return "Product is inactive.";
        if (!bool(row.get("online_delivery"))) return "Product is not enabled for online delivery.";
        int stock = integer(row.get("stock_qty"));
        if (stock <= 0) return "Product is out of stock.";
        if (stock < quantity) return "Insufficient stock. Available: " + stock;
        return null;
    }

    private void deduct(B2BOnlineOrder order) {
        for (B2BOnlineOrderItem item : order.getItems()) repository.deductStock(item.getProductId(), item.getQuantity());
    }

    private void replenish(B2BOnlineOrder order) {
        for (B2BOnlineOrderItem item : order.getItems()) repository.replenishStock(item.getProductId(), item.getQuantity());
    }

    private void require(String current, String expected, String message) {
        if (!expected.equals(current)) throw new RuntimeException(message);
    }

    private CartValidationResponse invalid(Long shopId, String shopName, String message, List<CartItemResponse> items, Double total) {
        return CartValidationResponse.builder()
                .shopId(shopId)
                .shopName(shopName)
                .isDeliverable(true)
                .subTotal(total)
                .deliveryFee(0.0)
                .minOrderValue(0.0)
                .total(total)
                .items(items)
                .isValid(false)
                .message(message)
                .build();
    }

    private CartItemResponse unavailable(Long productId, String title, Integer quantity, String message) {
        return CartItemResponse.builder()
                .productId(productId)
                .title(title)
                .price(0.0)
                .quantity(quantity)
                .subTotal(0.0)
                .isAvailable(false)
                .message(message)
                .build();
    }

    private Long num(Object value) {
        return value instanceof Number ? ((Number) value).longValue() : null;
    }

    private int integer(Object value) {
        return value instanceof Number ? ((Number) value).intValue() : 0;
    }

    private double dbl(Object value) {
        return value instanceof Number ? ((Number) value).doubleValue() : 0.0;
    }

    private Double dblOrNull(Object value) {
        if (value == null) return null;
        return value instanceof Number ? ((Number) value).doubleValue() : null;
    }

    private boolean bool(Object value) {
        return value instanceof Boolean ? (Boolean) value : Boolean.parseBoolean(String.valueOf(value));
    }

    private String str(Object value, String fallback) {
        return value != null ? value.toString() : fallback;
    }
}