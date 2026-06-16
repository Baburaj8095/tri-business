package com.trikonekt.captain.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

import com.trikonekt.captain.repository.UserRepository;
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
    public ResponseEntity<List<Map<String, Object>>> getPublicB2cMerchants() {
        return ResponseEntity.ok(userRepository.findPublicB2cMerchants());
    }
}
