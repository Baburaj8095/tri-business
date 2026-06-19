package com.trikonekt.captain.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * CRUD for admin-managed online product categories (online_product_categories table).
 * These are separate from business_merchantcategory (which classifies shops).
 * Consumer browse pills on DeliveryPage are populated from this table.
 */
@Repository
public class OnlineCategoryRepository {

    private final JdbcTemplate jdbc;

    public OnlineCategoryRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Public: all active categories ordered by sort_order */
    public List<Map<String, Object>> findAllActive() {
        return jdbc.queryForList(
            "SELECT id, name, slug, icon_name, color, sort_order " +
            "FROM online_product_categories " +
            "WHERE is_active = TRUE " +
            "ORDER BY sort_order ASC, name ASC"
        );
    }

    /** Admin: all categories (including inactive) */
    public List<Map<String, Object>> findAll() {
        return jdbc.queryForList(
            "SELECT id, name, slug, icon_name, color, sort_order, is_active, created_at " +
            "FROM online_product_categories " +
            "ORDER BY sort_order ASC, name ASC"
        );
    }

    /** Admin: create */
    public long create(String name, String slug, String iconName, String color, int sortOrder) {
        return jdbc.queryForObject(
            "INSERT INTO online_product_categories (name, slug, icon_name, color, sort_order, is_active, created_at) " +
            "VALUES (?, ?, ?, ?, ?, TRUE, NOW()) RETURNING id",
            Long.class,
            name, slug, iconName != null ? iconName : "category",
            color != null ? color : "#0d9488", sortOrder
        );
    }

    /** Admin: update */
    public int update(long id, String name, String slug, String iconName, String color, int sortOrder, boolean isActive) {
        return jdbc.update(
            "UPDATE online_product_categories SET name=?, slug=?, icon_name=?, color=?, sort_order=?, is_active=? WHERE id=?",
            name, slug, iconName, color, sortOrder, isActive, id
        );
    }

    /** Admin: delete */
    public int delete(long id) {
        return jdbc.update("DELETE FROM online_product_categories WHERE id = ?", id);
    }

    /** Generate a URL-safe slug from a name */
    public static String toSlug(String name) {
        return name.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .trim()
            .replaceAll("\\s+", "-");
    }
}
