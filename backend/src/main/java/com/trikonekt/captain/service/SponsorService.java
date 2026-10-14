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
        "agency_sub_franchise"  // CB   - Fellow Captain
    );

    private final UserRepository userRepository;

    public SponsorService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public SponsorInfo verifySponsor(String sponsorId) {
        if (sponsorId == null || sponsorId.isBlank()) {
            return SponsorInfo.builder().valid(false).build();
        }

        String normalizedId = sponsorId.trim().toUpperCase();
        String cleanDigits = normalizedId.replaceAll("\\D", "");

        // Check if this matches root consumer sponsor: 999999999, 9999999999, ROOT, ROOTCONSUMER
        boolean isRootConsumer = "999999999".equals(cleanDigits) || "9999999999".equals(cleanDigits)
            || "ROOT".equals(normalizedId) || "ROOTCONSUMER".equals(normalizedId);

        Optional<Map<String, Object>> userOpt = userRepository.findSponsor(normalizedId);

        if (userOpt.isEmpty()) {
            if (isRootConsumer) {
                return SponsorInfo.builder()
                    .sponsorId("9999999999")
                    .sponsorName("Root Consumer Sponsor")
                    .category("consumer")
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

        Map<String, Object> user = userOpt.get();
        String category = (String) user.getOrDefault("category", "consumer");
        boolean isActive = Boolean.TRUE.equals(user.get("is_active")) || "true".equalsIgnoreCase(String.valueOf(user.get("is_active")));

        // Any active consumer, partner, agency, or captain is a valid sponsor
        boolean isValidSponsor = isActive || isRootConsumer;

        String officialId = (String) user.getOrDefault("username", normalizedId);

        return SponsorInfo.builder()
            .sponsorId(officialId)
            .sponsorName((String) user.getOrDefault("full_name", "Partner"))
            .category(category)
            .valid(isValidSponsor)
            .pincode((String) user.get("pincode"))
            .district((String) user.getOrDefault("district", ""))
            .state((String) user.getOrDefault("state", ""))
            .build();
    }
}
