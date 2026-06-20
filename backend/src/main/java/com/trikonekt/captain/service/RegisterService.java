package com.trikonekt.captain.service;

import com.trikonekt.captain.model.LoginResponse;
import com.trikonekt.captain.model.RegisterRequest;
import com.trikonekt.captain.model.MerchantRegisterRequest;
import com.trikonekt.captain.model.SponsorInfo;
import com.trikonekt.captain.repository.RegionRepository;
import com.trikonekt.captain.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class RegisterService {

    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final JwtService jwtService;
    private final SponsorService sponsorService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    public RegisterService(UserRepository userRepository, RegionRepository regionRepository,
                           JwtService jwtService, SponsorService sponsorService) {
        this.userRepository = userRepository;
        this.regionRepository = regionRepository;
        this.jwtService = jwtService;
        this.sponsorService = sponsorService;
    }

    public LoginResponse register(RegisterRequest req) {
        // Build Captain username and prefixed ID
        String username = "CB" + req.getPhone();        // e.g., CB9876543210
        String prefixedId = "CB-" + req.getPhone();    // e.g., CB-9876543210

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Captain ID " + username + " is already registered.");
        }

        // Verify sponsor (best-effort — warning logged if invalid)
        SponsorInfo sponsor = sponsorService.verifySponsor(req.getSponsorId());
        if (!sponsor.isValid()) {
            throw new RuntimeException("Invalid sponsor ID: " + req.getSponsorId() +
                ". Sponsor must be a Pincode Partner (TRPN) or an existing Captain (CB).");
        }

        // Hash password — stored as Django BCryptPasswordHasher format: "bcrypt$<bcrypt_hash>"
        String rawBcrypt = passwordEncoder.encode(req.getPassword());
        String djangoCompatibleHash = "bcrypt$" + rawBcrypt;

        // Insert user into accounts_customuser
        long userId = userRepository.insertCaptainUser(
            username,
            djangoCompatibleHash,
            req.getEmail(),
            req.getFullName(),
            req.getPhone(),
            req.getPincode(),
            req.getSponsorId().toUpperCase(),
            prefixedId
        );

        // Insert region assignment (accounts_agencyregionassignment)
        regionRepository.insertRegionAssignment(userId, req.getPincode(), req.getDistrict(), req.getState());

        // Create wallet (accounts_wallet)
        regionRepository.insertWallet(userId);

        // Insert audit record
        userRepository.insertCaptainAudit(
            username, req.getPhone(), req.getFullName(), req.getEmail(),
            req.getPincode(), req.getDistrict(), req.getState(),
            req.getSponsorId(), userId
        );

        // Generate JWT tokens and return response
        String accessToken = jwtService.generateAccessToken(username, req.getFullName());
        String refreshToken = jwtService.generateRefreshToken(username);

        return LoginResponse.builder()
            .access(accessToken)
            .refresh(refreshToken)
            .username(username)
            .captainId(username)
            .fullName(req.getFullName())
            .pincode(req.getPincode())
            .district(req.getDistrict())
            .state(req.getState())
            .build();
    }

    public LoginResponse registerMerchant(MerchantRegisterRequest req) {
        // Determine category, username, prefix code and prefixed ID
        String requestedCategory = req.getCategory(); // New: consumer_business/merchant_business; Legacy: business/merchant
        if (requestedCategory == null || requestedCategory.isBlank()) {
            throw new RuntimeException("Invalid merchant category: " + requestedCategory);
        }

        String normalizedCategory = requestedCategory.trim().toLowerCase();
        boolean isB2B;
        if ("merchant_business".equals(normalizedCategory) || "merchant".equals(normalizedCategory)) {
            isB2B = true;
        } else if ("consumer_business".equals(normalizedCategory) || "business".equals(normalizedCategory)) {
            isB2B = false;
        } else {
            throw new RuntimeException("Invalid merchant category: " + requestedCategory);
        }

        // Keep DB category backward-compatible because login/profile filters still expect
        // accounts_customuser.category IN ('merchant', 'business').
        String legacyCategory = isB2B ? "merchant" : "business";

        String resolvedServiceMode = (req.getServiceMode() != null && !req.getServiceMode().isBlank())
            ? req.getServiceMode().trim().toUpperCase()
            : "OFFLINE";
        if (!resolvedServiceMode.equals("ONLINE") && !resolvedServiceMode.equals("OFFLINE") && !resolvedServiceMode.equals("BOTH")) {
            resolvedServiceMode = "OFFLINE";
        }

        String channelPrefix = "ONLINE".equals(resolvedServiceMode) ? "ON" : "NS";
        String modelPrefix = isB2B ? "B2B" : "B2C";
        String prefixCode = channelPrefix + modelPrefix;
        String username = prefixCode + req.getPhone();
        String prefixedId = prefixCode + "-" + req.getPhone();

        // Validate username uniqueness
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Merchant account " + username + " is already registered.");
        }

        // Verify sponsor
        SponsorInfo sponsor = sponsorService.verifySponsor(req.getSponsorId());
        if (!sponsor.isValid()) {
            throw new RuntimeException("Invalid sponsor ID: " + req.getSponsorId() +
                ". Sponsor must be a Pincode Partner (TRPN) or an existing Captain (CB).");
        }

        // Hash password — stored as Django BCryptPasswordHasher format: "bcrypt$<bcrypt_hash>"
        String rawBcrypt = passwordEncoder.encode(req.getPassword());
        String djangoCompatibleHash = "bcrypt$" + rawBcrypt;

        // Insert user into accounts_customuser
        long userId = userRepository.insertMerchantUser(
            username,
            djangoCompatibleHash,
            req.getEmail(),
            req.getFullName(),
            req.getPhone(),
            req.getPincode(),
            req.getSponsorId().toUpperCase(),
            prefixedId,
            prefixCode,
            legacyCategory
        );

        // Create wallet (accounts_wallet)
        regionRepository.insertWallet(userId);

        // Insert profile in market_merchantprofile
        userRepository.insertMerchantProfile(
            userId,
            req.getBusinessName(),
            req.getPhone(),
            req.getAddress(),
            legacyCategory,
            resolvedServiceMode
        );

        // Insert baseline shop in market_shop
        userRepository.insertShop(
            userId,
            req.getBusinessName(),
            req.getAddress(),
            req.getCity(),
            req.getPincode(),
            req.getLatitude(),
            req.getLongitude(),
            req.getPhone(),
            req.getDiscountPercent() != null ? req.getDiscountPercent() : 0.00,
            req.getCategoryId(),
            req.getSubcategoryId(),
            "[]"
        );

        // Generate JWT tokens and return response
        String accessToken = jwtService.generateAccessToken(username, req.getFullName());
        String refreshToken = jwtService.generateRefreshToken(username);

        return LoginResponse.builder()
            .access(accessToken)
            .refresh(refreshToken)
            .username(username)
            .captainId(username)
            .fullName(req.getFullName())
            .pincode(req.getPincode())
            .district(req.getCity())
            .state("")
            .serviceMode(resolvedServiceMode)
            .build();
    }
}
