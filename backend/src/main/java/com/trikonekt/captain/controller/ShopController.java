package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.CreateShopRequest;
import com.trikonekt.captain.model.MerchantProfileResponse;
import com.trikonekt.captain.model.MerchantProfileUpdateRequest;
import com.trikonekt.captain.model.ShopResponse;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.JwtService;
import com.trikonekt.captain.service.ShopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Shop & Merchant APIs
 * - Authenticated endpoints: Require Authorization header with JWT token
 * - Public endpoints: No authentication required
 */
@RestController
@RequestMapping("/captain/merchant")
public class ShopController {

    private final ShopService shopService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public ShopController(ShopService shopService, JwtService jwtService, UserRepository userRepository) {
        this.shopService = shopService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    /**
     * Extract user ID from JWT Authorization header
     */
    private Long extractUserIdFromToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
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

    /**
     * GET /api/captain/merchant/shops/
     * Get all shops owned by the authenticated merchant
     */
    @GetMapping("/shops")
    public ResponseEntity<List<ShopResponse>> listMyShops(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        List<ShopResponse> shops = shopService.listMyShops(userId);
        return ResponseEntity.ok(shops);
    }

    /**
     * POST /api/captain/merchant/shops (JSON content-type)
     * Create a new shop (authenticated)
     */
    @PostMapping(value = "/shops", consumes = "application/json")
    public ResponseEntity<Map<String, Object>> createShopJson(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CreateShopRequest request
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        Map<String, Object> response = shopService.createShop(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/captain/merchant/shops (multipart or application/x-www-form-urlencoded content-type)
     * Create a new shop (authenticated)
     */
    @PostMapping(value = "/shops", consumes = {"multipart/form-data", "application/x-www-form-urlencoded"})
    public ResponseEntity<Map<String, Object>> createShopForm(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @ModelAttribute CreateShopRequest request
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        Map<String, Object> response = shopService.createShop(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/captain/merchant/shops/{shopId}
     * Get details of a specific shop owned by the merchant
     */
    @GetMapping("/shops/{shopId}")
    public ResponseEntity<ShopResponse> getMyShopDetail(
            @PathVariable Long shopId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        ShopResponse shop = shopService.getMyShopDetail(userId, shopId);
        return ResponseEntity.ok(shop);
    }

    /**
     * PATCH /api/captain/merchant/shops/{shopId} (JSON content-type)
     * Update details of a specific shop owned by the merchant (authenticated)
     */
    @PatchMapping(value = "/shops/{shopId}", consumes = "application/json")
    public ResponseEntity<Map<String, Object>> updateShopJson(
            @PathVariable Long shopId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CreateShopRequest request
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        Map<String, Object> response = shopService.updateShop(userId, shopId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/captain/merchant/shops/{shopId} (multipart or form content-type)
     * Update details of a specific shop owned by the merchant (authenticated)
     */
    @PatchMapping(value = "/shops/{shopId}", consumes = {"multipart/form-data", "application/x-www-form-urlencoded"})
    public ResponseEntity<Map<String, Object>> updateShopForm(
            @PathVariable Long shopId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @ModelAttribute CreateShopRequest request
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        Map<String, Object> response = shopService.updateShop(userId, shopId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/captain/merchant/shops/{shopId}
     * Delete a specific shop owned by the merchant (authenticated)
     */
    @DeleteMapping("/shops/{shopId}")
    public ResponseEntity<Map<String, Object>> deleteShop(
            @PathVariable Long shopId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        Map<String, Object> response = shopService.deleteShop(userId, shopId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/captain/merchant/profile/
     * Get merchant profile info (authenticated)
     */
    @GetMapping("/profile")
    public ResponseEntity<MerchantProfileResponse> getMerchantProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        MerchantProfileResponse profile = shopService.getMerchantProfile(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * PATCH /api/captain/merchant/profile/
     * Update merchant profile info (authenticated)
     */
    @PatchMapping("/profile")
    public ResponseEntity<MerchantProfileResponse> updateMerchantProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody MerchantProfileUpdateRequest request
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        MerchantProfileResponse profile = shopService.updateMerchantProfile(userId, request);
        return ResponseEntity.ok(profile);
    }
}
