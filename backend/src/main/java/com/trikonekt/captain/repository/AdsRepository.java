package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.MarketplaceAd;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class AdsRepository {

    private final JdbcTemplate jdbc;

    public AdsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ─── Public read endpoints ───────────────────────────────────────────────────

    /**
     * Fetch active BANNER ads ordered by priority.
     * @param displayTarget optional filter e.g. "CONSUMER_ONLINE_B2C" — null = all banners
     */
    public List<MarketplaceAd> findActiveBanners(int limit, String displayTarget) {
        String base =
            "SELECT a.id, a.ad_type, a.shop_id, a.product_id, a.title, a.description, " +
            "a.image_url, a.target_url, a.priority, a.is_active, a.display_target, a.merchant_id, " +
            "CAST(a.valid_from AS VARCHAR), CAST(a.valid_to AS VARCHAR) " +
            "FROM marketplace_ads a " +
            "WHERE a.ad_type = 'BANNER' AND a.is_active = TRUE " +
            "AND (a.valid_to IS NULL OR a.valid_to > NOW()) ";
        List<Object> params = new ArrayList<>();
        if (displayTarget != null && !displayTarget.isBlank()) {
            base += "AND a.display_target = ? ";
            params.add(displayTarget);
        }
        base += "ORDER BY a.priority ASC LIMIT ?";
        params.add(limit);
        return jdbc.query(base, params.toArray(), this::mapBasic);
    }

    /**
     * Fetch SPONSORED_SHOP ads joined with market_shop data.
     */
    public List<MarketplaceAd> findSponsoredShops(int limit, String displayTarget) {
        String base =
            "SELECT a.id, a.ad_type, a.shop_id, a.product_id, a.title, a.description, " +
            "a.image_url, a.target_url, a.priority, a.is_active, a.display_target, a.merchant_id, " +
            "CAST(a.valid_from AS VARCHAR), CAST(a.valid_to AS VARCHAR), " +
            "s.shop_name, s.city AS shop_city, s.shop_image " +
            "FROM marketplace_ads a " +
            "LEFT JOIN market_shop s ON a.shop_id = s.id " +
            "WHERE a.ad_type = 'SPONSORED_SHOP' AND a.is_active = TRUE " +
            "AND (a.valid_to IS NULL OR a.valid_to > NOW()) ";
        List<Object> params = new ArrayList<>();
        if (displayTarget != null && !displayTarget.isBlank()) {
            base += "AND a.display_target = ? ";
            params.add(displayTarget);
        }
        base += "ORDER BY a.priority ASC LIMIT ?";
        params.add(limit);
        return jdbc.query(base, params.toArray(), (rs, rowNum) -> {
            MarketplaceAd ad = mapBasic(rs, rowNum);
            ad.setShopName(rs.getString("shop_name"));
            ad.setShopCity(rs.getString("shop_city"));
            ad.setShopImage(rs.getString("shop_image"));
            return ad;
        });
    }

    /**
     * Fetch FEATURED_PRODUCT ads joined with market_shopproduct data.
     */
    public List<MarketplaceAd> findFeaturedProducts(int limit, String displayTarget) {
        String base =
            "SELECT a.id, a.ad_type, a.shop_id, a.product_id, a.title, a.description, " +
            "a.image_url, a.target_url, a.priority, a.is_active, a.display_target, a.merchant_id, " +
            "CAST(a.valid_from AS VARCHAR), CAST(a.valid_to AS VARCHAR), " +
            "p.title AS product_title, p.price AS product_price, p.mrp AS product_mrp, " +
            "p.discount_percent AS product_discount_percent " +
            "FROM marketplace_ads a " +
            "LEFT JOIN market_shopproduct p ON a.product_id = p.id " +
            "WHERE a.ad_type = 'FEATURED_PRODUCT' AND a.is_active = TRUE " +
            "AND (a.valid_to IS NULL OR a.valid_to > NOW()) ";
        List<Object> params = new ArrayList<>();
        if (displayTarget != null && !displayTarget.isBlank()) {
            base += "AND a.display_target = ? ";
            params.add(displayTarget);
        }
        base += "ORDER BY a.priority ASC LIMIT ?";
        params.add(limit);
        return jdbc.query(base, params.toArray(), (rs, rowNum) -> {
            MarketplaceAd ad = mapBasic(rs, rowNum);
            ad.setProductTitle(rs.getString("product_title"));
            ad.setProductPrice(rs.getDouble("product_price"));
            ad.setProductMrp(rs.getDouble("product_mrp"));
            ad.setProductDiscountPercent(rs.getDouble("product_discount_percent"));
            return ad;
        });
    }

    // ─── Merchant-owned ad CRUD ────────────────────────────────────────────────

    /**
     * List all ads belonging to a specific merchant (including inactive).
     */
    public List<MarketplaceAd> findAdsByMerchant(long merchantId) {
        String sql =
            "SELECT a.id, a.ad_type, a.shop_id, a.product_id, a.title, a.description, " +
            "a.image_url, a.target_url, a.priority, a.is_active, a.display_target, a.merchant_id, " +
            "CAST(a.valid_from AS VARCHAR), CAST(a.valid_to AS VARCHAR) " +
            "FROM marketplace_ads a " +
            "WHERE a.merchant_id = ? " +
            "ORDER BY a.created_at DESC";
        return jdbc.query(sql, new Object[]{merchantId}, this::mapBasic);
    }

    /**
     * Create a new ad owned by the given merchant.
     * Returns the generated id.
     */
    public long createAd(long merchantId, String adType, String title, String description,
                         String imageUrl, String targetUrl, String displayTarget,
                         int priority, Long shopId, Long productId,
                         LocalDateTime validFrom, LocalDateTime validTo) {
        String sql =
            "INSERT INTO marketplace_ads " +
            "(merchant_id, ad_type, title, description, image_url, target_url, " +
            " display_target, priority, shop_id, product_id, is_active, valid_from, valid_to, created_at) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, NOW()) " +
            "RETURNING id";
        return jdbc.queryForObject(sql, Long.class,
            merchantId, adType, title, description, imageUrl, targetUrl,
            displayTarget, priority, shopId, productId,
            validFrom != null ? Timestamp.valueOf(validFrom) : Timestamp.valueOf(LocalDateTime.now()),
            validTo != null ? Timestamp.valueOf(validTo) : null);
    }

    /**
     * Update an ad — only if it belongs to the given merchant.
     */
    public int updateAd(long id, long merchantId, String adType, String title, String description,
                        String imageUrl, String targetUrl, String displayTarget,
                        int priority, boolean isActive, Long shopId, Long productId,
                        LocalDateTime validFrom, LocalDateTime validTo) {
        String sql =
            "UPDATE marketplace_ads SET " +
            "ad_type = ?, title = ?, description = ?, image_url = ?, target_url = ?, " +
            "display_target = ?, priority = ?, is_active = ?, shop_id = ?, product_id = ?, " +
            "valid_from = ?, valid_to = ? " +
            "WHERE id = ? AND merchant_id = ?";
        return jdbc.update(sql,
            adType, title, description, imageUrl, targetUrl,
            displayTarget, priority, isActive, shopId, productId,
            validFrom != null ? Timestamp.valueOf(validFrom) : null,
            validTo != null ? Timestamp.valueOf(validTo) : null,
            id, merchantId);
    }

    /**
     * Delete an ad — only if it belongs to the given merchant.
     */
    public int deleteAd(long id, long merchantId) {
        return jdbc.update("DELETE FROM marketplace_ads WHERE id = ? AND merchant_id = ?", id, merchantId);
    }

    /**
     * Toggle active state — only if it belongs to the given merchant.
     */
    public int toggleActive(long id, long merchantId, boolean active) {
        return jdbc.update("UPDATE marketplace_ads SET is_active = ? WHERE id = ? AND merchant_id = ?",
                active, id, merchantId);
    }

    // ─── Mapper ───────────────────────────────────────────────────────────────

    private MarketplaceAd mapBasic(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return MarketplaceAd.builder()
                .id(rs.getLong("id"))
                .adType(rs.getString("ad_type"))
                .shopId(rs.getObject("shop_id") != null ? rs.getLong("shop_id") : null)
                .productId(rs.getObject("product_id") != null ? rs.getLong("product_id") : null)
                .title(rs.getString("title"))
                .description(rs.getString("description"))
                .imageUrl(rs.getString("image_url"))
                .targetUrl(rs.getString("target_url"))
                .priority(rs.getInt("priority"))
                .isActive(rs.getBoolean("is_active"))
                .displayTarget(rs.getString("display_target"))
                .merchantId(rs.getObject("merchant_id") != null ? rs.getLong("merchant_id") : null)
                .validFrom(rs.getString("valid_from"))
                .validTo(rs.getString("valid_to"))
                .build();
    }
}
