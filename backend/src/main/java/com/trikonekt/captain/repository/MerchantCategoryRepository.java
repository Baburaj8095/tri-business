package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.MerchantCategoryResponse;
import com.trikonekt.captain.model.MerchantSubCategoryResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

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
}
