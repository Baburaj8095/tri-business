package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.CreateShopRequest;
import com.trikonekt.captain.model.MerchantProfileResponse;
import com.trikonekt.captain.model.ShopProductResponse;
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
     * POST /api/captain/merchant/shops/
     * Create a new shop (authenticated)
     */
    @PostMapping("/shops")
    public ResponseEntity<Map<String, Object>> createShop(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody CreateShopRequest request
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        Map<String, Object> response = shopService.createShop(userId, request);
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
}
