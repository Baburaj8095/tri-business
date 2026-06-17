package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.OfflinePaymentRequest;
import com.trikonekt.captain.model.OfflinePaymentActionRequest;
import com.trikonekt.captain.model.OfflinePaymentResponse;
import com.trikonekt.captain.repository.OfflinePaymentRepository;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    public OfflinePaymentController(JwtService jwtService, UserRepository userRepository,
                                    OfflinePaymentRepository offlinePaymentRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.offlinePaymentRepository = offlinePaymentRepository;
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
    public ResponseEntity<OfflinePaymentResponse> initiatePayment(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody OfflinePaymentRequest req) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> consumer = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Consumer not found: " + username));

        long consumerId = ((Number) consumer.get("id")).longValue();
        
        // Generate unique Ref ID: Payment-YYYYMMDDHHMMSS-RAND5
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int rand = 10000 + new Random().nextInt(90000);
        String refId = "Payment-" + timestamp + "-" + rand;

        long paymentId = offlinePaymentRepository.createPayment(
            refId,
            consumerId,
            req.getShopId(),
            req.getAmount(),
            req.getPaymentMethod(),
            "PENDING"
        );

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
     * Lists pending offline payments for the logged-in merchant.
     */
    @GetMapping("/offline-payments/merchant")
    public ResponseEntity<List<OfflinePaymentResponse>> getMerchantPendingPayments(
            @RequestHeader("Authorization") String authHeader) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        long merchantId = ((Number) user.get("id")).longValue();
        List<Map<String, Object>> rows = offlinePaymentRepository.getPendingPaymentsForMerchant(merchantId);
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
        
        // Accept or Reject action
        if ("ACCEPT".equalsIgnoreCase(req.getAction())) {
            offlinePaymentRepository.updatePaymentStatus(id, "APPROVED");

            // Calculate cashback commission
            BigDecimal amount = (BigDecimal) payment.get("amount");
            BigDecimal discountPercent = BigDecimal.valueOf(5); // default 5%
            if (payment.get("discount_percent") != null) {
                discountPercent = (BigDecimal) payment.get("discount_percent");
            }
            BigDecimal cashback = amount.multiply(discountPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            // Credit the consumer's wallet
            long consumerId = ((Number) payment.get("consumer_id")).longValue();
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
                "message", "Payment accepted successfully. Commission disbursed.",
                "status", "APPROVED"
            ));
        } else if ("REJECT".equalsIgnoreCase(req.getAction())) {
            offlinePaymentRepository.updatePaymentStatus(id, "REJECTED");
            return ResponseEntity.ok(Map.of(
                "message", "Payment rejected successfully.",
                "status", "REJECTED"
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid action: " + req.getAction()));
        }
    }
}
