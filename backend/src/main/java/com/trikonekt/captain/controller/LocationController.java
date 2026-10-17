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

}
