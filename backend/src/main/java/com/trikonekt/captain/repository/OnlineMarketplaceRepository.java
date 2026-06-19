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
            "SELECT DISTINCT sp.category AS name, LOWER(REPLACE(sp.category,' ','-')) AS slug " +
            "FROM market_shopproduct sp " +
            "JOIN market_shop s ON sp.shop = s.id " +
            "WHERE sp.online_delivery = TRUE " +
            "  AND sp.is_active = TRUE " +
            "  AND sp.stock_qty > 0 " +
            "  AND s.is_active = TRUE " +
            "  AND sp.category IS NOT NULL " +
            "  AND sp.category <> '' " +
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
            "sp.stock_qty, sp.category, sp.image, sp.online_delivery, sp.offline_delivery, " +
            "s.id AS shop_id, s.shop_name, s.city AS shop_city, s.shop_image " +
            "FROM market_shopproduct sp " +
            "JOIN market_shop s ON sp.shop = s.id " +
            "WHERE sp.online_delivery = TRUE " +
            "  AND sp.is_active = TRUE " +
            "  AND sp.stock_qty > 0 " +
            "  AND s.is_active = TRUE "
        );

        List<Object> params = new ArrayList<>();

        if (category != null && !category.isBlank()) {
            sql.append("AND LOWER(sp.category) = LOWER(?) ");
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
     * Merchant's own online products (for OnlineProductsPage.jsx).
     * Requires the merchant's user ID.
     */
    public List<Map<String, Object>> findMerchantOnlineProducts(long merchantId, int limit, int offset) {
        return jdbc.queryForList(
            "SELECT sp.id, sp.title, sp.description, sp.mrp, sp.price, sp.discount_percent, " +
            "sp.stock_qty, sp.category, sp.image, sp.online_delivery, sp.offline_delivery, sp.is_active, " +
            "s.id AS shop_id, s.shop_name " +
            "FROM market_shopproduct sp " +
            "JOIN market_shop s ON sp.shop = s.id " +
            "WHERE s.merchant_id = ? " +
            "  AND sp.online_delivery = TRUE " +
            "ORDER BY sp.created_at DESC " +
            "LIMIT ? OFFSET ?",
            merchantId, limit, offset
        );
    }
}
