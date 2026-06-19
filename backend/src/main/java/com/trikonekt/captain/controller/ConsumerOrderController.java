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
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class ConsumerOrderController {

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
     */
    @PostMapping
    public ResponseEntity<OnlineOrder> placeOrder(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateOrderRequest req) {
        Long userId = getUserIdFromToken(authHeader);
        OnlineOrder order = orderService.placeOrder(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * GET /api/orders
     * Fetch list of orders submitted by the logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<OnlineOrder>> getMyOrders(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
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
}
