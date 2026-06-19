package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.OnlineOrder;
import com.trikonekt.captain.repository.OrderRepository;
import com.trikonekt.captain.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Handles UPI / payment gateway webhook callbacks.
 *
 * Flow:
 *   1. Consumer hits "Pay Now" → frontend generates UPI deep-link:
 *        upi://pay?pa=trikonekt.payments@upi&pn=Trikonekt&am={amount}&tr={order_number}
 *   2. After UPI app completes (or fails), the payment gateway calls back:
 *        POST /api/payments/verify   (success)
 *        POST /api/payments/failure  (failure)
 *
 * Both endpoints are public (no JWT) because they are called by the payment gateway,
 * not the browser. They are secured by verifying the order_number + amount match.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentWebhookController {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public PaymentWebhookController(OrderRepository orderRepository, OrderService orderService) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    /**
     * POST /api/payments/verify
     * Called by the payment gateway on successful UPI transaction.
     *
     * Expected body:
     * {
     *   "order_number": "TKT-20260619-A3F7B2",
     *   "transaction_ref": "UPI_TXN_123456",
     *   "amount_paid": 549.00,
     *   "status": "SUCCESS"
     * }
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> handlePaymentSuccess(
            @RequestBody Map<String, Object> payload) {

        String orderNumber = (String) payload.get("order_number");
        String transactionRef = (String) payload.get("transaction_ref");
        Object amountObj = payload.get("amount_paid");
        String gatewayStatus = (String) payload.get("status");

        if (orderNumber == null || orderNumber.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "order_number is required"));
        }

        OnlineOrder order = orderRepository.findOrderByOrderNumber(orderNumber)
                .orElse(null);

        if (order == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Order not found: " + orderNumber));
        }

        // Only process if order is in DRAFT or PAYMENT_PENDING
        String currentStatus = order.getStatus();
        if (!"DRAFT".equals(currentStatus) && !"PAYMENT_PENDING".equals(currentStatus)) {
            return ResponseEntity.ok(Map.of(
                    "message", "Order already processed. Current status: " + currentStatus,
                    "order_number", orderNumber
            ));
        }

        if ("SUCCESS".equalsIgnoreCase(gatewayStatus)) {
            // Verify amount matches grand total (within ₹1 tolerance for rounding)
            double amountPaid = amountObj != null ? ((Number) amountObj).doubleValue() : 0.0;
            double expected = order.getGrandTotal() != null ? order.getGrandTotal() : order.getTotal();
            if (Math.abs(amountPaid - expected) > 1.0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Amount mismatch. Expected: " + expected + ", Received: " + amountPaid
                ));
            }

            // Record payment reference and transition to PENDING_CONFIRMATION (awaiting merchant)
            orderRepository.setPaymentRef(order.getId(), transactionRef);
            orderRepository.updateOrderStatus(order.getId(), "PENDING_CONFIRMATION", "PAID");
            orderRepository.insertStatusHistory(order.getId(), "PENDING_CONFIRMATION",
                    "Payment verified. Ref: " + transactionRef, "PAYMENT_GATEWAY");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "order_number", orderNumber,
                    "new_status", "PENDING_CONFIRMATION",
                    "transaction_ref", transactionRef != null ? transactionRef : ""
            ));
        }

        // Non-SUCCESS gateway response — treat as failure
        return handlePaymentFailureInternal(order, "Gateway returned status: " + gatewayStatus);
    }

    /**
     * POST /api/payments/failure
     * Called by the payment gateway on failed / rejected UPI transaction.
     *
     * Expected body:
     * {
     *   "order_number": "TKT-20260619-A3F7B2",
     *   "reason": "USER_DECLINED"
     * }
     */
    @PostMapping("/failure")
    public ResponseEntity<Map<String, Object>> handlePaymentFailure(
            @RequestBody Map<String, Object> payload) {

        String orderNumber = (String) payload.get("order_number");
        String reason = (String) payload.getOrDefault("reason", "PAYMENT_FAILED");

        if (orderNumber == null || orderNumber.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "order_number is required"));
        }

        OnlineOrder order = orderRepository.findOrderByOrderNumber(orderNumber).orElse(null);

        if (order == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Order not found: " + orderNumber));
        }

        return handlePaymentFailureInternal(order, reason);
    }

    /**
     * GET /api/payments/status/{orderNumber}
     * Consumer polls this after returning from UPI app to get the outcome.
     * Used as a manual fallback in case the gateway webhook is delayed.
     */
    @GetMapping("/status/{orderNumber}")
    public ResponseEntity<Map<String, Object>> pollPaymentStatus(
            @PathVariable String orderNumber) {

        OnlineOrder order = orderRepository.findOrderByOrderNumber(orderNumber).orElse(null);

        if (order == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", "Order not found: " + orderNumber));
        }

        return ResponseEntity.ok(Map.of(
                "order_number", orderNumber,
                "order_status", order.getStatus(),
                "payment_status", order.getPaymentStatus(),
                "grand_total", order.getGrandTotal() != null ? order.getGrandTotal() : order.getTotal()
        ));
    }

    // ─── Internal helper ────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> handlePaymentFailureInternal(OnlineOrder order, String reason) {
        String current = order.getStatus();

        // Release leases and return to DRAFT only if not already terminal
        if (!"CANCELLED".equals(current) && !"COMPLETED".equals(current)) {
            orderRepository.clearUserTemporaryLeases(order.getUserId());
            orderRepository.updateOrderStatus(order.getId(), "DRAFT", "FAILED");
            orderRepository.insertStatusHistory(order.getId(), "DRAFT",
                    "Payment failed: " + reason, "PAYMENT_GATEWAY");
        }

        return ResponseEntity.ok(Map.of(
                "success", false,
                "order_number", order.getOrderNumber(),
                "new_status", "DRAFT",
                "reason", reason
        ));
    }
}
