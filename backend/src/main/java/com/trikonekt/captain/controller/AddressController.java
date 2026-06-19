package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.UserDeliveryAddress;
import com.trikonekt.captain.repository.AddressRepository;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    public AddressController(JwtService jwtService, UserRepository userRepository, AddressRepository addressRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
    }

    private Long getUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized. No token provided.");
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        Map<String, Object> user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found for token: " + username));
        return ((Number) user.get("id")).longValue();
    }

    /**
     * GET /api/addresses
     * List all addresses for the logged-in user
     */
    @GetMapping
    public ResponseEntity<List<UserDeliveryAddress>> getMyAddresses(@RequestHeader("Authorization") String authHeader) {
        Long userId = getUserIdFromToken(authHeader);
        List<UserDeliveryAddress> addresses = addressRepository.findAddressesByUserId(userId);
        return ResponseEntity.ok(addresses);
    }

    /**
     * POST /api/addresses
     * Add a new shipping address
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> addAddress(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UserDeliveryAddress req) {
        
        Long userId = getUserIdFromToken(authHeader);

        if (req.getRecipientsName() == null || req.getRecipientsName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Recipient name is required."));
        }
        if (req.getRecipientsPhone() == null || req.getRecipientsPhone().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Recipient phone number is required."));
        }
        if (req.getAddressLine1() == null || req.getAddressLine1().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Address Line 1 is required."));
        }
        if (req.getCity() == null || req.getCity().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "City is required."));
        }
        if (req.getPincode() == null || req.getPincode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Pincode is required."));
        }

        Boolean isDefault = req.getIsDefault() != null ? req.getIsDefault() : false;

        addressRepository.insertAddress(
                userId,
                req.getRecipientsName().trim(),
                req.getRecipientsPhone().trim(),
                req.getAddressLine1().trim(),
                req.getAddressLine2() != null ? req.getAddressLine2().trim() : "",
                req.getLandmark() != null ? req.getLandmark().trim() : "",
                req.getCity().trim(),
                req.getStateName() != null ? req.getStateName().trim() : "",
                req.getPincode().trim(),
                isDefault
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Delivery address added successfully."));
    }

    /**
     * PUT /api/addresses/{id}
     * Update an existing address
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateAddress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long addressId,
            @RequestBody UserDeliveryAddress req) {

        Long userId = getUserIdFromToken(authHeader);

        // Verify the address exists and belongs to the user
        addressRepository.findAddressByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found or unauthorized."));

        if (req.getRecipientsName() == null || req.getRecipientsName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Recipient name is required."));
        }
        if (req.getRecipientsPhone() == null || req.getRecipientsPhone().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Recipient phone number is required."));
        }
        if (req.getAddressLine1() == null || req.getAddressLine1().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Address Line 1 is required."));
        }
        if (req.getCity() == null || req.getCity().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "City is required."));
        }
        if (req.getPincode() == null || req.getPincode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Pincode is required."));
        }

        Boolean isDefault = req.getIsDefault() != null ? req.getIsDefault() : false;

        addressRepository.updateAddress(
                addressId,
                userId,
                req.getRecipientsName().trim(),
                req.getRecipientsPhone().trim(),
                req.getAddressLine1().trim(),
                req.getAddressLine2() != null ? req.getAddressLine2().trim() : "",
                req.getLandmark() != null ? req.getLandmark().trim() : "",
                req.getCity().trim(),
                req.getStateName() != null ? req.getStateName().trim() : "",
                req.getPincode().trim(),
                isDefault
        );

        return ResponseEntity.ok(Map.of("message", "Delivery address updated successfully."));
    }

    /**
     * DELETE /api/addresses/{id}
     * Remove a delivery address entry
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAddress(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable("id") Long addressId) {

        Long userId = getUserIdFromToken(authHeader);

        // Verify ownership and existence
        addressRepository.findAddressByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found or unauthorized."));

        addressRepository.deleteAddress(addressId, userId);

        return ResponseEntity.ok(Map.of("message", "Delivery address deleted successfully."));
    }
}
