package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.MerchantCategoryResponse;
import com.trikonekt.captain.model.MerchantCategoryCreateRequest;
import com.trikonekt.captain.model.MerchantSubCategoryResponse;
import com.trikonekt.captain.model.MerchantSubCategoryCreateRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

@Repository
public class MerchantCategoryRepository {

    private final JdbcTemplate jdbc;

    public MerchantCategoryRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * List active categories with optional audience and name-search filters.
     * Mirrors Django business_merchantcategory table.
     */
    public List<MerchantCategoryResponse> findActive(String audience, String search) {
        StringBuilder sql = new StringBuilder(
            "SELECT id, name, audience, sort_order " +
            "FROM business_merchantcategory " +
            "WHERE is_active = TRUE"
        );
        List<Object> params = new ArrayList<>();

        if (audience != null && !audience.isBlank()) {
            sql.append(" AND audience = ?");
            params.add(audience.toUpperCase());
        }
        if (search != null && !search.isBlank()) {
            sql.append(" AND LOWER(name) LIKE ?");
            params.add("%" + search.toLowerCase() + "%");
        }

        sql.append(" ORDER BY sort_order ASC, name ASC");

        return jdbc.query(sql.toString(), params.toArray(), (rs, rowNum) ->
            MerchantCategoryResponse.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .audience(rs.getString("audience"))
                .sortOrder(rs.getInt("sort_order"))
                .build()
        );
    }

    /**
     * List active subcategories for a given category.
     * Mirrors Django business_merchantsubcategory table.
     */
    public List<MerchantSubCategoryResponse> findSubcategoriesByCategoryId(long categoryId) {
        return jdbc.query(
            "SELECT id, name, category_id, audience, sort_order " +
            "FROM business_merchantsubcategory " +
            "WHERE is_active = TRUE AND category_id = ? " +
            "ORDER BY sort_order ASC, name ASC",
            new Object[]{categoryId},
            (rs, rowNum) -> MerchantSubCategoryResponse.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .categoryId(rs.getLong("category_id"))
                .audience(rs.getString("audience"))
                .sortOrder(rs.getInt("sort_order"))
                .build()
        );
    }

    /**
     * Create a new merchant category.
     */
    public MerchantCategoryResponse createCategory(MerchantCategoryCreateRequest request) {
        final String name = request.getName() != null ? request.getName().trim() : "";
        final String origAudience = request.getAudience() != null ? request.getAudience().trim().toUpperCase() : "MERCHANT";
        final String audience = ("CONSUMER".equals(origAudience) || "MERCHANT".equals(origAudience)) ? origAudience : "MERCHANT";

        final Integer finalSortOrder;
        if (request.getSortOrder() != null && request.getSortOrder() >= 0) {
            finalSortOrder = request.getSortOrder();
        } else {
            finalSortOrder = jdbc.queryForObject(
                "SELECT COALESCE(MAX(sort_order), 0) + 1 FROM business_merchantcategory WHERE audience = ?",
                Integer.class,
                audience
            );
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO business_merchantcategory (name, audience, sort_order, is_active) VALUES (?, ?, ?, TRUE)",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, name);
            ps.setString(2, audience);
            ps.setInt(3, finalSortOrder);
            return ps;
        }, keyHolder);

        Long id = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
        if (id == null) {
            throw new RuntimeException("Failed to create merchant category");
        }

        return jdbc.queryForObject(
            "SELECT id, name, audience, sort_order FROM business_merchantcategory WHERE id = ?",
            new Object[]{id},
            (rs, rowNum) -> MerchantCategoryResponse.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .audience(rs.getString("audience"))
                .sortOrder(rs.getInt("sort_order"))
                .build()
        );
    }

    /**
     * Update an existing merchant category.
     */
    public MerchantCategoryResponse updateCategory(long id, MerchantCategoryCreateRequest request) {
        String name = request.getName() != null ? request.getName().trim() : "";
        String origAudience = request.getAudience() != null ? request.getAudience().trim().toUpperCase() : "MERCHANT";
        String audience = ("CONSUMER".equals(origAudience) || "MERCHANT".equals(origAudience)) ? origAudience : "MERCHANT";
        Integer sortOrder = request.getSortOrder();

        if (sortOrder != null && sortOrder >= 0) {
            jdbc.update(
                "UPDATE business_merchantcategory SET name = ?, audience = ?, sort_order = ? WHERE id = ?",
                name, audience, sortOrder, id
            );
        } else {
            jdbc.update(
                "UPDATE business_merchantcategory SET name = ?, audience = ? WHERE id = ?",
                name, audience, id
            );
        }

        return jdbc.queryForObject(
            "SELECT id, name, audience, sort_order FROM business_merchantcategory WHERE id = ?",
            new Object[]{id},
            (rs, rowNum) -> MerchantCategoryResponse.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .audience(rs.getString("audience"))
                .sortOrder(rs.getInt("sort_order"))
                .build()
        );
    }

    /**
     * Delete/Deactivate a merchant category.
     */
    public void deleteCategory(long id) {
        jdbc.update("UPDATE business_merchantcategory SET is_active = FALSE WHERE id = ?", id);
    }

    /**
     * Create a new merchant subcategory.
     */
    public MerchantSubCategoryResponse createSubCategory(MerchantSubCategoryCreateRequest request) {
        final String name = request.getName() != null ? request.getName().trim() : "";
        final Long categoryId = request.getCategoryId();
        final String origAudience = request.getAudience() != null ? request.getAudience().trim().toUpperCase() : "MERCHANT";
        final String audience = ("CONSUMER".equals(origAudience) || "MERCHANT".equals(origAudience)) ? origAudience : "MERCHANT";

        final Integer finalSortOrder;
        if (request.getSortOrder() != null && request.getSortOrder() >= 0) {
            finalSortOrder = request.getSortOrder();
        } else {
            finalSortOrder = jdbc.queryForObject(
                "SELECT COALESCE(MAX(sort_order), 0) + 1 FROM business_merchantsubcategory WHERE category_id = ?",
                Integer.class,
                categoryId
            );
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO business_merchantsubcategory (name, category_id, audience, sort_order, is_active) VALUES (?, ?, ?, ?, TRUE)",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, name);
            ps.setLong(2, categoryId);
            ps.setString(3, audience);
            ps.setInt(4, finalSortOrder);
            return ps;
        }, keyHolder);

        Long id = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
        if (id == null) {
            throw new RuntimeException("Failed to create merchant subcategory");
        }

        return jdbc.queryForObject(
            "SELECT id, name, category_id, audience, sort_order FROM business_merchantsubcategory WHERE id = ?",
            new Object[]{id},
            (rs, rowNum) -> MerchantSubCategoryResponse.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .categoryId(rs.getLong("category_id"))
                .audience(rs.getString("audience"))
                .sortOrder(rs.getInt("sort_order"))
                .build()
        );
    }

    /**
     * Update an existing subcategory.
     */
    public MerchantSubCategoryResponse updateSubCategory(long id, MerchantSubCategoryCreateRequest request) {
        String name = request.getName() != null ? request.getName().trim() : "";
        Long categoryId = request.getCategoryId();
        String origAudience = request.getAudience() != null ? request.getAudience().trim().toUpperCase() : "MERCHANT";
        String audience = ("CONSUMER".equals(origAudience) || "MERCHANT".equals(origAudience)) ? origAudience : "MERCHANT";
        Integer sortOrder = request.getSortOrder();

        if (sortOrder != null && sortOrder >= 0) {
            jdbc.update(
                "UPDATE business_merchantsubcategory SET name = ?, category_id = ?, audience = ?, sort_order = ? WHERE id = ?",
                name, categoryId, audience, sortOrder, id
            );
        } else {
            jdbc.update(
                "UPDATE business_merchantsubcategory SET name = ?, category_id = ?, audience = ? WHERE id = ?",
                name, categoryId, audience, id
            );
        }

        return jdbc.queryForObject(
            "SELECT id, name, category_id, audience, sort_order FROM business_merchantsubcategory WHERE id = ?",
            new Object[]{id},
            (rs, rowNum) -> MerchantSubCategoryResponse.builder()
                .id(rs.getLong("id"))
                .name(rs.getString("name"))
                .categoryId(rs.getLong("category_id"))
                .audience(rs.getString("audience"))
                .sortOrder(rs.getInt("sort_order"))
                .build()
        );
    }

    /**
     * Delete/Deactivate a merchant subcategory.
     */
    public void deleteSubCategory(long id) {
        jdbc.update("UPDATE business_merchantsubcategory SET is_active = FALSE WHERE id = ?", id);
    }
}
