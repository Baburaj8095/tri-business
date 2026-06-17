package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.CaptainProfileResponse;
import com.trikonekt.captain.model.KycUpdateRequest;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.repository.KycRepository;
import com.trikonekt.captain.service.JwtService;
import com.trikonekt.captain.service.CloudinaryService;
import io.jsonwebtoken.Claims;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/captain")
public class CaptainProfileController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final KycRepository kycRepository;
    private final CloudinaryService cloudinaryService;

    public CaptainProfileController(JwtService jwtService, UserRepository userRepository,
                                    KycRepository kycRepository, CloudinaryService cloudinaryService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.kycRepository = kycRepository;
        this.cloudinaryService = cloudinaryService;
    }

    private String getUsernameFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized. No token provided.");
        }
        String token = authHeader.substring(7);
        return jwtService.extractUsername(token);
    }

    /**
     * GET /api/captain/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<CaptainProfileResponse> getProfile(@RequestHeader("Authorization") String authHeader) {
        String username = getUsernameFromToken(authHeader);
        CaptainProfileResponse profile = kycRepository.findProfileByUsername(username)
            .orElseThrow(() -> new RuntimeException("Captain profile not found for user: " + username));
        return ResponseEntity.ok(profile);
    }

    /**
     * PUT /api/captain/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody KycUpdateRequest req) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));

        long userId = ((Number) user.get("id")).longValue();
        kycRepository.saveOrUpdateKycDetails(userId, req);

        return ResponseEntity.ok(Map.of("message", "KYC and Profile updated successfully."));
    }

    /**
     * POST /api/captain/kyc/documents
     */
    @PostMapping("/kyc/documents")
    public ResponseEntity<Map<String, String>> uploadDocument(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) {
        // Just verify token validity
        getUsernameFromToken(authHeader);

        String url = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
