package com.trikonekt.captain.controller;

import com.trikonekt.captain.repository.OnlineCategoryRepository;
import com.trikonekt.captain.repository.AdminRepository;
import com.trikonekt.captain.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Online Product Categories — admin-curated categories for online marketplace.
 * Separate from business_merchantcategory (shop categories).
 *
 * PUBLIC:
 *   GET /captain/online-categories          → active list for consumer browse pills
 *
 * ADMIN (requires role=ADMIN or is_superuser):
 *   GET    /captain/admin/online-categories → all (including inactive)
 *   POST   /captain/admin/online-categories → create
 *   PUT    /captain/admin/online-categories/{id} → update
 *   DELETE /captain/admin/online-categories/{id} → delete
 */
@RestController
public class OnlineCategoryController {

    private final OnlineCategoryRepository repo;
    private final AdminRepository adminRepository;
    private final JwtService jwtService;

    public OnlineCategoryController(OnlineCategoryRepository repo,
                                     AdminRepository adminRepository,
                                     JwtService jwtService) {
        this.repo = repo;
        this.adminRepository = adminRepository;
        this.jwtService = jwtService;
    }

    // ── Public ───────────────────────────────────────────────────────────────

    @GetMapping("/captain/online-categories")
    public ResponseEntity<List<Map<String, Object>>> listActive() {
        return ResponseEntity.ok(repo.findAllActive());
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    @GetMapping("/captain/admin/online-categories")
    public ResponseEntity<?> adminList(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        try {
            requireAdmin(auth);
            return ResponseEntity.ok(repo.findAll());
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/captain/admin/online-categories")
    public ResponseEntity<?> create(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @RequestBody Map<String, Object> body) {
        try {
            requireAdmin(auth);
            String name = str(body, "name");
            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "name is required"));
            }
            String slug = str(body, "slug");
            if (slug == null || slug.isBlank()) slug = OnlineCategoryRepository.toSlug(name);
            long id = repo.create(
                name, slug,
                str(body, "icon_name"),
                str(body, "color"),
                intVal(body, "sort_order", 0)
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", id, "message", "Category created"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    @PutMapping("/captain/admin/online-categories/{id}")
    public ResponseEntity<?> update(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable long id,
            @RequestBody Map<String, Object> body) {
        try {
            requireAdmin(auth);
            String name = str(body, "name");
            if (name == null || name.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "name is required"));
            }
            String slug = str(body, "slug");
            if (slug == null || slug.isBlank()) slug = OnlineCategoryRepository.toSlug(name);
            boolean isActive = !"false".equalsIgnoreCase(String.valueOf(body.getOrDefault("is_active", "true")));
            int updated = repo.update(id, name, slug, str(body, "icon_name"), str(body, "color"),
                    intVal(body, "sort_order", 0), isActive);
            if (updated == 0) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Category not found"));
            return ResponseEntity.ok(Map.of("message", "Category updated"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/captain/admin/online-categories/{id}")
    public ResponseEntity<?> delete(
            @RequestHeader(value = "Authorization", required = false) String auth,
            @PathVariable long id) {
        try {
            requireAdmin(auth);
            int deleted = repo.delete(id);
            if (deleted == 0) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Category not found"));
            return ResponseEntity.ok(Map.of("message", "Category deleted"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void requireAdmin(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) throw new RuntimeException("Authorization required");
        String token = auth.substring(7);
        String username = jwtService.extractUsername(token);
        Map<String, Object> admin = adminRepository.findAdminByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        String role = String.valueOf(admin.getOrDefault("role", ""));
        if (!role.equals("SUPER_ADMIN") && !role.equals("ADMIN") && !role.equals("SUB_ADMIN")) {
            throw new RuntimeException("Admin access required");
        }
    }

    private static String str(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return (v != null && !v.toString().isBlank()) ? v.toString().trim() : null;
    }

    private static int intVal(Map<String, Object> body, String key, int def) {
        try { return Integer.parseInt(body.getOrDefault(key, def).toString()); }
        catch (Exception e) { return def; }
    }
}
