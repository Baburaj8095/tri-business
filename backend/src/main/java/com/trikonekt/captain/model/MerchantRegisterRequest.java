package com.trikonekt.captain.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MerchantRegisterRequest {

    @NotBlank(message = "Sponsor ID is required")
    private String sponsorId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Business name is required")
    private String businessName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^\\d{6}$", message = "Pincode must be 6 digits")
    private String pincode;

    private Double latitude;
    private Double longitude;

    @NotBlank(message = "Category (B2B/B2C) is required")
    /**
     * Supports both new and legacy values:
     * 'consumer_business' or 'business' -> B2C
     * 'merchant_business' or 'merchant' -> B2B
     */
    private String category;

    /**
     * Business mode from onboarding step 2:
     * 'ONLINE'  → Online Business only
     * 'OFFLINE' → Nearby Store (Offline) only
     * 'BOTH'    → Online + Physical
     * Defaults to 'OFFLINE' if not provided.
     */
    private String serviceMode;

    private Double discountPercent;
    private Integer categoryId;
    private Integer subcategoryId;
}
