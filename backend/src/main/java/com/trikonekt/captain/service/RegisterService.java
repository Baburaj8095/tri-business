package com.trikonekt.captain.service;

import com.trikonekt.captain.model.LoginResponse;
import com.trikonekt.captain.model.RegisterRequest;
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
        // 1. Validate phone uniqueness
        if (userRepository.existsByPhone(req.getPhone())) {
            throw new RuntimeException("A Captain with phone number " + req.getPhone() + " already exists.");
        }

        // 2. Build Captain username and prefixed ID
        String username = "CB" + req.getPhone();        // e.g., CB9876543210
        String prefixedId = "CB-" + req.getPhone();    // e.g., CB-9876543210

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Captain ID " + username + " is already registered.");
        }

        // 3. Verify sponsor (best-effort — warning logged if invalid)
        SponsorInfo sponsor = sponsorService.verifySponsor(req.getSponsorId());
        if (!sponsor.isValid()) {
            throw new RuntimeException("Invalid sponsor ID: " + req.getSponsorId() +
                ". Sponsor must be a Pincode Partner (TRPN) or an existing Captain (CB).");
        }

        // 4. Hash password — stored as Django BCryptPasswordHasher format: "bcrypt$<bcrypt_hash>"
        String rawBcrypt = passwordEncoder.encode(req.getPassword());
        String djangoCompatibleHash = "bcrypt$" + rawBcrypt;

        // 5. Insert user into accounts_customuser
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

        // 6. Insert region assignment (accounts_agencyregionassignment)
        regionRepository.insertRegionAssignment(userId, req.getPincode(), req.getDistrict(), req.getState());

        // 7. Create wallet (accounts_wallet)
        regionRepository.insertWallet(userId);

        // 8. Insert audit record
        userRepository.insertCaptainAudit(
            username, req.getPhone(), req.getFullName(), req.getEmail(),
            req.getPincode(), req.getDistrict(), req.getState(),
            req.getSponsorId(), userId
        );

        // 9. Generate JWT tokens and return response
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
}
