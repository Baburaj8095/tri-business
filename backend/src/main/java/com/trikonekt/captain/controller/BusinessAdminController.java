package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.AdminLoginRequest;
import com.trikonekt.captain.model.AdminLoginResponse;
import com.trikonekt.captain.model.CaptainProfileResponse;
import com.trikonekt.captain.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class BusinessAdminController {

    private final AdminService adminService;

    public BusinessAdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * POST /api/admin/auth/login
     */
    @PostMapping("/auth/login")
    public ResponseEntity<AdminLoginResponse> login(@RequestBody AdminLoginRequest req) {
        AdminLoginResponse response = adminService.login(req);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> stats = adminService.getDashboardStats(authHeader);
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/admin/captains
     */
    @GetMapping("/captains")
    public ResponseEntity<Map<String, Object>> getCaptains(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String kycStatus,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> res = adminService.getCaptains(authHeader, search, kycStatus, isActive, page, size);
        return ResponseEntity.ok(res);
    }

    /**
     * GET /api/admin/captains/{username}
     */
    @GetMapping("/captains/{username}")
    public ResponseEntity<CaptainProfileResponse> getCaptainDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String username) {
        CaptainProfileResponse response = adminService.getCaptainDetail(authHeader, username);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/admin/captains/{id}/status
     */
    @PatchMapping("/captains/{id}/status")
    public ResponseEntity<Map<String, String>> updateCaptainStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean active = body.get("active");
        if (active == null) {
            throw new IllegalArgumentException("Field 'active' is required.");
        }
        adminService.updateCaptainStatus(authHeader, id, active);
        return ResponseEntity.ok(Map.of("message", "Captain account status updated successfully."));
    }

    /**
     * GET /api/admin/merchants
     */
    @GetMapping("/merchants")
    public ResponseEntity<Map<String, Object>> getMerchants(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> res = adminService.getMerchants(authHeader, category, search, page, size);
        return ResponseEntity.ok(res);
    }

    /**
     * PATCH /api/admin/merchants/{id}/status
     */
    @PatchMapping("/merchants/{id}/status")
    public ResponseEntity<Map<String, String>> updateMerchantStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean active = body.get("active");
        if (active == null) {
            throw new IllegalArgumentException("Field 'active' is required.");
        }
        adminService.updateUserStatus(authHeader, id, active);
        return ResponseEntity.ok(Map.of("message", "Merchant account status updated successfully."));
    }

    /**
     * PATCH /api/admin/captains/{id}/kyc
     */
    @PatchMapping("/captains/{id}/kyc")
    public ResponseEntity<Map<String, String>> updateCaptainKyc(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String reason = body.get("reason");
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Field 'status' is required.");
        }
        adminService.updateCaptainKyc(authHeader, id, status, reason);
        return ResponseEntity.ok(Map.of("message", "Captain KYC status updated successfully."));
    }

    /**
     * POST /admin/onboard/merchant/{id}/verify
     * Approves a merchant and activates their shop profile.
     * LLD Section 6C: Admin Endpoints.
     */
    @PostMapping("/onboard/merchant/{id}/verify")
    public ResponseEntity<Map<String, String>> verifyMerchant(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long id,
            @RequestBody(required = false) Map<String, String> body) {
        String notes = body != null ? body.getOrDefault("notes", "") : "";
        adminService.verifyMerchant(authHeader, id, notes);
        return ResponseEntity.ok(Map.of("message", "Merchant verified and shop activated successfully."));
    }

    // Sub-Admin Management
    /**
     * GET /api/admin/sub-admins
     */
    @GetMapping("/sub-admins")
    public ResponseEntity<List<Map<String, Object>>> getSubAdmins(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(adminService.getSubAdmins(authHeader));
    }

    /**
     * POST /api/admin/sub-admins
     */
    @PostMapping("/sub-admins")
    public ResponseEntity<Map<String, String>> createSubAdmin(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String email = body.get("email");
        String modules = body.get("modules"); // Comma-separated: e.g. "captains,kyc"

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Username and Password are required fields.");
        }

        adminService.createSubAdmin(authHeader, username, password, email, modules);
        return ResponseEntity.ok(Map.of("message", "Sub-Admin created successfully."));
    }

    /**
     * PUT /api/admin/sub-admins/{id}
     */
    @PutMapping("/sub-admins/{id}")
    public ResponseEntity<Map<String, String>> updateSubAdmin(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long id,
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        String modules = body.get("modules");

        adminService.updateSubAdmin(authHeader, id, email, modules);
        return ResponseEntity.ok(Map.of("message", "Sub-Admin updated successfully."));
    }

    /**
     * DELETE /api/admin/sub-admins/{id}
     */
    @DeleteMapping("/sub-admins/{id}")
    public ResponseEntity<Map<String, String>> deleteSubAdmin(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long id) {
        adminService.deleteSubAdmin(authHeader, id);
        return ResponseEntity.ok(Map.of("message", "Sub-Admin deleted successfully."));
    }

    /**
     * GET /api/admin/online-products
     */
    @GetMapping("/online-products")
    public ResponseEntity<List<Map<String, Object>>> getOnlineProducts(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(adminService.getOnlineProducts(authHeader));
    }

    /**
     * PATCH /api/admin/products/{productId}/status
     */
    @PatchMapping("/products/{productId}/status")
    public ResponseEntity<Map<String, String>> updateProductStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long productId,
            @RequestBody Map<String, Boolean> body) {
        Boolean active = body.get("active");
        if (active == null) {
            throw new IllegalArgumentException("Field 'active' is required.");
        }
        adminService.updateProductStatus(authHeader, productId, active);
        return ResponseEntity.ok(Map.of("message", "Product status updated successfully."));
    }

    /**
     * DELETE /api/admin/products/{productId}
     */
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long productId) {
        adminService.deleteProduct(authHeader, productId);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully."));
    }

    /**
     * GET /api/admin/shops
     */
    @GetMapping("/shops")
    public ResponseEntity<List<Map<String, Object>>> getShops(
            @RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.ok(adminService.getShops(authHeader));
    }

    /**
     * PATCH /api/admin/shops/{shopId}/status
     */
    @PatchMapping("/shops/{shopId}/status")
    public ResponseEntity<Map<String, String>> updateShopStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long shopId,
            @RequestBody Map<String, Boolean> body) {
        Boolean active = body.get("active");
        if (active == null) {
            throw new IllegalArgumentException("Field 'active' is required.");
        }
        adminService.updateShopStatus(authHeader, shopId, active);
        return ResponseEntity.ok(Map.of("message", "Shop status updated successfully."));
    }

    /**
     * DELETE /api/admin/shops/{shopId}
     */
    @DeleteMapping("/shops/{shopId}")
    public ResponseEntity<Map<String, String>> deleteShop(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long shopId) {
        adminService.deleteShop(authHeader, shopId);
        return ResponseEntity.ok(Map.of("message", "Shop deleted successfully."));
    }

    /**
     * GET /api/admin/shops/{shopId}/products
     */
    @GetMapping("/shops/{shopId}/products")
    public ResponseEntity<List<Map<String, Object>>> getShopProducts(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable long shopId) {
        return ResponseEntity.ok(adminService.getShopProducts(authHeader, shopId));
    }
}
