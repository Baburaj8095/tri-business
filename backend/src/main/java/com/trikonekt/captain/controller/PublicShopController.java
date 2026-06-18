package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.ShopProductResponse;
import com.trikonekt.captain.model.ShopResponse;
import com.trikonekt.captain.service.ShopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public Shop APIs - No authentication required
 * These endpoints mirror the Django public shop endpoints
 */
@RestController
@RequestMapping("/captain/shops")
public class PublicShopController {

    private final ShopService shopService;

    public PublicShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    /**
     * GET /api/captain/shops/
     * List all public active shops
     */
    @GetMapping("")
    public ResponseEntity<List<ShopResponse>> listPublicShops() {
        List<ShopResponse> shops = shopService.listPublicShops();
        return ResponseEntity.ok(shops);
    }

    /**
     * GET /api/captain/shops/{id}/
     * Get shop detail by ID (public)
     */
    @GetMapping("/{shopId}")
    public ResponseEntity<ShopResponse> getShopDetail(@PathVariable Long shopId) {
        ShopResponse shop = shopService.getShopDetail(shopId);
        return ResponseEntity.ok(shop);
    }

    /**
     * GET /api/captain/shops/{id}/products/
     * Get products for a specific shop
     */
    @GetMapping("/{shopId}/products")
    public ResponseEntity<List<ShopProductResponse>> getShopProducts(@PathVariable Long shopId) {
        List<ShopProductResponse> products = shopService.getShopProducts(shopId);
        return ResponseEntity.ok(products);
    }
}
