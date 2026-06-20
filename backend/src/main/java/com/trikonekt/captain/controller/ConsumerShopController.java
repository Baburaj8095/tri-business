package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.ShopProductResponse;
import com.trikonekt.captain.model.ShopResponse;
import com.trikonekt.captain.service.ShopService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Consumer-safe public shop APIs.
 *
 * These endpoints are intentionally separate from the legacy generic
 * /captain/shops endpoints so the consumer app can enforce B2C/online audience
 * rules without breaking existing Near Store/offline or legacy integrations.
 */
@RestController
@RequestMapping("/captain/consumer")
public class ConsumerShopController {

    private final ShopService shopService;

    public ConsumerShopController(ShopService shopService) {
        this.shopService = shopService;
    }

    /**
     * GET /captain/consumer/shops/{id}
     * Consumer-safe B2C online-enabled shop detail.
     */
    @GetMapping("/shops/{shopId}")
    public ResponseEntity<ShopResponse> getConsumerShopDetail(@PathVariable Long shopId) {
        return ResponseEntity.ok(shopService.getConsumerShopDetail(shopId));
    }

    /**
     * GET /captain/consumer/shops/{id}/products
     * Consumer-safe active, in-stock online-delivery products for a B2C shop.
     */
    @GetMapping("/shops/{shopId}/products")
    public ResponseEntity<List<ShopProductResponse>> getConsumerShopProducts(@PathVariable Long shopId) {
        return ResponseEntity.ok(shopService.getConsumerShopProducts(shopId));
    }

    /**
     * GET /captain/consumer/nearby-shops/{id}?lat=&lng=
     * Delivery-aware nearby shop detail. Does not affect Pay Store/offline payment routes.
     */
    @GetMapping("/nearby-shops/{shopId}")
    public ResponseEntity<ShopResponse> getNearbyDeliveryShopDetail(
            @PathVariable Long shopId,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng
    ) {
        return ResponseEntity.ok(shopService.getNearbyDeliveryShopDetail(shopId, lat, lng));
    }

    /**
     * GET /captain/consumer/nearby-shops/{id}/delivery-products?lat=&lng=
     * Delivery-only active, in-stock online-delivery products for local nearby delivery.
     */
    @GetMapping("/nearby-shops/{shopId}/delivery-products")
    public ResponseEntity<List<ShopProductResponse>> getNearbyDeliveryProducts(
            @PathVariable Long shopId,
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng
    ) {
        return ResponseEntity.ok(shopService.getNearbyDeliveryProducts(shopId, lat, lng));
    }
}