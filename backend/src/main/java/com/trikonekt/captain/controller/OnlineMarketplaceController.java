package com.trikonekt.captain.controller;

import com.trikonekt.captain.repository.OnlineMarketplaceRepository;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.JwtService;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Online Marketplace — product browsing for consumers + merchant product listing.
 *
 * PUBLIC (consumer browse):
 *   GET /captain/shops/online/categories                        → category pills
 *   GET /captain/shops/online/products?category=&search=&limit=60&offset=0 → product grid
 *
 * MERCHANT (auth required — view own online products):
 *   GET /captain/merchant/online-products?limit=60&offset=0    → merchant's online products
 *
 * BUSINESS (auth required — browse B2B marketplace):
 *   GET /captain/business/online-products?category=&search=&limit=60&offset=0&excludeOwn=true
 *       → active, in-stock ONLINE/BOTH products from B2B merchants
 */
@RestController
public class OnlineMarketplaceController {

    private final OnlineMarketplaceRepository repo;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public OnlineMarketplaceController(OnlineMarketplaceRepository repo,
                                        UserRepository userRepository,
                                        JwtService jwtService) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // ── Public consumer endpoints ────────────────────────────────────────────

    /**
     * GET /captain/shops/online/categories
     * Returns active categories for DeliveryPage filter pills.
     * Prefers admin-curated online_product_categories; falls back to distinct product categories.
     */
    @GetMapping("/captain/shops/online/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategories() {
        return ResponseEntity.ok(repo.findDistinctOnlineCategories());
    }

    /**
     * GET /captain/shops/online/products?category=Electronics&search=phone&limit=60&offset=0
     * Live product grid for DeliveryPage.
     */
    @GetMapping("/captain/shops/online/products")
    public ResponseEntity<List<Map<String, Object>>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "60") int limit,
            @RequestParam(defaultValue = "0")  int offset) {
        int safeLimit  = Math.min(Math.max(limit, 1), 120);
        int safeOffset = Math.max(offset, 0);
        return ResponseEntity.ok(repo.findOnlineProducts(category, search, safeLimit, safeOffset));
    }

    /**
     * GET /captain/business/online-products?category=&search=&limit=60&offset=0&excludeOwn=true
     * Business B2B marketplace products. Shows active, in-stock ONLINE/BOTH products from B2B merchants only.
     */
    @GetMapping("/captain/business/online-products")
    public ResponseEntity<?> getBusinessOnlineProducts(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "60") int limit,
            @RequestParam(defaultValue = "0")  int offset,
            @RequestParam(defaultValue = "true") boolean excludeOwn) {
        try {
            long userId = extractUserId(auth); // auth required for business marketplace access
            int safeLimit  = Math.min(Math.max(limit, 1), 120);
            int safeOffset = Math.max(offset, 0);
            return ResponseEntity.ok(repo.findBusinessOnlineProducts(userId, excludeOwn, category, search, safeLimit, safeOffset));
        } catch (DataAccessException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to load B2B online products",
                    "details", ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage()
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    // ── Merchant endpoint ─────────────────────────────────────────────────────

    /**
     * GET /captain/merchant/online-products?limit=60&offset=0
     * Lists the authenticated merchant's own online products for OnlineProductsPage.jsx.
     */
    @GetMapping("/captain/merchant/online-products")
    public ResponseEntity<?> getMerchantOnlineProducts(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestParam(defaultValue = "60") int limit,
            @RequestParam(defaultValue = "0")  int offset) {
        try {
            long merchantId = extractUserId(auth);
            int safeLimit  = Math.min(Math.max(limit, 1), 120);
            int safeOffset = Math.max(offset, 0);
            return ResponseEntity.ok(repo.findMerchantOnlineProducts(merchantId, safeLimit, safeOffset));
        } catch (DataAccessException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Failed to load online products",
                    "details", ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage()
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private long extractUserId(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = auth.substring(7);
        String username = jwtService.extractUsername(token);
        Map<String, Object> user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        Object idObj = user.get("id");
        if (idObj == null) throw new RuntimeException("User ID not found for: " + username);
        return Long.parseLong(idObj.toString());
    }
}
