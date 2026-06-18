package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.MerchantCategoryResponse;
import com.trikonekt.captain.model.MerchantCategoryCreateRequest;
import com.trikonekt.captain.model.MerchantSubCategoryResponse;
import com.trikonekt.captain.model.MerchantSubCategoryCreateRequest;
import com.trikonekt.captain.repository.MerchantCategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public API for merchant categories and subcategories.
 * No authentication required — mirrors the Django /api/merchant/categories/ endpoint.
 *
 * GET /api/captain/merchant/categories
 *      ?audience=CONSUMER|MERCHANT  (optional)
 *      ?q=search_term               (optional, case-insensitive name search)
 *
 * GET /api/captain/merchant/subcategories
 *      ?category_id=1               (required)
 */
@RestController
@RequestMapping("/captain/merchant")
public class MerchantCategoryController {

    private final MerchantCategoryRepository categoryRepository;

    public MerchantCategoryController(MerchantCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * GET /api/captain/merchant/categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<MerchantCategoryResponse>> listCategories(
            @RequestParam(required = false) String audience,
            @RequestParam(required = false) String q
    ) {
        // Validate audience if provided
        if (audience != null && !audience.isBlank()) {
            String aud = audience.strip().toUpperCase();
            if (!aud.equals("CONSUMER") && !aud.equals("MERCHANT")) {
                audience = null; // ignore invalid value, return all
            } else {
                audience = aud;
            }
        }
        List<MerchantCategoryResponse> categories = categoryRepository.findActive(audience, q);
        return ResponseEntity.ok(categories);
    }

    /**
     * GET /api/captain/merchant/subcategories?category_id=1
     */
    @GetMapping("/subcategories")
    public ResponseEntity<List<MerchantSubCategoryResponse>> listSubcategories(
            @RequestParam(name = "category_id", required = false) Long categoryId
    ) {
        if (categoryId == null || categoryId <= 0) {
            return ResponseEntity.ok(List.of());
        }
        List<MerchantSubCategoryResponse> subcategories =
                categoryRepository.findSubcategoriesByCategoryId(categoryId);
        return ResponseEntity.ok(subcategories);
    }

    /**
     * POST /api/captain/merchant/categories
     * Create a new merchant category.
     */
    @PostMapping("/categories")
    public ResponseEntity<MerchantCategoryResponse> createCategory(
            @RequestBody MerchantCategoryCreateRequest request
    ) {
        String name = request.getName() != null ? request.getName().trim() : "";
        if (name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        MerchantCategoryResponse created = categoryRepository.createCategory(request);
        return ResponseEntity.ok(created);
    }

    /**
     * PUT /api/captain/merchant/categories/{id}
     * Update an existing merchant category.
     */
    @PutMapping("/categories/{id}")
    public ResponseEntity<MerchantCategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody MerchantCategoryCreateRequest request
    ) {
        String name = request.getName() != null ? request.getName().trim() : "";
        if (name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        MerchantCategoryResponse updated = categoryRepository.updateCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/captain/merchant/categories/{id}
     * Deactivate a merchant category.
     */
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/captain/merchant/subcategories
     * Create a new merchant subcategory.
     */
    @PostMapping("/subcategories")
    public ResponseEntity<MerchantSubCategoryResponse> createSubCategory(
            @RequestBody MerchantSubCategoryCreateRequest request
    ) {
        String name = request.getName() != null ? request.getName().trim() : "";
        if (name.isBlank() || request.getCategoryId() == null) {
            return ResponseEntity.badRequest().build();
        }

        MerchantSubCategoryResponse created = categoryRepository.createSubCategory(request);
        return ResponseEntity.ok(created);
    }

    /**
     * PUT /api/captain/merchant/subcategories/{id}
     * Update an existing subcategory.
     */
    @PutMapping("/subcategories/{id}")
    public ResponseEntity<MerchantSubCategoryResponse> updateSubCategory(
            @PathVariable Long id,
            @RequestBody MerchantSubCategoryCreateRequest request
    ) {
        String name = request.getName() != null ? request.getName().trim() : "";
        if (name.isBlank() || request.getCategoryId() == null) {
            return ResponseEntity.badRequest().build();
        }

        MerchantSubCategoryResponse updated = categoryRepository.updateSubCategory(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/captain/merchant/subcategories/{id}
     * Deactivate a subcategory.
     */
    @DeleteMapping("/subcategories/{id}")
    public ResponseEntity<Void> deleteSubCategory(@PathVariable Long id) {
        categoryRepository.deleteSubCategory(id);
        return ResponseEntity.noContent().build();
    }
}
