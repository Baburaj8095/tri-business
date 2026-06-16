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
        Optional<Map<String, Object>> userOpt = userRepository.findSponsor(normalizedId);

        if (userOpt.isEmpty()) {
            return SponsorInfo.builder()
                .sponsorId(normalizedId)
                .valid(false)
                .build();
        }

        Map<String, Object> user = userOpt.get();
        String category = (String) user.getOrDefault("category", "");
        boolean isSuperuser = Boolean.TRUE.equals(user.get("is_superuser"));
        boolean isStaff = Boolean.TRUE.equals(user.get("is_staff"));

        boolean isValidSponsor = VALID_SPONSOR_CATEGORIES.contains(category) || isSuperuser || isStaff;

        return SponsorInfo.builder()
            .sponsorId(normalizedId)
            .sponsorName((String) user.getOrDefault("full_name", "Partner"))
            .category(category)
            .valid(isValidSponsor)
            .pincode((String) user.get("pincode"))
            .build();
    }
}
