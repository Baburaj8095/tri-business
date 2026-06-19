package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.MarketplaceAd;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AdsRepository {

    private final JdbcTemplate jdbc;

    public AdsRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Fetch active BANNER ads ordered by priority.
     */
    public List<MarketplaceAd> findActiveBanners(int limit) {
        String sql =
            "SELECT a.id, a.ad_type, a.shop_id, a.product_id, a.title, a.description, " +
            "a.image_url, a.target_url, a.priority, a.is_active, " +
            "CAST(a.valid_from AS VARCHAR), CAST(a.valid_to AS VARCHAR) " +
            "FROM marketplace_ads a " +
            "WHERE a.ad_type = 'BANNER' AND a.is_active = TRUE " +
            "AND (a.valid_to IS NULL OR a.valid_to > NOW()) " +
            "ORDER BY a.priority ASC " +
            "LIMIT ?";
        return jdbc.query(sql, new Object[]{limit}, this::mapBasic);
    }

    /**
     * Fetch SPONSORED_SHOP ads joined with market_shop data.
     */
    public List<MarketplaceAd> findSponsoredShops(int limit) {
        String sql =
            "SELECT a.id, a.ad_type, a.shop_id, a.product_id, a.title, a.description, " +
            "a.image_url, a.target_url, a.priority, a.is_active, " +
            "CAST(a.valid_from AS VARCHAR), CAST(a.valid_to AS VARCHAR), " +
            "s.shop_name, s.city AS shop_city, s.shop_image " +
            "FROM marketplace_ads a " +
            "LEFT JOIN market_shop s ON a.shop_id = s.id " +
            "WHERE a.ad_type = 'SPONSORED_SHOP' AND a.is_active = TRUE " +
            "AND (a.valid_to IS NULL OR a.valid_to > NOW()) " +
            "ORDER BY a.priority ASC " +
            "LIMIT ?";
        return jdbc.query(sql, new Object[]{limit}, (rs, rowNum) -> {
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
    public List<MarketplaceAd> findFeaturedProducts(int limit) {
        String sql =
            "SELECT a.id, a.ad_type, a.shop_id, a.product_id, a.title, a.description, " +
            "a.image_url, a.target_url, a.priority, a.is_active, " +
            "CAST(a.valid_from AS VARCHAR), CAST(a.valid_to AS VARCHAR), " +
            "p.title AS product_title, p.price AS product_price, p.mrp AS product_mrp, " +
            "p.discount_percent AS product_discount_percent " +
            "FROM marketplace_ads a " +
            "LEFT JOIN market_shopproduct p ON a.product_id = p.id " +
            "WHERE a.ad_type = 'FEATURED_PRODUCT' AND a.is_active = TRUE " +
            "AND (a.valid_to IS NULL OR a.valid_to > NOW()) " +
            "ORDER BY a.priority ASC " +
            "LIMIT ?";
        return jdbc.query(sql, new Object[]{limit}, (rs, rowNum) -> {
            MarketplaceAd ad = mapBasic(rs, rowNum);
            ad.setProductTitle(rs.getString("product_title"));
            ad.setProductPrice(rs.getDouble("product_price"));
            ad.setProductMrp(rs.getDouble("product_mrp"));
            ad.setProductDiscountPercent(rs.getDouble("product_discount_percent"));
            return ad;
        });
    }

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
                .validFrom(rs.getString(11))
                .validTo(rs.getString(12))
                .build();
    }
}
