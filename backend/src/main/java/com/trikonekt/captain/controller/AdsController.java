package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.MarketplaceAd;
import com.trikonekt.captain.repository.AdsRepository;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Marketplace Ads API — LLD Section 9
 *
 * PUBLIC endpoints (no auth) — consumer/business dashboards read ads:
 *   GET /api/ads/banners?limit=6&target=CONSUMER_ONLINE_B2C
 *   GET /api/ads/sponsored-shops?limit=8&target=CONSUMER_NEARBY_B2C
 *   GET /api/ads/featured-products?limit=8&target=CONSUMER_ONLINE_B2C
 *   GET /api/ads/all?bannerLimit=6&shopLimit=8&productLimit=8&target=...
 *
 * MERCHANT endpoints (auth required) — business users manage their own ads:
 *   GET    /captain/merchant/ads
 *   POST   /captain/merchant/ads
 *   PUT    /captain/merchant/ads/{id}
 *   DELETE /captain/merchant/ads/{id}
 *   PATCH  /captain/merchant/ads/{id}/toggle
 *
 * display_target routing:
 *   BUSINESS_ONLINE_B2B  → Business Dashboard Online B2B Ads
 *   CONSUMER_ONLINE_B2C  → Consumer DeliveryPage banners & featured products
 *   CONSUMER_NEARBY_B2C  → Consumer NearbyStoresPage sponsored row
 *   CONSUMER_TRIZONE_B2C → Consumer TriZone section
 */
@RestController
public class AdsController {

    private final AdsRepository adsRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AdsController(AdsRepository adsRepository, UserRepository userRepository, JwtService jwtService) {
        this.adsRepository = adsRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    // ── Public read endpoints ────────────────────────────────────────────────

    @GetMapping("/api/ads/banners")
    public ResponseEntity<List<MarketplaceAd>> getBanners(
            @RequestParam(defaultValue = "6") int limit,
            @RequestParam(name = "target", required = false) String target) {
        return ResponseEntity.ok(adsRepository.findActiveBanners(limit, target));
    }

    @GetMapping("/api/ads/sponsored-shops")
    public ResponseEntity<List<MarketplaceAd>> getSponsoredShops(
            @RequestParam(defaultValue = "8") int limit,
            @RequestParam(name = "target", required = false) String target) {
        return ResponseEntity.ok(adsRepository.findSponsoredShops(limit, target));
    }

    @GetMapping("/api/ads/featured-products")
    public ResponseEntity<List<MarketplaceAd>> getFeaturedProducts(
            @RequestParam(defaultValue = "8") int limit,
            @RequestParam(name = "target", required = false) String target) {
        return ResponseEntity.ok(adsRepository.findFeaturedProducts(limit, target));
    }

    @GetMapping("/api/ads/all")
    public ResponseEntity<Map<String, Object>> getAllAds(
            @RequestParam(defaultValue = "6") int bannerLimit,
            @RequestParam(defaultValue = "8") int shopLimit,
            @RequestParam(defaultValue = "8") int productLimit,
            @RequestParam(name = "target", required = false) String target) {
        return ResponseEntity.ok(Map.of(
                "banners",           adsRepository.findActiveBanners(bannerLimit, target),
                "sponsored_shops",   adsRepository.findSponsoredShops(shopLimit, target),
                "featured_products", adsRepository.findFeaturedProducts(productLimit, target)
        ));
    }

    // ── Merchant CRUD (auth required) ────────────────────────────────────────

    @GetMapping("/captain/merchant/ads")
    public ResponseEntity<?> listMyAds(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            long merchantId = extractUserId(authHeader);
            return ResponseEntity.ok(adsRepository.findAdsByMerchant(merchantId));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/captain/merchant/ads")
    public ResponseEntity<?> createAd(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> body) {
        try {
            long merchantId = extractUserId(authHeader);
            String title = str(body, "title", "");
            if (title == null || title.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "title is required"));
            }
            long newId = adsRepository.createAd(
                merchantId,
                str(body, "ad_type", "BANNER"),
                title,
                str(body, "description", ""),
                str(body, "image_url", ""),
                str(body, "target_url", ""),
                str(body, "display_target", "CONSUMER_ONLINE_B2C"),
                intVal(body, "priority", 10),
                longVal(body, "shop_id"),
                longVal(body, "product_id"),
                parseDateTime(str(body, "valid_from", null)),
                parseDateTime(str(body, "valid_to", null))
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("id", newId, "message", "Ad created successfully"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/captain/merchant/ads/{id}")
    public ResponseEntity<?> updateAd(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {
        try {
            long merchantId = extractUserId(authHeader);
            boolean isActive = body.getOrDefault("is_active", true).toString().equalsIgnoreCase("true");
            int updated = adsRepository.updateAd(
                id, merchantId,
                str(body, "ad_type", "BANNER"),
                str(body, "title", ""),
                str(body, "description", ""),
                str(body, "image_url", ""),
                str(body, "target_url", ""),
                str(body, "display_target", "CONSUMER_ONLINE_B2C"),
                intVal(body, "priority", 10),
                isActive,
                longVal(body, "shop_id"),
                longVal(body, "product_id"),
                parseDateTime(str(body, "valid_from", null)),
                parseDateTime(str(body, "valid_to", null))
            );
            if (updated == 0) return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Ad not found or access denied"));
            return ResponseEntity.ok(Map.of("message", "Ad updated"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/captain/merchant/ads/{id}")
    public ResponseEntity<?> deleteAd(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable long id) {
        try {
            long merchantId = extractUserId(authHeader);
            int deleted = adsRepository.deleteAd(id, merchantId);
            if (deleted == 0) return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Ad not found or access denied"));
            return ResponseEntity.ok(Map.of("message", "Ad deleted"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    @PatchMapping("/captain/merchant/ads/{id}/toggle")
    public ResponseEntity<?> toggleAd(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {
        try {
            long merchantId = extractUserId(authHeader);
            boolean active = body.getOrDefault("is_active", true).toString().equalsIgnoreCase("true");
            int updated = adsRepository.toggleActive(id, merchantId, active);
            if (updated == 0) return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Ad not found or access denied"));
            return ResponseEntity.ok(Map.of("message", "Ad " + (active ? "activated" : "deactivated")));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Map<String, Object> user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        Object idObj = user.get("id");
        if (idObj == null) throw new RuntimeException("User ID not found for: " + username);
        return Long.parseLong(idObj.toString());
    }

    private static String str(Map<String, Object> body, String key, String def) {
        Object v = body.get(key);
        return (v != null && !v.toString().isBlank()) ? v.toString().trim() : def;
    }

    private static int intVal(Map<String, Object> body, String key, int def) {
        try { return Integer.parseInt(body.getOrDefault(key, def).toString()); }
        catch (Exception e) { return def; }
    }

    private static Long longVal(Map<String, Object> body, String key) {
        try {
            Object v = body.get(key);
            return (v != null && !v.toString().equals("null") && !v.toString().isBlank())
                    ? Long.parseLong(v.toString()) : null;
        } catch (Exception e) { return null; }
    }

    private static LocalDateTime parseDateTime(String raw) {
        if (raw == null || raw.isBlank()) return null;
        try { return LocalDateTime.parse(raw, DateTimeFormatter.ISO_LOCAL_DATE_TIME); }
        catch (Exception e) { return null; }
    }
}

 *
 * All endpoints are public (no auth required) since ads are visible to
 * unauthenticated consumers browsing the marketplace.
 *
 * Endpoints:
 *   GET /api/ads/banners             → Homepage banner ads
 *   GET /api/ads/sponsored-shops     → Sponsored shop carousel (Business B2B dashboard)
 *   GET /api/ads/featured-products   → Featured product grid (Online section)
 */
@RestController
@RequestMapping("/api/ads")
public class AdsController {

    private final AdsRepository adsRepository;

    public AdsController(AdsRepository adsRepository) {
        this.adsRepository = adsRepository;
    }

    /**
     * GET /api/ads/banners?limit=6
     * Homepage banner ads for the consumer and business dashboards.
     */
    @GetMapping("/banners")
    public ResponseEntity<List<MarketplaceAd>> getBanners(
            @RequestParam(defaultValue = "6") int limit) {
        List<MarketplaceAd> banners = adsRepository.findActiveBanners(limit);
        return ResponseEntity.ok(banners);
    }

    /**
     * GET /api/ads/sponsored-shops?limit=8
     * Sponsored shop carousel for the B2B online ads section.
     */
    @GetMapping("/sponsored-shops")
    public ResponseEntity<List<MarketplaceAd>> getSponsoredShops(
            @RequestParam(defaultValue = "8") int limit) {
        List<MarketplaceAd> ads = adsRepository.findSponsoredShops(limit);
        return ResponseEntity.ok(ads);
    }

    /**
     * GET /api/ads/featured-products?limit=8
     * Featured product grid for the Online products section.
     */
    @GetMapping("/featured-products")
    public ResponseEntity<List<MarketplaceAd>> getFeaturedProducts(
            @RequestParam(defaultValue = "8") int limit) {
        List<MarketplaceAd> ads = adsRepository.findFeaturedProducts(limit);
        return ResponseEntity.ok(ads);
    }

    /**
     * GET /api/ads/all
     * Returns all three types in one consolidated response.
     * Useful for pre-loading on dashboard mount.
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllAds(
            @RequestParam(defaultValue = "6") int bannerLimit,
            @RequestParam(defaultValue = "8") int shopLimit,
            @RequestParam(defaultValue = "8") int productLimit) {
        return ResponseEntity.ok(Map.of(
                "banners", adsRepository.findActiveBanners(bannerLimit),
                "sponsored_shops", adsRepository.findSponsoredShops(shopLimit),
                "featured_products", adsRepository.findFeaturedProducts(productLimit)
        ));
    }
}
