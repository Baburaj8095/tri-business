package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.MerchantProfileResponse;
import com.trikonekt.captain.model.ShopProductResponse;
import com.trikonekt.captain.model.ShopResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class ShopRepository {

    private final JdbcTemplate jdbc;

    public ShopRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Get merchant's own shops (authenticated endpoint)
     */
    public List<ShopResponse> findShopsByMerchantId(Long merchantId) {
        return jdbc.query(
            "SELECT id, shop_name, address, city, state, pincode, latitude, longitude, " +
            "contact_number, email, shop_image, banner, category_id, subcategory_id, " +
            "description, gst_number, pan_number, business_reg_number, business_logo, " +
            "is_active, created_at, updated_at " +
            "FROM market_shop WHERE merchant_id = ? ORDER BY created_at DESC",
            new Object[]{merchantId},
            (rs, rowNum) -> ShopResponse.builder()
                .id(rs.getLong("id"))
                .shop_name(rs.getString("shop_name"))
                .address(rs.getString("address"))
                .city(rs.getString("city"))
                .state(rs.getString("state"))
                .pincode(rs.getString("pincode"))
                .latitude(rs.getDouble("latitude"))
                .longitude(rs.getDouble("longitude"))
                .contact_number(rs.getString("contact_number"))
                .email(rs.getString("email"))
                .shop_image(rs.getString("shop_image"))
                .banner(rs.getString("banner"))
                .category(rs.getLong("category_id"))
                .subcategory(rs.getLong("subcategory_id"))
                .description(rs.getString("description"))
                .gst_number(rs.getString("gst_number"))
                .pan_number(rs.getString("pan_number"))
                .business_reg_number(rs.getString("business_reg_number"))
                .business_logo(rs.getString("business_logo"))
                .is_active(rs.getBoolean("is_active"))
                .createdAt(rs.getString("created_at"))
                .updatedAt(rs.getString("updated_at"))
                .build()
        );
    }

    /**
     * Get shop by ID (public endpoint)
     */
    public Optional<ShopResponse> findActiveShopById(Long shopId) {
        List<ShopResponse> result = jdbc.query(
            "SELECT id, shop_name, address, city, state, pincode, latitude, longitude, " +
            "contact_number, email, shop_image, banner, category_id, subcategory_id, " +
            "description, gst_number, pan_number, business_reg_number, business_logo, " +
            "is_active, created_at, updated_at " +
            "FROM market_shop WHERE id = ? AND is_active = TRUE",
            new Object[]{shopId},
            (rs, rowNum) -> ShopResponse.builder()
                .id(rs.getLong("id"))
                .shop_name(rs.getString("shop_name"))
                .address(rs.getString("address"))
                .city(rs.getString("city"))
                .state(rs.getString("state"))
                .pincode(rs.getString("pincode"))
                .latitude(rs.getDouble("latitude"))
                .longitude(rs.getDouble("longitude"))
                .contact_number(rs.getString("contact_number"))
                .email(rs.getString("email"))
                .shop_image(rs.getString("shop_image"))
                .banner(rs.getString("banner"))
                .category(rs.getLong("category_id"))
                .subcategory(rs.getLong("subcategory_id"))
                .description(rs.getString("description"))
                .gst_number(rs.getString("gst_number"))
                .pan_number(rs.getString("pan_number"))
                .business_reg_number(rs.getString("business_reg_number"))
                .business_logo(rs.getString("business_logo"))
                .is_active(rs.getBoolean("is_active"))
                .createdAt(rs.getString("created_at"))
                .updatedAt(rs.getString("updated_at"))
                .build()
        );
        return result.stream().findFirst();
    }

    /**
     * List all public active shops
     */
    public List<ShopResponse> findAllActiveShops() {
        return jdbc.query(
            "SELECT id, shop_name, address, city, state, pincode, latitude, longitude, " +
            "contact_number, email, shop_image, banner, category_id, subcategory_id, " +
            "description, gst_number, pan_number, business_reg_number, business_logo, " +
            "is_active, created_at, updated_at " +
            "FROM market_shop WHERE is_active = TRUE ORDER BY created_at DESC",
            (rs, rowNum) -> ShopResponse.builder()
                .id(rs.getLong("id"))
                .shop_name(rs.getString("shop_name"))
                .address(rs.getString("address"))
                .city(rs.getString("city"))
                .state(rs.getString("state"))
                .pincode(rs.getString("pincode"))
                .latitude(rs.getDouble("latitude"))
                .longitude(rs.getDouble("longitude"))
                .contact_number(rs.getString("contact_number"))
                .email(rs.getString("email"))
                .shop_image(rs.getString("shop_image"))
                .banner(rs.getString("banner"))
                .category(rs.getLong("category_id"))
                .subcategory(rs.getLong("subcategory_id"))
                .description(rs.getString("description"))
                .gst_number(rs.getString("gst_number"))
                .pan_number(rs.getString("pan_number"))
                .business_reg_number(rs.getString("business_reg_number"))
                .business_logo(rs.getString("business_logo"))
                .is_active(rs.getBoolean("is_active"))
                .createdAt(rs.getString("created_at"))
                .updatedAt(rs.getString("updated_at"))
                .build()
        );
    }

    /**
     * Get products for a shop
     */
    public List<ShopProductResponse> findProductsByShopId(Long shopId) {
        return jdbc.query(
            "SELECT id, title, description, mrp, price, discount_percent, " +
            "online_delivery, offline_delivery, stock_qty, image, is_active, created_at " +
            "FROM market_shopproduct WHERE shop_id = ? AND is_active = TRUE ORDER BY id DESC",
            new Object[]{shopId},
            (rs, rowNum) -> ShopProductResponse.builder()
                .id(rs.getLong("id"))
                .title(rs.getString("title"))
                .description(rs.getString("description"))
                .mrp(rs.getDouble("mrp"))
                .price(rs.getDouble("price"))
                .discountPercent(rs.getDouble("discount_percent"))
                .onlineDelivery(rs.getBoolean("online_delivery"))
                .offlineDelivery(rs.getBoolean("offline_delivery"))
                .stockQty(rs.getInt("stock_qty"))
                .image(rs.getString("image"))
                .is_active(rs.getBoolean("is_active"))
                .createdAt(rs.getString("created_at"))
                .build()
        );
    }

    /**
     * Get merchant profile
     */
    public Optional<MerchantProfileResponse> findMerchantProfile(Long userId) {
        List<MerchantProfileResponse> result = jdbc.query(
            "SELECT id, username, email, full_name, phone, pincode, role, category, is_active " +
            "FROM accounts_customuser WHERE id = ? AND (category = 'merchant' OR category = 'business')",
            new Object[]{userId},
            (rs, rowNum) -> {
                // Count shops
                Integer shopCount = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM market_shop WHERE merchant_id = ?",
                    new Object[]{userId},
                    Integer.class
                );
                return MerchantProfileResponse.builder()
                    .id(rs.getLong("id"))
                    .username(rs.getString("username"))
                    .email(rs.getString("email"))
                    .full_name(rs.getString("full_name"))
                    .phone(rs.getString("phone"))
                    .pincode(rs.getString("pincode"))
                    .role(rs.getString("role"))
                    .category(rs.getString("category"))
                    .is_active(rs.getBoolean("is_active"))
                    .total_shops(shopCount != null ? shopCount : 0)
                    .build();
            }
        );
        return result.stream().findFirst();
    }

    /**
     * Insert a new shop
     */
    public int insertShop(Long merchantId, String shopName, String address, String city, String state, String pincode,
                          Double latitude, Double longitude, String contactNumber, String email, String description,
                          Long categoryId, Long subcategoryId, String gstNumber, String panNumber, String businessRegNumber,
                          String now) {
        String sql = "INSERT INTO market_shop (" +
            "merchant_id, shop_name, address, city, state, pincode, latitude, longitude, " +
            "contact_number, email, description, category_id, subcategory_id, " +
            "gst_number, pan_number, business_reg_number, is_active, created_at, updated_at" +
            ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?, ?)";

        return jdbc.update(sql,
            merchantId, shopName, address, city, state, pincode, latitude, longitude,
            contactNumber, email, description, categoryId, subcategoryId,
            gstNumber, panNumber, businessRegNumber, now, now
        );
    }
}
