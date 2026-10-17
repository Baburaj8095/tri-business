package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.CartItemRequest;
import com.trikonekt.captain.model.CreateOrderRequest;
import com.trikonekt.captain.model.OnlineOrder;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.JwtService;
import com.trikonekt.captain.service.OrderService;
import com.trikonekt.captain.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({"/orders", "/api/orders"})
public class ConsumerOrderController {

    @Value("${internal.service.secret:}")
    private String internalServiceSecret;

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    public ConsumerOrderController(JwtService jwtService, UserRepository userRepository,
                                   OrderService orderService, OrderRepository orderRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.orderRepository = orderRepository;
    }

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized. No token provided.");
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Map<String, Object> user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found for token: " + username));
        return ((Number) user.get("id")).longValue();
    }

    /**
     * POST /api/orders/lease
     * Acquire a temporary 10-minute lease hold on a collection of products.
     */
    @PostMapping("/lease")
    public ResponseEntity<Map<String, String>> acquireLeaseHold(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody List<CartItemRequest> items) {
        Long userId = getUserIdFromToken(authHeader);
        orderService.holdInventoryLeases(userId, items);
        return ResponseEntity.ok(Map.of("message", "Temporary inventory leases acquired successfully."));
    }

    /**
     * POST /api/orders
     * Places/finalizes an online delivery order.
     * Supports both direct Bearer token and S2S internal secret calls from consumer frontend.
     */
    @PostMapping
    public ResponseEntity<OnlineOrder> placeOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Internal-Secret", required = false) String internalSecret,
            @RequestBody CreateOrderRequest req) {
        Long userId = null;

        if (internalSecret != null && internalServiceSecret != null && !internalServiceSecret.isBlank()
                && internalSecret.trim().equals(internalServiceSecret.trim())) {
            // S2S authorized via internal secret
            if (req.getUserId() != null && req.getUserId() > 0) {
                userId = req.getUserId();
            } else if (req.getConsumerPhone() != null && !req.getConsumerPhone().isBlank()) {
                String cleanPhone = req.getConsumerPhone().replaceAll("\\D", "");
                if (cleanPhone.length() > 10) cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);
                Optional<Map<String, Object>> u = userRepository.findByPhone(cleanPhone);
                if (u.isEmpty()) u = userRepository.findByUsername(cleanPhone);
                if (u.isPresent()) {
                    userId = ((Number) u.get().get("id")).longValue();
                }
            }
            if (userId == null) {
                Optional<Map<String, Object>> rootUser = userRepository.findByUsername("6360445978");
                if (rootUser.isEmpty()) rootUser = userRepository.findByPhone("6360445978");
                userId = rootUser.map(m -> ((Number) m.get("id")).longValue()).orElse(1L);
            }
        } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
            userId = getUserIdFromToken(authHeader);
        } else {
            throw new RuntimeException("Unauthorized. No valid Authorization token or internal secret provided.");
        }

        OnlineOrder order = orderService.placeOrder(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * GET /api/orders
     * Fetch list of orders submitted by the logged-in user or via S2S request.
     */
    @GetMapping
    public ResponseEntity<List<OnlineOrder>> getMyOrders(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Internal-Secret", required = false) String internalSecret,
            @RequestParam(value = "userId", required = false) Long paramUserId) {
        Long userId = null;
        if (internalSecret != null && internalServiceSecret != null && !internalServiceSecret.isBlank()
                && internalSecret.trim().equals(internalServiceSecret.trim())) {
            userId = paramUserId != null ? paramUserId : 1L;
        } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
            userId = getUserIdFromToken(authHeader);
        } else {
            throw new RuntimeException("Unauthorized. No valid Authorization token or internal secret provided.");
        }
        List<OnlineOrder> orders = orderRepository.findOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/orders/{id}
     * Get specific order details owned by the target user.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OnlineOrder> getMyOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long orderId) {
        Long userId = getUserIdFromToken(authHeader);
        OnlineOrder order = orderRepository.findOrderByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found or unauthorized access."));
        return ResponseEntity.ok(order);
    }

    /**
     * POST /api/orders/{id}/cancel
     * Shopper cancellation request.
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OnlineOrder> cancelMyOrder(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long orderId) {
        Long userId = getUserIdFromToken(authHeader);
        OnlineOrder order = orderService.transitionOrderStatus(orderId, "CANCELLED", userId, null);
        return ResponseEntity.ok(order);
    }

    /**
     * POST /api/orders/shiprocket/webhook
     * Public webhook to receive delivery tracking updates from Shiprocket.
     */
    @PostMapping("/shiprocket/webhook")
    public ResponseEntity<Map<String, String>> shiprocketWebhook(@RequestBody Map<String, Object> payload) {
        try {
            String orderNumber = (String) payload.get("order_id");
            String shiprocketStatus = (String) payload.get("current_status");

            if (orderNumber == null || shiprocketStatus == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing order_id or current_status."));
            }

            Optional<OnlineOrder> orderOpt = orderRepository.findOrderByOrderNumber(orderNumber);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Order not found."));
            }

            OnlineOrder order = orderOpt.get();
            String targetStatus = null;
            String statusNorm = shiprocketStatus.toUpperCase();

            if (statusNorm.contains("SHIPPED") || statusNorm.contains("TRANSIT")) {
                targetStatus = "SHIPPED";
            } else if (statusNorm.contains("OUT FOR DELIVERY") || statusNorm.contains("DISPATCHED")) {
                targetStatus = "DISPATCHED";
            } else if (statusNorm.contains("DELIVERED") || statusNorm.contains("COMPLETED")) {
                targetStatus = "COMPLETED";
            } else if (statusNorm.contains("CANCELLED")) {
                targetStatus = "CANCELLED";
            }

            if (targetStatus != null) {
                orderService.transitionOrderStatus(order.getId(), targetStatus, null, null);
            }

            return ResponseEntity.ok(Map.of("status", "success", "message", "Status processed."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to process webhook: " + e.getMessage()));
        }
    }
}
