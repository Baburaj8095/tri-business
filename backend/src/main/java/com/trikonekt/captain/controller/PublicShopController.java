package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.ShopProductResponse;
import com.trikonekt.captain.model.ShopResponse;
import com.trikonekt.captain.service.ShopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public Shop APIs - No authentication required
 * Strictly segregates B2B vs B2C shops per platform boundary.
 */
@RestController
public class PublicShopController {

    private final ShopService shopService;

    public PublicShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    /**
     * GET /captain/merchants/b2b or /captain/public/shops/b2b
     * Returns ONLY B2B active shops (u.category = 'merchant').
     */
    @GetMapping({"/captain/merchants/b2b", "/captain/public/shops/b2b"})
    public ResponseEntity<List<ShopResponse>> listB2bShops() {
        return ResponseEntity.ok(shopService.listB2bPublicShops());
    }

    /**
     * GET /captain/merchants/b2c or /captain/public/shops/b2c
     * Returns ONLY B2C active shops (u.category = 'business' and offline/both).
     */
    @GetMapping({"/captain/merchants/b2c", "/captain/public/shops/b2c"})
    public ResponseEntity<List<ShopResponse>> listB2cShops() {
        return ResponseEntity.ok(shopService.listB2cPublicShops());
    }

    /**
     * GET /captain/public-shops, /captain/public/shops, /captain/shops
     * Allows filtering by category or audience:
     * - category=merchant or audience=b2b -> B2B only
     * - category=business or audience=b2c -> B2C only
     * - otherwise returns all active shops
     */
    @GetMapping({"/captain/public-shops", "/captain/public/shops", "/captain/shops"})
    public ResponseEntity<List<ShopResponse>> listPublicShops(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String audience) {
        String filter = (audience != null && !audience.isBlank()) ? audience.trim().toLowerCase()
                : (category != null ? category.trim().toLowerCase() : "");
        if ("b2b".equals(filter) || "merchant".equals(filter)) {
            return ResponseEntity.ok(shopService.listB2bPublicShops());
        }
        if ("b2c".equals(filter) || "business".equals(filter)) {
            return ResponseEntity.ok(shopService.listB2cPublicShops());
        }
        return ResponseEntity.ok(shopService.listPublicShops());
    }

    /**
     * GET /captain/shops/{shopId} or /captain/public-shops/{shopId}
     * Get shop detail by ID (public)
     */
    @GetMapping({"/captain/shops/{shopId}", "/captain/public-shops/{shopId}", "/captain/public/shops/{shopId}"})
    public ResponseEntity<ShopResponse> getShopDetail(@PathVariable Long shopId) {
        ShopResponse shop = shopService.getShopDetail(shopId);
        return ResponseEntity.ok(shop);
    }

    /**
     * GET /captain/shops/{shopId}/products or /captain/public-shops/{shopId}/products
     * Get products for a specific shop
     */
    @GetMapping({"/captain/shops/{shopId}/products", "/captain/public-shops/{shopId}/products", "/captain/public/shops/{shopId}/products"})
    public ResponseEntity<List<ShopProductResponse>> getShopProducts(@PathVariable Long shopId) {
        List<ShopProductResponse> products = shopService.getShopProducts(shopId);
        return ResponseEntity.ok(products);
    }

    // NOTE: /online/products and /online/categories are handled by OnlineMarketplaceController
    // to avoid Spring ambiguous-mapping errors. Do not add them back here.
}
