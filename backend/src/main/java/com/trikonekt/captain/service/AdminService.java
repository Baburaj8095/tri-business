package com.trikonekt.captain.service;

import com.trikonekt.captain.model.AdminLoginRequest;
import com.trikonekt.captain.model.AdminLoginResponse;
import com.trikonekt.captain.model.CaptainProfileResponse;
import com.trikonekt.captain.repository.AdminRepository;
import com.trikonekt.captain.repository.KycRepository;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final KycRepository kycRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminService(AdminRepository adminRepository, KycRepository kycRepository, JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.kycRepository = kycRepository;
        this.jwtService = jwtService;
    }

    public AdminLoginResponse login(AdminLoginRequest req) {
        if (req.getUsername() == null || req.getUsername().isBlank()) {
            throw new RuntimeException("Username is required.");
        }
        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new RuntimeException("Password is required.");
        }

        String username = req.getUsername().trim();
        Map<String, Object> admin = adminRepository.findAdminByUsername(username)
            .orElseThrow(() -> new RuntimeException("Admin account not found for: " + username));

        String storedHash = (String) admin.get("password");
        if (!passwordEncoder.matches(req.getPassword(), storedHash)) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }

        String role = (String) admin.get("role");
        String modules = (String) admin.get("modules");
        String email = (String) admin.get("email");

        String token = jwtService.generateAdminToken(username, role, modules);

        return AdminLoginResponse.builder()
            .token(token)
            .username(username)
            .email(email)
            .role(role)
            .modules(modules)
            .build();
    }

    public Map<String, Object> getDashboardStats(String token) {
        verifyAdminToken(token, null);
        return adminRepository.getDashboardStats();
    }

    public Map<String, Object> getCaptains(String token, String search, String kycStatus, Boolean isActive, int page, int size) {
        verifyAdminToken(token, "captains");
        int offset = (page - 1) * size;
        List<Map<String, Object>> captains = adminRepository.listCaptains(search, kycStatus, isActive, size, offset);
        int total = adminRepository.countCaptains(search, kycStatus, isActive);

        Map<String, Object> res = new HashMap<>();
        res.put("captains", captains);
        res.put("total", total);
        res.put("page", page);
        res.put("size", size);
        return res;
    }

    public CaptainProfileResponse getCaptainDetail(String token, String username) {
        verifyAdminToken(token, "captains");
        return kycRepository.findProfileByUsername(username)
            .orElseThrow(() -> new RuntimeException("Captain user not found: " + username));
    }

    public void updateCaptainStatus(String token, long captainId, boolean active) {
        verifyAdminToken(token, "captains");
        adminRepository.updateCaptainAccountStatus(captainId, active);
    }

    public void updateCaptainKyc(String token, long captainId, String status, String reason) {
        Claims claims = verifyAdminToken(token, "kyc");
        String adminUsername = claims.getSubject();
        
        Map<String, Object> admin = adminRepository.findAdminByUsername(adminUsername)
            .orElseThrow(() -> new RuntimeException("Admin context invalid"));
        long adminId = ((Number) admin.get("id")).longValue();

        adminRepository.updateCaptainKycStatus(captainId, status, reason, adminId);
        
        // If approved, automatically activate their accounts_customuser.account_active
        if ("APPROVED".equalsIgnoreCase(status)) {
            adminRepository.updateCaptainAccountStatus(captainId, true);
        }
    }

    // Sub-Admin CRUD
    public List<Map<String, Object>> getSubAdmins(String token) {
        verifyAdminToken(token, "sub_admins");
        return adminRepository.listSubAdmins();
    }

    public void createSubAdmin(String token, String username, String password, String email, String modules) {
        verifyAdminToken(token, "sub_admins");
        
        if (adminRepository.findAdminByUsername(username).isPresent()) {
            throw new RuntimeException("Admin username '" + username + "' already exists.");
        }
        
        String passHash = passwordEncoder.encode(password);
        adminRepository.insertSubAdmin(username, passHash, email, modules);
    }

    public void updateSubAdmin(String token, long subAdminId, String email, String modules) {
        verifyAdminToken(token, "sub_admins");
        adminRepository.updateSubAdmin(subAdminId, email, modules);
    }

    public void deleteSubAdmin(String token, long subAdminId) {
        verifyAdminToken(token, "sub_admins");
        adminRepository.deleteSubAdmin(subAdminId);
    }

    // Helper to extract claims and check module permissions
    private Claims verifyAdminToken(String authHeader, String requiredModule) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized. No admin token provided.");
        }
        String token = authHeader.substring(7);
        Claims claims = jwtService.validateToken(token);
        
        String type = claims.get("type", String.class);
        if (!"admin".equals(type)) {
            throw new RuntimeException("Forbidden. Access denied for non-admins.");
        }

        if (requiredModule != null) {
            String role = claims.get("role", String.class);
            String modules = claims.get("modules", String.class);
            if (!"SUPER_ADMIN".equalsIgnoreCase(role)) {
                if (modules == null || (!modules.contains("all") && !modules.contains(requiredModule))) {
                    throw new RuntimeException("Forbidden. You do not have permissions for the '" + requiredModule + "' module.");
                }
            }
        }
        return claims;
    }
}
