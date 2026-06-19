package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.OnlineOrder;
import com.trikonekt.captain.model.OrderStateTransitionRequest;
import com.trikonekt.captain.model.ShopResponse;
import com.trikonekt.captain.repository.OrderRepository;
import com.trikonekt.captain.repository.ShopRepository;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.JwtService;
import com.trikonekt.captain.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/captain/merchant/shops/{shopId}/orders")
public class MerchantOrderController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public MerchantOrderController(JwtService jwtService, UserRepository userRepository,
                                   ShopRepository shopRepository, OrderRepository orderRepository,
                                   OrderService orderService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            Map<String, Object> user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            Object idObj = user.get("id");
            if (idObj == null) {
                throw new RuntimeException("User ID not found in database");
            }
            return ((Number) idObj).longValue();
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired token: " + e.getMessage());
        }
    }

    private ShopResponse verifyShopOwnership(Long shopId, Long merchantId) {
        return shopRepository.findShopByIdAndMerchantId(shopId, merchantId)
                .orElseThrow(() -> new RuntimeException("Shop not found or not owned by you."));
    }

    /**
     * GET /captain/merchant/shops/{shopId}/orders
     * Fetch all delivery orders assigned to this shop.
     */
    @GetMapping
    public ResponseEntity<List<OnlineOrder>> listShopOrders(
            @PathVariable Long shopId,
            @RequestHeader("Authorization") String authHeader) {
        Long merchantId = extractUserIdFromToken(authHeader);
        ShopResponse shop = verifyShopOwnership(shopId, merchantId);

        List<OnlineOrder> orders = orderRepository.findOrdersByShopId(shop.getId());
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /captain/merchant/shops/{shopId}/orders/{id}
     * Get specific delivery order details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OnlineOrder> getShopOrder(
            @PathVariable Long shopId,
            @PathVariable("id") Long orderId,
            @RequestHeader("Authorization") String authHeader) {
        Long merchantId = extractUserIdFromToken(authHeader);
        ShopResponse shop = verifyShopOwnership(shopId, merchantId);

        OnlineOrder order = orderRepository.findOrderById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found."));

        if (!order.getShopId().equals(shop.getId())) {
            throw new RuntimeException("Unauthorized. Order belongs to a different shop.");
        }

        return ResponseEntity.ok(order);
    }

    /**
     * POST /captain/merchant/shops/{shopId}/orders/{id}/transition
     * Seamless transaction between order processing states.
     */
    @PostMapping("/{id}/transition")
    public ResponseEntity<OnlineOrder> transitionOrderState(
            @PathVariable Long shopId,
            @PathVariable("id") Long orderId,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody OrderStateTransitionRequest req) {

        Long merchantId = extractUserIdFromToken(authHeader);
        ShopResponse shop = verifyShopOwnership(shopId, merchantId);

        if (req.getStatus() == null || req.getStatus().isBlank()) {
            throw new RuntimeException("Target status state is required.");
        }

        OnlineOrder updatedOrder = orderService.transitionOrderStatus(
                orderId,
                req.getStatus().trim().toUpperCase(),
                null,
                shop.getId(),
                req
        );

        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * GET /captain/merchant/shops/{shopId}/orders/unconfirmed-sound-poll
     * Real-time lightweight poll endpoint. Returns a count of PENDING_CONFIRMATION orders
     * to trigger local sound synthesis alerts on the Merchant's screen.
     */
    @GetMapping("/unconfirmed-sound-poll")
    public ResponseEntity<Map<String, Object>> pollUnconfirmedOrders(
            @PathVariable Long shopId,
            @RequestHeader("Authorization") String authHeader) {
        Long merchantId = extractUserIdFromToken(authHeader);
        ShopResponse shop = verifyShopOwnership(shopId, merchantId);

        List<OnlineOrder> orders = orderRepository.findOrdersByShopId(shop.getId());
        List<Long> unconfirmedIds = orders.stream()
                .filter(o -> "PENDING_CONFIRMATION".equalsIgnoreCase(o.getStatus()))
                .map(OnlineOrder::getId)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("shop_id", shop.getId());
        result.put("unconfirmed_count", unconfirmedIds.size());
        result.put("unconfirmed_order_ids", unconfirmedIds);
        result.put("trigger_sound_alert", !unconfirmedIds.isEmpty());

        return ResponseEntity.ok(result);
    }
}
