package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.CaptainProfileResponse;
import com.trikonekt.captain.model.KycUpdateRequest;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.repository.KycRepository;
import com.trikonekt.captain.service.JwtService;
import com.trikonekt.captain.service.CloudinaryService;
import com.trikonekt.captain.model.OnlineOrder;
import com.trikonekt.captain.repository.OrderRepository;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/captain")
public class CaptainProfileController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final KycRepository kycRepository;
    private final CloudinaryService cloudinaryService;
    private final OrderRepository orderRepository;

    public CaptainProfileController(JwtService jwtService, UserRepository userRepository,
                                    KycRepository kycRepository, CloudinaryService cloudinaryService,
                                    OrderRepository orderRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.kycRepository = kycRepository;
        this.cloudinaryService = cloudinaryService;
        this.orderRepository = orderRepository;
    }

    private String getUsernameFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized. No token provided.");
        }
        String token = authHeader.substring(7);
        return jwtService.extractUsername(token);
    }

    /**
     * GET /api/captain/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<CaptainProfileResponse> getProfile(@RequestHeader("Authorization") String authHeader) {
        String username = getUsernameFromToken(authHeader);
        CaptainProfileResponse profile = kycRepository.findProfileByUsername(username)
            .orElseThrow(() -> new RuntimeException("Captain profile not found for user: " + username));
        return ResponseEntity.ok(profile);
    }

    /**
     * PUT /api/captain/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody KycUpdateRequest req) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        long userId = ((Number) user.get("id")).longValue();
        kycRepository.saveOrUpdateKycDetails(userId, req);

        return ResponseEntity.ok(Map.of("message", "KYC and Profile updated successfully."));
    }

    /**
     * POST /api/captain/kyc/documents
     */
    @PostMapping("/kyc/documents")
    public ResponseEntity<Map<String, String>> uploadDocument(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) {
        getUsernameFromToken(authHeader);

        String url = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * GET /api/captain/shops or /api/captain/merchants
     * Lists all merchants and shops onboarded by this Captain or in Captain's assigned territory.
     */
    @GetMapping({"/shops", "/merchants"})
    public ResponseEntity<List<Map<String, Object>>> getCaptainShops(@RequestHeader("Authorization") String authHeader) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Captain user not found: " + username));

        String phone = (String) user.getOrDefault("phone", "");
        String pincode = (String) user.getOrDefault("pincode", "");

        List<Map<String, Object>> shops = userRepository.findShopsForCaptain(username, phone, pincode);
        return ResponseEntity.ok(shops);
    }

    /**
     * GET /api/captain/orders
     * Lists all customer orders placed across all merchants onboarded by this Captain.
     */
    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getCaptainOrders(@RequestHeader("Authorization") String authHeader) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Captain user not found: " + username));

        String phone = (String) user.getOrDefault("phone", "");
        String pincode = (String) user.getOrDefault("pincode", "");

        List<Map<String, Object>> orders = userRepository.findOrdersForCaptain(username, phone, pincode);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/captain/shops/{shopId}/orders
     * Lists all orders placed specifically for this shop.
     */
    @GetMapping("/shops/{shopId}/orders")
    public ResponseEntity<List<OnlineOrder>> getShopOrders(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long shopId) {
        getUsernameFromToken(authHeader);
        List<OnlineOrder> orders = orderRepository.findOrdersByShopId(shopId);
        return ResponseEntity.ok(orders);
    }

    /**
     * GET /api/captain/shops/{shopId}
     * Fetches shop & merchant details for Captain view regardless of shop status (PENDING or ACTIVE).
     */
    @GetMapping("/shops/{shopId}")
    public ResponseEntity<Map<String, Object>> getShopDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long shopId) {
        getUsernameFromToken(authHeader);
        return userRepository.findShopKycDetails(shopId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * GET /api/captain/shops/{shopId}/kyc
     * Fetches the merchant KYC verification documents and approval details for a shop.
     */
    @GetMapping("/shops/{shopId}/kyc")
    public ResponseEntity<Map<String, Object>> getShopKyc(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long shopId) {
        getUsernameFromToken(authHeader);
        return userRepository.findShopKycDetails(shopId)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.ok(Map.of(
                "shop_id", shopId,
                "kyc_status", "NOT_SUBMITTED",
                "message", "Merchant has not submitted KYC documents yet."
            )));
    }

    /**
     * POST /api/captain/shops/{shopId}/approve
     * Approves a shop onboarding request and activates Prime status and verified KYC on the merchant.
     */
    @PostMapping("/shops/{shopId}/approve")
    public ResponseEntity<Map<String, Object>> approveShop(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long shopId) {
        getUsernameFromToken(authHeader);

        boolean success = userRepository.approveShopByCaptain(shopId);
        if (!success) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Shop not found or already verified."
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "status", "ACTIVE",
            "message", "Shop & KYC successfully verified and approved! Merchant store is now live."
        ));
    }

    /**
     * POST /api/captain/shops/{shopId}/reject
     * Rejects a shop onboarding request and sets KYC status to REJECTED with feedback.
     */
    @PostMapping("/shops/{shopId}/reject")
    public ResponseEntity<Map<String, Object>> rejectShop(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long shopId,
            @RequestBody(required = false) Map<String, String> body) {
        getUsernameFromToken(authHeader);
        String reason = (body != null && body.containsKey("reason"))
            ? body.get("reason")
            : "KYC documents require review and resubmission.";

        boolean success = userRepository.rejectShopByCaptain(shopId, reason);
        if (!success) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Shop not found."
            ));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "status", "REJECTED",
            "message", "Shop registration marked as rejected. Merchant notified to update documents."
        ));
    }

    /**
     * GET /api/captain/daily-business
     * Summarizes daily business performance with real DB orders and GMV for Captain.
     */
    @GetMapping("/daily-business")
    public ResponseEntity<Map<String, Object>> getDailyBusiness(@RequestHeader("Authorization") String authHeader) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Captain user not found: " + username));

        String phone = (String) user.getOrDefault("phone", "");
        String pincode = (String) user.getOrDefault("pincode", "");

        List<Map<String, Object>> shops = userRepository.findShopsForCaptain(username, phone, pincode);
        List<Map<String, Object>> orders = userRepository.findOrdersForCaptain(username, phone, pincode);

        long activeShopsCount = shops.stream()
            .filter(s -> "ACTIVE".equalsIgnoreCase((String) s.get("status")))
            .count();
        long pendingShopsCount = shops.stream()
            .filter(s -> !"ACTIVE".equalsIgnoreCase((String) s.get("status")))
            .count();

        long onlineB2bCount = shops.stream()
            .filter(s -> "ONLINE".equalsIgnoreCase((String) s.get("service_mode")) && "merchant".equalsIgnoreCase((String) s.get("merchant_category")))
            .count();
        long onlineB2cCount = shops.stream()
            .filter(s -> "ONLINE".equalsIgnoreCase((String) s.get("service_mode")) && !"merchant".equalsIgnoreCase((String) s.get("merchant_category")))
            .count();
        long offlineB2bCount = shops.stream()
            .filter(s -> !"ONLINE".equalsIgnoreCase((String) s.get("service_mode")) && "merchant".equalsIgnoreCase((String) s.get("merchant_category")))
            .count();
        long offlineB2cCount = shops.stream()
            .filter(s -> !"ONLINE".equalsIgnoreCase((String) s.get("service_mode")) && !"merchant".equalsIgnoreCase((String) s.get("merchant_category")))
            .count();

        double totalGmv = orders.stream()
            .mapToDouble(o -> {
                Object totalObj = o.get("grand_total");
                return totalObj instanceof Number ? ((Number) totalObj).doubleValue() : 0.0;
            })
            .sum();

        return ResponseEntity.ok(Map.of(
            "totalShops", shops.size(),
            "activeShops", activeShopsCount,
            "pendingShops", pendingShopsCount,
            "pincode", pincode != null ? pincode : "",
            "onlineB2bShops", onlineB2bCount,
            "onlineB2cShops", onlineB2cCount,
            "offlineB2bShops", offlineB2bCount,
            "offlineB2cShops", offlineB2cCount,
            "todayOrdersCount", orders.size(),
            "todayGmvEstimate", totalGmv
        ));
    }
}
