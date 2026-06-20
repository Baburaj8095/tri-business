package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.OfflinePaymentRequest;
import com.trikonekt.captain.model.OfflinePaymentActionRequest;
import com.trikonekt.captain.model.OfflinePaymentResponse;
import com.trikonekt.captain.model.OnlineOrder;
import com.trikonekt.captain.repository.OfflinePaymentRepository;
import com.trikonekt.captain.repository.OrderRepository;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/captain")
public class OfflinePaymentController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final OfflinePaymentRepository offlinePaymentRepository;
    private final OrderRepository orderRepository;

    public OfflinePaymentController(JwtService jwtService, UserRepository userRepository,
                                    OfflinePaymentRepository offlinePaymentRepository,
                                    OrderRepository orderRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.offlinePaymentRepository = offlinePaymentRepository;
        this.orderRepository = orderRepository;
    }

    private String getUsernameFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized. No token provided.");
        }
        String token = authHeader.substring(7);
        return jwtService.extractUsername(token);
    }

    private OfflinePaymentResponse mapToResponse(Map<String, Object> row) {
        LocalDateTime createdAt = null;
        if (row.get("created_at") != null) {
            if (row.get("created_at") instanceof java.sql.Timestamp) {
                createdAt = ((java.sql.Timestamp) row.get("created_at")).toLocalDateTime();
            } else if (row.get("created_at") instanceof LocalDateTime) {
                createdAt = (LocalDateTime) row.get("created_at");
            }
        }

        LocalDateTime updatedAt = null;
        if (row.get("updated_at") != null) {
            if (row.get("updated_at") instanceof java.sql.Timestamp) {
                updatedAt = ((java.sql.Timestamp) row.get("updated_at")).toLocalDateTime();
            } else if (row.get("updated_at") instanceof LocalDateTime) {
                updatedAt = (LocalDateTime) row.get("updated_at");
            }
        }

        return OfflinePaymentResponse.builder()
            .id(((Number) row.get("id")).longValue())
            .refId((String) row.get("ref_id"))
            .consumerId(((Number) row.get("consumer_id")).longValue())
            .consumerName((String) row.get("consumer_name"))
            .consumerPhone((String) row.get("consumer_phone"))
            .shopId(((Number) row.get("shop_id")).longValue())
            .shopName((String) row.get("shop_name"))
            .onlineOrderId(row.get("online_order_id") != null ? ((Number) row.get("online_order_id")).longValue() : null)
            .amount((BigDecimal) row.get("amount"))
            .paymentMethod((String) row.get("payment_method"))
            .status((String) row.get("status"))
            .createdAt(createdAt)
            .updatedAt(updatedAt)
            .build();
    }

    /**
     * POST /api/captain/offline-payments
     * Initiates a manual/offline payment from a consumer to a shop.
     */
    @PostMapping("/offline-payments")
    @Transactional
    public ResponseEntity<OfflinePaymentResponse> initiatePayment(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody OfflinePaymentRequest req) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> consumer = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Consumer not found: " + username));

        long consumerId = ((Number) consumer.get("id")).longValue();

        if (req.getShopId() == null || req.getShopId() <= 0) {
            throw new RuntimeException("Valid shop ID is required");
        }
        if (req.getAmount() == null || req.getAmount().compareTo(BigDecimal.TEN) < 0) {
            throw new RuntimeException("Amount must be at least ₹10");
        }
        if (!offlinePaymentRepository.existsActiveShopById(req.getShopId())) {
            throw new RuntimeException("Shop not found or inactive");
        }

        OnlineOrder linkedOrder = null;
        if (req.getOnlineOrderId() != null) {
            linkedOrder = orderRepository.findOrderByIdAndUserId(req.getOnlineOrderId(), consumerId)
                    .orElseThrow(() -> new RuntimeException("Delivery order not found or unauthorized."));

            if (!req.getShopId().equals(linkedOrder.getShopId())) {
                throw new RuntimeException("Payment shop does not match delivery order shop.");
            }
            if (!"NEARBY_DELIVERY".equalsIgnoreCase(linkedOrder.getOrderChannel())) {
                throw new RuntimeException("Only Near Store delivery orders can use linked offline payment.");
            }
            if (!"COMPLETED".equalsIgnoreCase(linkedOrder.getStatus())) {
                throw new RuntimeException("Pay Store settlement is available after delivery is completed.");
            }
            if ("PAID".equalsIgnoreCase(linkedOrder.getPaymentStatus())) {
                throw new RuntimeException("This delivery order is already paid.");
            }
            if (linkedOrder.getOfflinePaymentId() != null) {
                throw new RuntimeException("This delivery order already has a linked Pay Store payment.");
            }
            if (offlinePaymentRepository.getPendingPaymentByOnlineOrderId(linkedOrder.getId()).isPresent()) {
                throw new RuntimeException("A pending Pay Store payment already exists for this delivery order.");
            }

            BigDecimal orderTotal = BigDecimal.valueOf(linkedOrder.getGrandTotal() != null ? linkedOrder.getGrandTotal() : linkedOrder.getTotal());
            if (req.getAmount().compareTo(orderTotal) != 0) {
                throw new RuntimeException("Payment amount must match delivery order total: ₹" + orderTotal);
            }
        }

        String paymentMethod = req.getPaymentMethod();
        if (paymentMethod == null || paymentMethod.isBlank()) {
            paymentMethod = "MANUAL";
        }
        paymentMethod = paymentMethod.trim().toUpperCase();
        if (!"MANUAL".equals(paymentMethod) && !"RAZORPAY".equals(paymentMethod)) {
            throw new RuntimeException("Invalid payment method");
        }
        
        // Generate unique Ref ID: Payment-YYYYMMDDHHMMSS-RAND5
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int rand = 10000 + new Random().nextInt(90000);
        String refId = "Payment-" + timestamp + "-" + rand;

        long paymentId = offlinePaymentRepository.createPayment(
            refId,
            consumerId,
            req.getShopId(),
            req.getAmount(),
            paymentMethod,
            "PENDING",
            linkedOrder != null ? linkedOrder.getId() : null
        );

        if (linkedOrder != null) {
            orderRepository.linkOfflinePayment(linkedOrder.getId(), paymentId, "PENDING_OFFLINE_APPROVAL");
            orderRepository.insertStatusHistory(linkedOrder.getId(), "PAYMENT_PENDING_APPROVAL", "Pay Store offline payment submitted", "CONSUMER");
        }

        Map<String, Object> paymentRow = offlinePaymentRepository.getPaymentById(paymentId)
            .orElseThrow(() -> new RuntimeException("Failed to retrieve payment after insertion"));

        return ResponseEntity.ok(mapToResponse(paymentRow));
    }

    /**
     * GET /api/captain/offline-payments
     * Lists all payments initiated by the logged-in consumer.
     */
    @GetMapping("/offline-payments")
    public ResponseEntity<List<OfflinePaymentResponse>> getConsumerPayments(
            @RequestHeader("Authorization") String authHeader) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        long consumerId = ((Number) user.get("id")).longValue();
        List<Map<String, Object>> rows = offlinePaymentRepository.getPaymentsByConsumerId(consumerId);
        List<OfflinePaymentResponse> response = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            response.add(mapToResponse(row));
        }
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/captain/offline-payments/merchant
     * Lists all offline payments (PENDING and past history) for the logged-in merchant.
     */
    @GetMapping("/offline-payments/merchant")
    public ResponseEntity<List<OfflinePaymentResponse>> getMerchantPayments(
            @RequestHeader("Authorization") String authHeader) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        long merchantId = ((Number) user.get("id")).longValue();
        List<Map<String, Object>> rows = offlinePaymentRepository.getAllPaymentsForMerchant(merchantId);
        List<OfflinePaymentResponse> response = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            response.add(mapToResponse(row));
        }
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/captain/offline-payments/{id}/action
     * Allows a merchant to accept or reject a pending offline payment.
     */
    @PostMapping("/offline-payments/{id}/action")
    @Transactional
    public ResponseEntity<Map<String, String>> handlePaymentAction(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") long id,
            @RequestBody OfflinePaymentActionRequest req) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> merchant = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Merchant not found: " + username));
        long merchantId = ((Number) merchant.get("id")).longValue();

        Map<String, Object> payment = offlinePaymentRepository.getPaymentById(id)
            .orElseThrow(() -> new RuntimeException("Payment record not found: " + id));

        String status = (String) payment.get("status");
        if (!"PENDING".equalsIgnoreCase(status)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payment is already processed"));
        }

        // Verify that the merchant owns the shop
        long shopId = ((Number) payment.get("shop_id")).longValue();
        if (!offlinePaymentRepository.isShopOwnedByMerchant(shopId, merchantId)) {
            return ResponseEntity.status(403).body(Map.of(
                "message", "You are not authorized to action this payment"
            ));
        }

        if (req.getAction() == null || req.getAction().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Action is required"));
        }
        String action = req.getAction().trim().toUpperCase();
        
        // Accept or Reject action
        if ("ACCEPT".equals(action)) {
            int updated = offlinePaymentRepository.updatePaymentStatusIfPending(id, "APPROVED");
            if (updated == 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Payment is already processed"));
            }

            Long linkedOrderId = payment.get("online_order_id") != null ? ((Number) payment.get("online_order_id")).longValue() : null;
            if (linkedOrderId != null) {
                orderRepository.updateOrderPaymentStatus(linkedOrderId, "PAID");
                orderRepository.insertStatusHistory(linkedOrderId, "PAYMENT_APPROVED", "Linked Pay Store payment approved by merchant", "MERCHANT");
            }

            // Calculate cashback commission
            BigDecimal amount = (BigDecimal) payment.get("amount");
            BigDecimal discountPercent = BigDecimal.valueOf(5); // default 5%
            if (payment.get("discount_percent") != null) {
                Object discountObj = payment.get("discount_percent");
                if (discountObj instanceof BigDecimal) {
                    discountPercent = (BigDecimal) discountObj;
                } else if (discountObj instanceof Number) {
                    discountPercent = BigDecimal.valueOf(((Number) discountObj).doubleValue());
                }
            }
            BigDecimal cashback = amount.multiply(discountPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (cashback.compareTo(BigDecimal.ZERO) < 0) {
                cashback = BigDecimal.ZERO;
            }

            // Credit the consumer's wallet
            long consumerId = ((Number) payment.get("consumer_id")).longValue();
            offlinePaymentRepository.createWalletIfMissing(consumerId);
            Optional<Map<String, Object>> walletOpt = offlinePaymentRepository.getWalletByUserId(consumerId);
            if (walletOpt.isPresent()) {
                Map<String, Object> wallet = walletOpt.get();
                BigDecimal currentBalance = (BigDecimal) wallet.get("balance");
                BigDecimal currentMain = (BigDecimal) wallet.get("main_balance");
                BigDecimal currentWithdrawable = (BigDecimal) wallet.get("withdrawable_balance");

                BigDecimal newBalance = currentBalance.add(cashback);
                BigDecimal newMain = currentMain.add(cashback);
                BigDecimal newWithdrawable = currentWithdrawable.add(cashback);

                offlinePaymentRepository.updateWalletBalance(consumerId, newBalance, newMain, newWithdrawable);
                offlinePaymentRepository.logWalletTransaction(consumerId, cashback, newBalance, (String) payment.get("ref_id"));
            } else {
                // Best-effort if no wallet exists, print warning
                System.err.println("[WARN] No wallet found for consumer ID " + consumerId + ", skipping wallet credit.");
            }

            return ResponseEntity.ok(Map.of(
                "message", "Payment accepted successfully. Cashback credited.",
                "status", "APPROVED"
            ));
        } else if ("REJECT".equals(action)) {
            int updated = offlinePaymentRepository.updatePaymentStatusIfPending(id, "REJECTED");
            if (updated == 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Payment is already processed"));
            }

            Long linkedOrderId = payment.get("online_order_id") != null ? ((Number) payment.get("online_order_id")).longValue() : null;
            if (linkedOrderId != null) {
                orderRepository.updateOrderPaymentStatus(linkedOrderId, "OFFLINE_REJECTED");
                orderRepository.insertStatusHistory(linkedOrderId, "PAYMENT_REJECTED", "Linked Pay Store payment rejected by merchant", "MERCHANT");
            }

            return ResponseEntity.ok(Map.of(
                "message", "Payment rejected successfully.",
                "status", "REJECTED"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid action: " + req.getAction()));
        }
    }
}
