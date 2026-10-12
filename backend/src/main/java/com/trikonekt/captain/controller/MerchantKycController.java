package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.MerchantKycRequest;
import com.trikonekt.captain.model.MerchantKycResponse;
import com.trikonekt.captain.repository.MerchantKycRepository;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.CloudinaryService;
import com.trikonekt.captain.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/captain/merchant/kyc")
public class MerchantKycController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final MerchantKycRepository merchantKycRepository;
    private final CloudinaryService cloudinaryService;

    public MerchantKycController(JwtService jwtService,
                                 UserRepository userRepository,
                                 MerchantKycRepository merchantKycRepository,
                                 CloudinaryService cloudinaryService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.merchantKycRepository = merchantKycRepository;
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
     * GET /api/captain/merchant/kyc/status
     */
    @GetMapping("/status")
    public ResponseEntity<MerchantKycResponse> getKycStatus(@RequestHeader("Authorization") String authHeader) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Merchant user not found: " + username));

        long userId = ((Number) user.get("id")).longValue();
        MerchantKycResponse resp = merchantKycRepository.findByUserId(userId)
            .orElse(MerchantKycResponse.builder()
                .userId(userId)
                .kycStatus("NOT_STARTED")
                .isGstRegistered(false)
                .build());

        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/captain/merchant/kyc/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitKyc(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody MerchantKycRequest req) {
        String username = getUsernameFromToken(authHeader);
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Merchant user not found: " + username));

        // Validate PAN format (5 letters, 4 digits, 1 letter)
        if (req.getPanNumber() != null && !req.getPanNumber().isBlank()) {
            String pan = req.getPanNumber().trim().toUpperCase();
            if (!pan.matches("[A-Z]{5}[0-9]{4}[A-Z]")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid PAN format. Expected format: ABCDE1234F"));
            }
            req.setPanNumber(pan);
        }

        // Validate GSTIN format if registered (15 chars)
        if (Boolean.TRUE.equals(req.getIsGstRegistered()) && req.getGstin() != null && !req.getGstin().isBlank()) {
            String gstin = req.getGstin().trim().toUpperCase();
            if (!gstin.matches("\\d{2}[A-Z]{5}\\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid GSTIN format. Expected 15-character valid GSTIN (e.g. 29ABCDE1234F1Z5)"));
            }
            req.setGstin(gstin);
        }

        long userId = ((Number) user.get("id")).longValue();
        merchantKycRepository.saveOrUpdateMerchantKyc(userId, req);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "KYC documents submitted successfully. Verification is pending."
        ));
    }

    /**
     * POST /api/captain/merchant/kyc/documents
     */
    @PostMapping("/documents")
    public ResponseEntity<Map<String, String>> uploadDocument(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) {
        getUsernameFromToken(authHeader);

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        // Limit file size to 5MB
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 5MB limit"));
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equals("application/pdf"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only images (JPEG, PNG) and PDF documents are allowed"));
        }

        String url = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
