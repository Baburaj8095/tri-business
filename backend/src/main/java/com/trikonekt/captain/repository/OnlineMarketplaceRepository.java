package com.trikonekt.captain.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Online Marketplace — public product browsing for consumers.
 * Uses market_shopproduct.online_delivery = TRUE (NOT available_for_online).
 */
@Repository
public class OnlineMarketplaceRepository {

    private final JdbcTemplate jdbc;

    public OnlineMarketplaceRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Distinct active online product categories.
     * Feeds the consumer DeliveryPage category pills.
     * Falls back to admin-curated online_product_categories when those exist.
     */
    public List<Map<String, Object>> findDistinctOnlineCategories() {
        // First try admin-curated list
        List<Map<String, Object>> curated = jdbc.queryForList(
            "SELECT name, slug, icon_name, color, sort_order " +
            "FROM online_product_categories " +
            "WHERE is_active = TRUE " +
            "ORDER BY sort_order ASC, name ASC"
        );
        if (!curated.isEmpty()) return curated;

        // Fallback: derive from product data
        return jdbc.queryForList(
            "SELECT DISTINCT mc.name AS name, LOWER(REPLACE(mc.name,' ','-')) AS slug " +
            "FROM market_shopproduct sp " +
            "JOIN market_shop s ON sp.shop_id = s.id " +
            "LEFT JOIN business_merchantcategory mc ON s.category_id = mc.id " +
            "WHERE sp.online_delivery = TRUE " +
            "  AND sp.is_active = TRUE " +
            "  AND sp.stock_qty > 0 " +
            "  AND s.status = 'ACTIVE' " +
            "  AND mc.name IS NOT NULL " +
            "  AND mc.name <> '' " +
            "ORDER BY name ASC " +
            "LIMIT 40"
        );
    }

    /**
     * Online products with optional category filter and search.
     * Returns all active, in-stock products with online_delivery = TRUE.
     */
    public List<Map<String, Object>> findOnlineProducts(String category, String search, int limit, int offset) {
        StringBuilder sql = new StringBuilder(
            "SELECT sp.id, sp.title, sp.description, sp.mrp, sp.price, sp.discount_percent, " +
            "sp.stock_qty, mc.name AS category, sp.image, sp.image AS image_url, sp.online_delivery, sp.offline_delivery, " +
            "s.id AS shop_id, s.shop_name, s.city AS shop_city, s.shop_image, u.category AS merchant_category " +
            "FROM market_shopproduct sp " +
            "JOIN market_shop s ON sp.shop_id = s.id " +
            "JOIN accounts_customuser u ON s.merchant_id = u.id " +
            "LEFT JOIN market_merchantprofile mp ON mp.user_id = u.id " +
            "LEFT JOIN business_merchantcategory mc ON s.category_id = mc.id " +
            "WHERE sp.online_delivery = TRUE " +
            "  AND sp.is_active = TRUE " +
            "  AND sp.stock_qty > 0 " +
            "  AND s.status = 'ACTIVE' " +
            "  AND u.category = 'business' " +
            "  AND UPPER(COALESCE(mp.service_mode, 'OFFLINE')) = 'ONLINE' "
        );

        List<Object> params = new ArrayList<>();

        if (category != null && !category.isBlank()) {
            sql.append("AND LOWER(mc.name) = LOWER(?) ");
            params.add(category.trim());
        }
        if (search != null && !search.isBlank()) {
            sql.append("AND (LOWER(sp.title) LIKE LOWER(?) OR LOWER(sp.description) LIKE LOWER(?)) ");
            String like = "%" + search.trim() + "%";
            params.add(like);
            params.add(like);
        }

        sql.append("ORDER BY sp.created_at DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbc.queryForList(sql.toString(), params.toArray());
    }

    /**
     * Business B2B online marketplace.
     * Returns active, in-stock products uploaded by ONLINE/BOTH B2B merchants only.
     * By default callers should exclude the logged-in merchant's own products.
     */
    public List<Map<String, Object>> findBusinessOnlineProducts(long viewerMerchantId, boolean excludeOwn, String category, String search, int limit, int offset) {
        StringBuilder sql = new StringBuilder(
            "SELECT sp.id, sp.title, sp.description, sp.mrp, sp.price, sp.discount_percent, " +
            "sp.stock_qty, mc.name AS category, sp.image, sp.image AS image_url, sp.online_delivery, sp.offline_delivery, " +
            "s.id AS shop_id, s.shop_name, s.city AS shop_city, s.shop_image, s.merchant_id, " +
            "u.full_name AS merchant_name, u.category AS merchant_category, " +
            "COALESCE(mp.business_name, u.full_name, s.shop_name) AS business_name, " +
            "COALESCE(mp.service_mode, s.service_mode, 'OFFLINE') AS service_mode, " +
            "CASE WHEN s.merchant_id = ? THEN TRUE ELSE FALSE END AS is_own_product " +
            "FROM market_shopproduct sp " +
            "JOIN market_shop s ON sp.shop_id = s.id " +
            "JOIN accounts_customuser u ON s.merchant_id = u.id " +
            "LEFT JOIN market_merchantprofile mp ON mp.user_id = u.id " +
            "LEFT JOIN business_merchantcategory mc ON s.category_id = mc.id " +
            "WHERE sp.online_delivery = TRUE " +
            "  AND sp.is_active = TRUE " +
            "  AND sp.stock_qty > 0 " +
            "  AND s.status = 'ACTIVE' " +
            "  AND u.category = 'merchant' " +
            "  AND UPPER(COALESCE(mp.service_mode, 'OFFLINE')) = 'ONLINE' "
        );

        List<Object> params = new ArrayList<>();
        params.add(viewerMerchantId);

        if (excludeOwn) {
            sql.append("AND s.merchant_id <> ? ");
            params.add(viewerMerchantId);
        }

        if (category != null && !category.isBlank()) {
            sql.append("AND LOWER(mc.name) = LOWER(?) ");
            params.add(category.trim());
        }
        if (search != null && !search.isBlank()) {
            sql.append("AND (LOWER(sp.title) LIKE LOWER(?) OR LOWER(sp.description) LIKE LOWER(?) OR LOWER(s.shop_name) LIKE LOWER(?)) ");
            String like = "%" + search.trim() + "%";
            params.add(like);
            params.add(like);
            params.add(like);
        }

        sql.append("ORDER BY sp.created_at DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbc.queryForList(sql.toString(), params.toArray());
    }

    /**
     * Merchant's own online products (for OnlineProductsPage.jsx).
     * Requires the merchant's user ID.
     */
    public List<Map<String, Object>> findMerchantOnlineProducts(long merchantId, int limit, int offset) {
        return jdbc.queryForList(
            "SELECT sp.id, sp.title, sp.description, sp.mrp, sp.price, sp.discount_percent, " +
            "sp.stock_qty, mc.name AS category, sp.image, sp.online_delivery, sp.offline_delivery, sp.is_active, " +
            "s.id AS shop_id, s.shop_name " +
            "FROM market_shopproduct sp " +
            "JOIN market_shop s ON sp.shop_id = s.id " +
            "LEFT JOIN business_merchantcategory mc ON s.category_id = mc.id " +
            "WHERE s.merchant_id = ? " +
            "  AND sp.online_delivery = TRUE " +
            "ORDER BY sp.created_at DESC " +
            "LIMIT ? OFFSET ?",
            merchantId, limit, offset
        );
    }
}
