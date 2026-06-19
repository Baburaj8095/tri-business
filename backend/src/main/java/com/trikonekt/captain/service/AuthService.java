package com.trikonekt.captain.service;

import com.trikonekt.captain.model.LoginRequest;
import com.trikonekt.captain.model.LoginResponse;
import com.trikonekt.captain.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest req) {
        if (req.getIdentifier() == null || req.getIdentifier().isBlank()) {
            throw new RuntimeException("Captain ID or phone number is required.");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new RuntimeException("Password is required.");
        }

        String identifier = req.getIdentifier().trim().toUpperCase();
        Optional<Map<String, Object>> userOpt;

        // Resolve identifier: 10 digits → find by phone, else find by username
        if (identifier.matches("\\d{10}")) {
            // Try phone directly, then try CB+phone
            userOpt = userRepository.findByPhone(identifier);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByUsername("CB" + identifier);
            }
        } else {
            // Any alphanumeric user ID (CB, NSB2B, etc.)
            userOpt = userRepository.findByUsername(identifier);
        }

        Map<String, Object> user = userOpt.orElseThrow(() ->
            new RuntimeException("No account found for: " + req.getIdentifier())
        );

        // Ensure this is a Captain or Business account
        String category = (String) user.getOrDefault("category", "");
        String role = (String) user.getOrDefault("role", "");
        if (!"agency_sub_franchise".equals(category) && !"business".equals(category) && !"merchant".equals(category)) {
            throw new RuntimeException("This account is not authorized for the Business/Captain portal.");
        }

        // Verify account is active
        Boolean isActive = (Boolean) user.getOrDefault("is_active", false);
        if (!Boolean.TRUE.equals(isActive)) {
            throw new RuntimeException("Your Captain account is not yet activated. Please contact support.");
        }

        // Verify password
        String storedHash = (String) user.get("password");
        if (!checkPassword(req.getPassword(), storedHash)) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }

        String username = (String) user.get("username");
        String fullName = (String) user.getOrDefault("full_name", "");
        String pincode = (String) user.getOrDefault("pincode", "");

        String accessToken = jwtService.generateAccessToken(username, fullName);
        String refreshToken = jwtService.generateRefreshToken(username);

        return LoginResponse.builder()
            .access(accessToken)
            .refresh(refreshToken)
            .username(username)
            .captainId(username)
            .fullName((String) user.get("full_name"))
            .role(role)
            .category(category)
            .pincode((String) user.get("pincode"))
            .serviceMode((String) user.getOrDefault("service_mode", "OFFLINE"))
            .build();
    }

    public LoginResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        if (username == null) {
            throw new RuntimeException("Invalid refresh token.");
        }
        Map<String, Object> user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found."));

        String fullName = (String) user.getOrDefault("full_name", "");
        String newAccessToken = jwtService.generateAccessToken(username, fullName);

        return LoginResponse.builder()
            .access(newAccessToken)
            .refresh(refreshToken)
            .username(username)
            .captainId(username)
            .fullName(fullName)
            .build();
    }

    /**
     * Verifies password against stored hash.
     * Supports both Django BCryptPasswordHasher format (bcrypt$<hash>) and raw BCrypt.
     */
    private boolean checkPassword(String rawPassword, String storedHash) {
        if (storedHash == null) return false;

        // Django BCryptPasswordHasher stores as: "bcrypt$<bcrypt_hash>"
        if (storedHash.startsWith("bcrypt$")) {
            String bcryptHash = storedHash.substring(7); // strip "bcrypt$"
            try {
                return passwordEncoder.matches(rawPassword, bcryptHash);
            } catch (Exception e) {
                return false;
            }
        }

        // Raw BCrypt (if stored without prefix)
        if (storedHash.startsWith("$2")) {
            try {
                return passwordEncoder.matches(rawPassword, storedHash);
            } catch (Exception e) {
                return false;
            }
        }

        return false;
    }
}
