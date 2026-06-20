package com.trikonekt.captain.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.ShopService;
import java.util.List;

@RestController
@RequestMapping("/captain")
public class LocationController {

    private final UserRepository userRepository;

    public LocationController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * GET /api/captain/health
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "captain-service",
            "timestamp", Instant.now().toString(),
            "version", "1.0.0"
        ));
    }

    /**
     * GET /api/captain/merchants/b2b
     * Public endpoint to fetch B2B merchants for nearby shops display.
     */
    @GetMapping("/merchants/b2b")
    public ResponseEntity<List<Map<String, Object>>> getPublicB2bMerchants() {
        return ResponseEntity.ok(userRepository.findPublicB2bMerchants());
    }

    /**
     * GET /api/captain/merchants/b2c
     * Public endpoint to fetch B2C merchants for consumer nearby shops display.
     */
    @GetMapping("/merchants/b2c")
    public ResponseEntity<List<Map<String, Object>>> getPublicB2cMerchants(
            @RequestParam(value = "lat", required = false) Double lat,
            @RequestParam(value = "lng", required = false) Double lng,
            @RequestParam(value = "radius_km", required = false, defaultValue = "25") Double radiusKm
    ) {
        List<Map<String, Object>> rows = userRepository.findPublicB2cMerchants();
        List<Map<String, Object>> response = new ArrayList<>();
        boolean hasLocation = lat != null && lng != null;
        double requestedRadius = radiusKm != null ? Math.min(radiusKm, 25.0) : 25.0;

        for (Map<String, Object> row : rows) {
            Map<String, Object> item = new HashMap<>(row);
            boolean homeDeliveryEnabled = Boolean.TRUE.equals(row.get("home_delivery_enabled"));
            Double shopLat = asDouble(row.get("latitude"));
            Double shopLng = asDouble(row.get("longitude"));
            double shopRadius = Math.min(ShopService.normalizeDeliveryRadius(asDouble(row.get("delivery_radius_km"))), requestedRadius);
            item.put("delivery_radius_km", shopRadius);

            if (!homeDeliveryEnabled) {
                item.put("is_delivery_available", false);
                item.put("delivery_unavailable_reason", "NO_HOME_DELIVERY");
            } else if (!hasLocation || shopLat == null || shopLng == null) {
                item.put("is_delivery_available", false);
                item.put("delivery_unavailable_reason", "SET_LOCATION");
            } else {
                double distanceKm = ShopService.calculateDistanceKm(lat, lng, shopLat, shopLng);
                item.put("distance_km", Math.round(distanceKm * 10.0) / 10.0);
                boolean available = distanceKm <= shopRadius;
                item.put("is_delivery_available", available);
                item.put("delivery_unavailable_reason", available ? null : "TOO_FAR");
            }
            response.add(item);
        }

        return ResponseEntity.ok(response);
    }

    private Double asDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ignored) {
            return null;
        }
    }
}
