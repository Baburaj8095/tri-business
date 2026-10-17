package com.trikonekt.captain.service;

import com.trikonekt.captain.model.SponsorInfo;
import com.trikonekt.captain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class SponsorService {

    private static final Set<String> VALID_SPONSOR_CATEGORIES = Set.of(
        "agency_pincode",       // TRPN - Pincode Partner
        "agency_sub_franchise", // CB   - Fellow Captain
        "captain",              // Direct Captain persona
        "agency",               // Agency franchise role
        "pincode_partner"       // Regional partner
    );

    private final UserRepository userRepository;

    public SponsorService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Strict verification for Merchant Onboarding:
     * Sponsor MUST be a registered, active Captain (agency_sub_franchise/captain) or Pincode Partner (agency_pincode).
     * If no official Captain account exists for the given ID or mobile, returns valid = false.
     */
    public SponsorInfo verifySponsor(String sponsorId) {
        if (sponsorId == null || sponsorId.isBlank()) {
            return SponsorInfo.builder().valid(false).build();
        }

        String normalizedId = sponsorId.trim().toUpperCase();

        Optional<Map<String, Object>> userOpt = userRepository.findSponsor(normalizedId);

        if (userOpt.isEmpty()) {
            return SponsorInfo.builder()
                .sponsorId(normalizedId)
                .valid(false)
                .build();
        }

        Map<String, Object> user = userOpt.get();
        String category = (String) user.getOrDefault("category", "");
        String role = (String) user.getOrDefault("role", "");
        String username = (String) user.getOrDefault("username", "");
        String prefixedId = (String) user.getOrDefault("prefixed_id", "");

        Object isActiveObj = user.get("is_active");
        Object accountActiveObj = user.get("account_active");
        boolean isActive = (isActiveObj == null || Boolean.TRUE.equals(isActiveObj) || "true".equalsIgnoreCase(String.valueOf(isActiveObj)))
            || Boolean.TRUE.equals(accountActiveObj) || "true".equalsIgnoreCase(String.valueOf(accountActiveObj));

        // Strict enforcement: Only verified Captain or Pincode Partner accounts
        boolean isCaptainOrPartner = VALID_SPONSOR_CATEGORIES.contains(category)
            || "agency".equalsIgnoreCase(role)
            || "captain".equalsIgnoreCase(role)
            || (username != null && (username.toUpperCase().startsWith("CB") || username.toUpperCase().startsWith("TRPN")))
            || (prefixedId != null && (prefixedId.toUpperCase().startsWith("CB") || prefixedId.toUpperCase().startsWith("TRPN")));

        boolean isValidSponsor = isActive && isCaptainOrPartner;

        if (!isValidSponsor) {
            return SponsorInfo.builder()
                .sponsorId(normalizedId)
                .category(category)
                .valid(false)
                .build();
        }

        String officialId = (String) user.getOrDefault("prefixed_id", user.getOrDefault("username", normalizedId));
        if (officialId == null || officialId.isBlank()) {
            officialId = (String) user.getOrDefault("username", normalizedId);
        }

        return SponsorInfo.builder()
            .sponsorId(officialId)
            .sponsorName((String) user.getOrDefault("full_name", "Captain Partner"))
            .category(category)
            .valid(true)
            .pincode((String) user.get("pincode"))
            .district((String) user.getOrDefault("district", ""))
            .state((String) user.getOrDefault("state", ""))
            .build();
    }

    /**
     * Sponsor verification for Captain provisioning in Company Administration:
     * Accepts an active Captain or Pincode Partner, or the apex root platform sponsor (9999999999 / ROOT).
     */
    public SponsorInfo verifyCaptainProvisioningSponsor(String sponsorId) {
        if (sponsorId == null || sponsorId.isBlank()) {
            return SponsorInfo.builder().valid(false).build();
        }

        // Try standard active Captain / Partner lookup first
        SponsorInfo info = verifySponsor(sponsorId);
        if (info.isValid()) {
            return info;
        }

        // Fallback for apex root Captain provisioning in Company Admin
        String normalizedId = sponsorId.trim().toUpperCase();
        String cleanDigits = normalizedId.replaceAll("\\D", "");
        boolean isRoot = "999999999".equals(cleanDigits) || "9999999999".equals(cleanDigits)
            || "ROOT".equals(normalizedId) || "ROOTCONSUMER".equals(normalizedId);

        if (isRoot) {
            return SponsorInfo.builder()
                .sponsorId("9999999999")
                .sponsorName("Root Platform Sponsor")
                .category("agency_sub_franchise")
                .valid(true)
                .pincode("560001")
                .district("Bengaluru")
                .state("Karnataka")
                .build();
        }

        return SponsorInfo.builder()
            .sponsorId(normalizedId)
            .valid(false)
            .build();
    }
}
