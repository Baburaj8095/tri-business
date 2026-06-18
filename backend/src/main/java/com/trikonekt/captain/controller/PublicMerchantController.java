package com.trikonekt.captain.controller;

import com.trikonekt.captain.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/captain/merchants")
public class PublicMerchantController {

    private final UserRepository userRepository;

    public PublicMerchantController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * GET /api/captain/merchants/b2b
     * Public B2B shops (merchant category).
     */
    @GetMapping("/b2b")
    public ResponseEntity<List<Map<String, Object>>> listB2bMerchants() {
        return ResponseEntity.ok(userRepository.findPublicB2bMerchants());
    }

    /**
     * GET /api/captain/merchants/b2c
     * Public B2C shops (business category).
     */
    @GetMapping("/b2c")
    public ResponseEntity<List<Map<String, Object>>> listB2cMerchants() {
        return ResponseEntity.ok(userRepository.findPublicB2cMerchants());
    }
}
