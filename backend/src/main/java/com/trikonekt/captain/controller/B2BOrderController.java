package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.*;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.B2BOrderService;
import com.trikonekt.captain.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/captain/business")
public class B2BOrderController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final B2BOrderService b2bOrderService;

    public B2BOrderController(JwtService jwtService, UserRepository userRepository, B2BOrderService b2bOrderService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.b2bOrderService = b2bOrderService;
    }

    @PostMapping("/cart/validate")
    public ResponseEntity<CartValidationResponse> validateCart(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody CartValidationRequest req) {
        Long buyerId = extractBusinessBuyerId(auth);
        return ResponseEntity.ok(b2bOrderService.validateCart(buyerId, req));
    }

    @PostMapping("/orders")
    public ResponseEntity<B2BOnlineOrder> createOrder(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody CreateB2BOrderRequest req) {
        Long buyerId = extractBusinessBuyerId(auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(b2bOrderService.placeOrder(buyerId, req));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<B2BOnlineOrder>> listBuyerOrders(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        Long buyerId = extractBusinessBuyerId(auth);
        return ResponseEntity.ok(b2bOrderService.listBuyerOrders(buyerId));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<B2BOnlineOrder> getBuyerOrder(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable("id") Long orderId) {
        Long buyerId = extractBusinessBuyerId(auth);
        return ResponseEntity.ok(b2bOrderService.getBuyerOrder(buyerId, orderId));
    }

    @PostMapping("/orders/{id}/cancel")
    public ResponseEntity<B2BOnlineOrder> cancelBuyerOrder(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable("id") Long orderId,
            @RequestBody(required = false) OrderStateTransitionRequest req) {
        Long buyerId = extractBusinessBuyerId(auth);
        String reason = req != null ? req.getCancellationReason() : null;
        return ResponseEntity.ok(b2bOrderService.cancelBuyerOrder(buyerId, orderId, reason));
    }

    @PostMapping("/orders/{id}/payment")
    public ResponseEntity<B2BOnlineOrder> submitPayment(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable("id") Long orderId,
            @RequestBody B2BPaymentRequest req) {
        Long buyerId = extractBusinessBuyerId(auth);
        return ResponseEntity.ok(b2bOrderService.submitPayment(buyerId, orderId, req));
    }

    @GetMapping("/seller/orders")
    public ResponseEntity<List<B2BOnlineOrder>> listSellerOrders(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        Long sellerId = extractMerchantSellerId(auth);
        return ResponseEntity.ok(b2bOrderService.listSellerOrders(sellerId));
    }

    @GetMapping("/seller/orders/{id}")
    public ResponseEntity<B2BOnlineOrder> getSellerOrder(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable("id") Long orderId) {
        Long sellerId = extractMerchantSellerId(auth);
        return ResponseEntity.ok(b2bOrderService.getSellerOrder(sellerId, orderId));
    }

    @PostMapping("/seller/orders/{id}/transition")
    public ResponseEntity<B2BOnlineOrder> transitionSellerOrder(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable("id") Long orderId,
            @RequestBody OrderStateTransitionRequest req) {
        Long sellerId = extractMerchantSellerId(auth);
        return ResponseEntity.ok(b2bOrderService.transitionSellerOrder(sellerId, orderId, req));
    }

    @PostMapping("/seller/orders/{id}/payment/action")
    public ResponseEntity<B2BOnlineOrder> actionPayment(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable("id") Long orderId,
            @RequestBody B2BPaymentActionRequest req) {
        Long sellerId = extractMerchantSellerId(auth);
        return ResponseEntity.ok(b2bOrderService.actionPayment(sellerId, orderId, req));
    }

    private Long extractBusinessBuyerId(String auth) {
        Map<String, Object> user = extractBusinessUser(auth);
        String category = String.valueOf(user.getOrDefault("category", ""));
        if (!"merchant".equalsIgnoreCase(category) && !"business".equalsIgnoreCase(category)) {
            throw new RuntimeException("Only business or merchant accounts can place B2B marketplace orders.");
        }
        return ((Number) user.get("id")).longValue();
    }

    private Long extractMerchantSellerId(String auth) {
        Map<String, Object> user = extractBusinessUser(auth);
        String category = String.valueOf(user.getOrDefault("category", ""));
        if (!"merchant".equalsIgnoreCase(category)) {
            throw new RuntimeException("Only B2B merchant seller accounts can process B2B orders.");
        }
        return ((Number) user.get("id")).longValue();
    }

    private Map<String, Object> extractBusinessUser(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = auth.substring(7);
        String username = jwtService.extractUsername(token);
        Map<String, Object> user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Object active = user.get("is_active");
        if (active instanceof Boolean && !((Boolean) active)) {
            throw new RuntimeException("Business account is inactive.");
        }
        return user;
    }
}