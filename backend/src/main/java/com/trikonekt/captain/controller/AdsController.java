package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.MarketplaceAd;
import com.trikonekt.captain.repository.AdsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Marketplace Ads API — LLD Section 9
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
