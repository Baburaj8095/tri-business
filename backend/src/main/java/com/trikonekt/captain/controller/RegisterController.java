package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.LoginResponse;
import com.trikonekt.captain.model.MerchantRegisterRequest;
import com.trikonekt.captain.model.RegisterRequest;
import com.trikonekt.captain.model.SponsorInfo;
import com.trikonekt.captain.service.RegisterService;
import com.trikonekt.captain.service.SponsorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/captain")
public class RegisterController {

    private final RegisterService registerService;
    private final SponsorService sponsorService;

    public RegisterController(RegisterService registerService, SponsorService sponsorService) {
        this.registerService = registerService;
        this.sponsorService = sponsorService;
    }

    /**
     * POST /api/captain/register
     * Public Captain registration is disabled. Captain accounts must be provisioned through Company Administration.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody(required = false) RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
            "error", "Public Captain self-registration is disabled. Captain accounts must be provisioned and authorized through Company Administration.",
            "success", false
        ));
    }

    /**
     * POST /api/captain/merchant/register
     * Registers a new B2B or B2C merchant and returns JWT tokens.
     */
    @PostMapping("/merchant/register")
    public ResponseEntity<LoginResponse> registerMerchant(@Valid @RequestBody MerchantRegisterRequest req) {
        LoginResponse response = registerService.registerMerchant(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/captain/sponsor/verify?id=TRPN1234567890
     * Verifies if a given ID is a valid sponsor.
     */
    @GetMapping("/sponsor/verify")
    public ResponseEntity<SponsorInfo> verifySponsor(@RequestParam String id) {
        if (id == null || id.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        SponsorInfo info = sponsorService.verifySponsor(id.trim());
        return ResponseEntity.ok(info);
    }
}
