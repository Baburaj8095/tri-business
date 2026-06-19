package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.MerchantProfileResponse;
import com.trikonekt.captain.model.MerchantProfileUpdateRequest;
import com.trikonekt.captain.model.ShopProductResponse;
import com.trikonekt.captain.model.ShopResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
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
            "SELECT id, shop_name, address, city, pincode, latitude, longitude, " +
            "contact_number, shop_image, category_id, subcategory_id, " +
            "status, created_at, service_mode, delivery_radius_km, min_order_value, base_delivery_fee " +
            "FROM market_shop WHERE merchant_id = ? ORDER BY created_at DESC",
            new Object[]{merchantId},
            (rs, rowNum) -> ShopResponse.builder()
                .id(rs.getLong("id"))
                .shop_name(rs.getString("shop_name"))
                .address(rs.getString("address"))
                .city(rs.getString("city"))
                .state(null)
                .pincode(rs.getString("pincode"))
                .latitude(rs.getDouble("latitude"))
                .longitude(rs.getDouble("longitude"))
                .contact_number(rs.getString("contact_number"))
                .email(null)
                .shop_image(rs.getString("shop_image"))
                .banner(null)
                .category(rs.getLong("category_id"))
                .subcategory(rs.getLong("subcategory_id"))
                .description(null)
                .gst_number(null)
                .pan_number(null)
                .business_reg_number(null)
                .business_logo(null)
                .is_active("ACTIVE".equals(rs.getString("status")))
                .serviceMode(rs.getString("service_mode"))
                .deliveryRadiusKm(rs.getDouble("delivery_radius_km"))
                .minOrderValue(rs.getDouble("min_order_value"))
                .baseDeliveryFee(rs.getDouble("base_delivery_fee"))
                .createdAt(rs.getString("created_at"))
                .updatedAt(rs.getString("created_at"))
                .build()
        );
    }

    /**
     * Get shop by ID (public endpoint)
     */
    public Optional<ShopResponse> findActiveShopById(Long shopId) {
        List<ShopResponse> result = jdbc.query(
            "SELECT id, shop_name, address, city, pincode, latitude, longitude, " +
            "contact_number, shop_image, category_id, subcategory_id, " +
            "status, created_at, service_mode, delivery_radius_km, min_order_value, base_delivery_fee " +
            "FROM market_shop WHERE id = ? AND status = 'ACTIVE'",
            new Object[]{shopId},
            (rs, rowNum) -> ShopResponse.builder()
                .id(rs.getLong("id"))
                .shop_name(rs.getString("shop_name"))
                .address(rs.getString("address"))
                .city(rs.getString("city"))
                .state(null)
                .pincode(rs.getString("pincode"))
                .latitude(rs.getDouble("latitude"))
                .longitude(rs.getDouble("longitude"))
                .contact_number(rs.getString("contact_number"))
                .email(null)
                .shop_image(rs.getString("shop_image"))
                .banner(null)
                .category(rs.getLong("category_id"))
                .subcategory(rs.getLong("subcategory_id"))
                .description(null)
                .gst_number(null)
                .pan_number(null)
                .business_reg_number(null)
                .business_logo(null)
                .is_active("ACTIVE".equals(rs.getString("status")))
                .serviceMode(rs.getString("service_mode"))
                .deliveryRadiusKm(rs.getDouble("delivery_radius_km"))
                .minOrderValue(rs.getDouble("min_order_value"))
                .baseDeliveryFee(rs.getDouble("base_delivery_fee"))
                .createdAt(rs.getString("created_at"))
                .updatedAt(rs.getString("created_at"))
                .build()
        );
        return result.stream().findFirst();
    }

    /**
     * List all public active shops
     */
    public List<ShopResponse> findAllActiveShops() {
        return jdbc.query(
            "SELECT id, shop_name, address, city, pincode, latitude, longitude, " +
            "contact_number, shop_image, category_id, subcategory_id, " +
            "status, created_at, service_mode, delivery_radius_km, min_order_value, base_delivery_fee " +
            "FROM market_shop WHERE status = 'ACTIVE' ORDER BY created_at DESC",
            (rs, rowNum) -> ShopResponse.builder()
                .id(rs.getLong("id"))
                .shop_name(rs.getString("shop_name"))
                .address(rs.getString("address"))
                .city(rs.getString("city"))
                .state(null)
                .pincode(rs.getString("pincode"))
                .latitude(rs.getDouble("latitude"))
                .longitude(rs.getDouble("longitude"))
                .contact_number(rs.getString("contact_number"))
                .email(null)
                .shop_image(rs.getString("shop_image"))
                .banner(null)
                .category(rs.getLong("category_id"))
                .subcategory(rs.getLong("subcategory_id"))
                .description(null)
                .gst_number(null)
                .pan_number(null)
                .business_reg_number(null)
                .business_logo(null)
                .is_active("ACTIVE".equals(rs.getString("status")))
                .serviceMode(rs.getString("service_mode"))
                .deliveryRadiusKm(rs.getDouble("delivery_radius_km"))
                .minOrderValue(rs.getDouble("min_order_value"))
                .baseDeliveryFee(rs.getDouble("base_delivery_fee"))
                .createdAt(rs.getString("created_at"))
                .updatedAt(rs.getString("created_at"))
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
            "SELECT id, username, email, full_name, phone, pincode, role, category, is_active, address, age " +
            "FROM accounts_customuser WHERE id = ? AND (category = 'merchant' OR category = 'business')",
            new Object[]{userId},
            (rs, rowNum) -> {
                // Count shops
                Integer shopCount = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM market_shop WHERE merchant_id = ?",
                    new Object[]{userId},
                    Integer.class
                );
                String fullName = rs.getString("full_name");
                String phone = rs.getString("phone");
                int ageVal = rs.getInt("age");
                Integer age = rs.wasNull() ? null : ageVal;

                return MerchantProfileResponse.builder()
                    .id(rs.getLong("id"))
                    .username(rs.getString("username"))
                    .email(rs.getString("email"))
                    .full_name(fullName)
                    .businessName(fullName)
                    .phone(phone)
                    .mobileNumber(phone)
                    .pincode(rs.getString("pincode"))
                    .role(rs.getString("role"))
                    .category(rs.getString("category"))
                    .is_active(rs.getBoolean("is_active"))
                    .total_shops(shopCount != null ? shopCount : 0)
                    .address(rs.getString("address"))
                    .age(age)
                    .build();
            }
        );
        return result.stream().findFirst();
    }

    /**
     * Update merchant profile
     */
    public void updateMerchantProfile(Long userId, MerchantProfileUpdateRequest request) {
        String name = request.getBusinessName() != null ? request.getBusinessName() : request.getFullName();
        String phone = request.getMobileNumber() != null ? request.getMobileNumber() : request.getPhone();

        jdbc.update(
            "UPDATE accounts_customuser SET full_name = ?, phone = ?, email = ?, address = ?, age = ? WHERE id = ?",
            name, phone, request.getEmail(), request.getAddress(), request.getAge(), userId
        );
    }

    /**
     * Insert a new shop
     */
    public int insertShop(Long merchantId, String shopName, String address, String city, String state, String pincode,
                          Double latitude, Double longitude, String contactNumber, String email, String description,
                          Long categoryId, Long subcategoryId, String gstNumber, String panNumber, String businessRegNumber,
                          String now) {
        String sql = "INSERT INTO market_shop (" +
            "merchant_id, shop_name, address, city, pincode, latitude, longitude, " +
            "contact_number, category_id, subcategory_id, status, created_at" +
            ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW())";

        return jdbc.update(sql,
            merchantId, shopName, address, city, pincode, latitude, longitude,
            contactNumber, categoryId, subcategoryId
        );
    }

    /**
     * Find shop by ID and Merchant ID (authenticated)
     */
    public Optional<ShopResponse> findShopByIdAndMerchantId(Long shopId, Long merchantId) {
        List<ShopResponse> result = jdbc.query(
            "SELECT id, shop_name, address, city, pincode, latitude, longitude, " +
            "contact_number, shop_image, category_id, subcategory_id, " +
            "status, created_at, service_mode, delivery_radius_km, min_order_value, base_delivery_fee " +
            "FROM market_shop WHERE id = ? AND merchant_id = ?",
            new Object[]{shopId, merchantId},
            (rs, rowNum) -> ShopResponse.builder()
                .id(rs.getLong("id"))
                .shop_name(rs.getString("shop_name"))
                .address(rs.getString("address"))
                .city(rs.getString("city"))
                .state(null)
                .pincode(rs.getString("pincode"))
                .latitude(rs.getDouble("latitude"))
                .longitude(rs.getDouble("longitude"))
                .contact_number(rs.getString("contact_number"))
                .email(null)
                .shop_image(rs.getString("shop_image"))
                .banner(null)
                .category(rs.getLong("category_id"))
                .subcategory(rs.getLong("subcategory_id"))
                .description(null)
                .gst_number(null)
                .pan_number(null)
                .business_reg_number(null)
                .business_logo(null)
                .is_active("ACTIVE".equals(rs.getString("status")))
                .serviceMode(rs.getString("service_mode"))
                .deliveryRadiusKm(rs.getDouble("delivery_radius_km"))
                .minOrderValue(rs.getDouble("min_order_value"))
                .baseDeliveryFee(rs.getDouble("base_delivery_fee"))
                .createdAt(rs.getString("created_at"))
                .updatedAt(rs.getString("created_at"))
                .build()
        );
        return result.stream().findFirst();
    }

    /**
     * Update shop details
     */
    public int updateShop(Long shopId, Long merchantId, String shopName, String address, String city, String state, String pincode,
                          Double latitude, Double longitude, String contactNumber, Long categoryId, Long subcategoryId) {
        String sql = "UPDATE market_shop SET " +
            "shop_name = ?, address = ?, city = ?, pincode = ?, " +
            "latitude = ?, longitude = ?, contact_number = ?, " +
            "category_id = ?, subcategory_id = ? " +
            "WHERE id = ? AND merchant_id = ?";

        return jdbc.update(sql,
            shopName, address, city, pincode,
            latitude, longitude, contactNumber,
            categoryId, subcategoryId,
            shopId, merchantId
        );
    }

    /**
     * Delete shop by ID and Merchant ID
     */
    public int deleteShopByIdAndMerchantId(Long shopId, Long merchantId) {
        // First delete referencing products (to avoid constraint violations)
        jdbc.update("DELETE FROM market_shopproduct WHERE shop_id = ?", shopId);
        
        // Then delete the shop
        String sql = "DELETE FROM market_shop WHERE id = ? AND merchant_id = ?";
        return jdbc.update(sql, shopId, merchantId);
    }
}
