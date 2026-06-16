package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.LoginRequest;
import com.trikonekt.captain.model.LoginResponse;
import com.trikonekt.captain.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/captain/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/captain/auth/login
     * Body: { "identifier": "CB9876543210", "password": "secret" }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        LoginResponse response = authService.login(req);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/captain/auth/refresh
     * Body: { "refresh": "<refresh_token>" }
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refresh");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Refresh token is required.");
        }
        LoginResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(response);
    }
}
