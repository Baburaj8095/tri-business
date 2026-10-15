package com.trikonekt.captain.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Map<String, Object>> findByUsername(String username) {
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT u.id, u.username, u.password, u.email, u.full_name, u.phone, u.pincode, u.address, " +
            "u.sponsor_id, u.prefixed_id, u.prefix_code, u.role, u.category, u.is_active, " +
            "COALESCE(mp.service_mode, 'OFFLINE') AS service_mode " +
            "FROM accounts_customuser u " +
            "LEFT JOIN market_merchantprofile mp ON mp.user_id = u.id " +
            "WHERE u.username = ? LIMIT 1",
            username
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public Optional<Map<String, Object>> findCaptainByPhone(String phone) {
        if (phone == null || phone.isBlank()) return Optional.empty();
        String cleanDigits = phone.replaceAll("\\D", "");
        String phone10 = cleanDigits.length() >= 10 ? cleanDigits.substring(cleanDigits.length() - 10) : cleanDigits;

        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT u.id, u.username, u.password, u.email, u.full_name, u.phone, u.pincode, " +
            "       u.sponsor_id, u.prefixed_id, u.prefix_code, u.role, u.category, u.is_active, " +
            "       'OFFLINE' AS service_mode " +
            "FROM accounts_customuser u " +
            "WHERE (u.phone = ? OR u.phone = ? OR u.phone = ? " +
            "       OR UPPER(u.username) = UPPER(?) OR UPPER(u.username) = UPPER(?) " +
            "       OR UPPER(u.prefixed_id) = UPPER(?) OR UPPER(u.prefixed_id) = UPPER(?)) " +
            "  AND u.category = 'agency_sub_franchise' " +
            "ORDER BY u.id DESC LIMIT 1",
            phone10, "+91" + phone10, "91" + phone10,
            "CB" + phone10, phone10,
            "CB-" + phone10, "CB" + phone10
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public Optional<Map<String, Object>> findMerchantByPhone(String phone) {
        if (phone == null || phone.isBlank()) return Optional.empty();
        String cleanDigits = phone.replaceAll("\\D", "");
        String phone10 = cleanDigits.length() >= 10 ? cleanDigits.substring(cleanDigits.length() - 10) : cleanDigits;

        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT u.id, u.username, u.password, u.email, u.full_name, u.phone, u.pincode, " +
            "       u.sponsor_id, u.prefixed_id, u.prefix_code, u.role, u.category, u.is_active, " +
            "       COALESCE(mp.service_mode, 'OFFLINE') AS service_mode " +
            "FROM accounts_customuser u " +
            "LEFT JOIN market_merchantprofile mp ON mp.user_id = u.id " +
            "WHERE (u.phone = ? OR u.phone = ? OR u.phone = ? " +
            "       OR u.username LIKE ? OR u.prefixed_id LIKE ? OR u.username = ?) " +
            "  AND (u.category = 'business' OR u.category = 'merchant') " +
            "ORDER BY u.id DESC LIMIT 1",
            phone10, "+91" + phone10, "91" + phone10,
            "%" + phone10, "%" + phone10, phone10
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public Optional<Map<String, Object>> findByPhone(String phone) {
        if (phone == null || phone.isBlank()) return Optional.empty();
        String cleanDigits = phone.replaceAll("\\D", "");
        String phone10 = cleanDigits.length() >= 10 ? cleanDigits.substring(cleanDigits.length() - 10) : cleanDigits;

        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT u.id, u.username, u.password, u.email, u.full_name, u.phone, u.pincode, " +
            "       u.sponsor_id, u.prefixed_id, u.prefix_code, u.role, u.category, u.is_active, " +
            "       COALESCE(mp.service_mode, 'OFFLINE') AS service_mode " +
            "FROM accounts_customuser u " +
            "LEFT JOIN market_merchantprofile mp ON mp.user_id = u.id " +
            "WHERE (u.phone = ? OR u.phone = ? OR u.phone = ? OR u.phone = ?) " +
            "  AND (u.category = 'agency_sub_franchise' OR u.category = 'business' OR u.category = 'merchant') " +
            "ORDER BY CASE " +
            "    WHEN u.category = 'agency_sub_franchise' THEN 0 " +
            "    WHEN u.category IN ('business', 'merchant') THEN 1 " +
            "    ELSE 2 " +
            "END, u.id DESC LIMIT 1",
            phone, phone10, "+91" + phone10, "91" + phone10
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public List<Map<String, Object>> findPublicB2bMerchants() {
        return jdbc.queryForList(
            "SELECT s.id, u.id as user_id, u.full_name, u.phone, u.pincode, " +
            "       s.shop_name, s.address, s.city, s.contact_number, mc.name as category_name, " +
            "       'B2B Wholesale' as business_type, " +
            "       CASE WHEN UPPER(COALESCE(s.status, '')) = 'ACTIVE' THEN true ELSE false END as is_active " +
            "FROM accounts_customuser u " +
            "JOIN market_shop s ON u.id = s.merchant_id " +
            "LEFT JOIN business_merchantcategory mc ON s.category_id = mc.id " +
            "LEFT JOIN market_merchantprofile mp ON u.id = mp.user_id " +
            "WHERE (u.category = 'merchant' OR u.username LIKE 'ONB2B%' OR u.username LIKE 'NSB2B%' OR UPPER(COALESCE(mp.service_mode, '')) = 'B2B') " +
            "  AND u.category <> 'business' " +
            "  AND NOT (u.username LIKE 'ONB2C%' OR u.username LIKE 'NSB2C%') " +
            "  AND u.is_active = true AND UPPER(COALESCE(s.status, '')) = 'ACTIVE' " +
            "LIMIT 50"
        );
    }

    public List<Map<String, Object>> findPublicB2cMerchants() {
        return jdbc.queryForList(
            "SELECT s.id, u.id as user_id, u.full_name, u.phone, u.pincode as user_pincode, " +
            "       s.shop_name, s.address, s.city, s.pincode as shop_pincode, s.contact_number, " +
            "       s.latitude, s.longitude, s.service_mode, s.home_delivery_enabled, " +
            "       LEAST(s.delivery_radius_km, 25.00) AS delivery_radius_km, " +
            "       s.min_order_value, s.base_delivery_fee, s.shop_image, s.category_id, mc.name as category_name, " +
            "       s.tri_app_id, ta.name as tri_app_name, ta.slug as tri_app_slug, " +
            "       CASE WHEN UPPER(COALESCE(s.status, '')) = 'ACTIVE' THEN true ELSE false END as is_active " +
            "FROM accounts_customuser u " +
            "JOIN market_shop s ON u.id = s.merchant_id " +
            "LEFT JOIN market_merchantprofile mp ON u.id = mp.user_id " +
            "LEFT JOIN business_merchantcategory mc ON s.category_id = mc.id " +
            "LEFT JOIN business_triapp ta ON s.tri_app_id = ta.id " +
            "WHERE (u.category = 'business' OR u.category = 'merchant') AND u.is_active = true AND UPPER(COALESCE(s.status, '')) = 'ACTIVE' " +
            "AND UPPER(COALESCE(s.service_mode, mp.service_mode, 'OFFLINE')) <> 'ONLINE' " +
            "LIMIT 50"
        );
    }

    /**
     * Searches for a sponsor by username, phone, or prefixed_id (case-insensitive).
     * Enforces Captain (agency_sub_franchise) or TRPN (agency_pincode) roles.
     * Prevents non-captain personas (consumer, business) with the same phone number from matching.
     */
    public Optional<Map<String, Object>> findSponsor(String sponsorId) {
        if (sponsorId == null || sponsorId.isBlank()) {
            return Optional.empty();
        }
        String clean = sponsorId.trim();
        String cleanDigits = clean.replaceAll("\\D", "");
        String phone10 = cleanDigits.length() >= 10 ? cleanDigits.substring(cleanDigits.length() - 10) : cleanDigits;

        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT u.id, u.username, u.full_name, u.category, u.role, u.pincode, u.sponsor_id, u.prefixed_id, u.phone, u.is_superuser, u.is_staff, u.is_active, " +
            "       COALESCE(ara.district, '') as district, COALESCE(CAST(ara.state_id AS VARCHAR), '') as state " +
            "FROM accounts_customuser u " +
            "LEFT JOIN accounts_agencyregionassignment ara ON u.id = ara.user_id " +
            "WHERE (u.phone = ? OR u.phone = ? OR u.phone = ? OR u.phone = ? " +
            "    OR UPPER(u.username) = UPPER(?) OR UPPER(u.prefixed_id) = UPPER(?) " +
            "    OR UPPER(u.username) = UPPER(?) OR UPPER(u.username) = UPPER(?) " +
            "    OR UPPER(u.prefixed_id) = UPPER(?) OR UPPER(u.prefixed_id) = UPPER(?) " +
            "    OR (LENGTH(?) >= 10 AND u.phone LIKE ?)) " +
            "AND (u.is_active = true OR u.is_active IS NULL OR u.account_active = true) " +
            "AND u.category IN ('agency_sub_franchise', 'agency_pincode') " +
            "ORDER BY CASE WHEN u.category = 'agency_sub_franchise' THEN 0 ELSE 1 END, u.id DESC " +
            "LIMIT 1",
            clean, phone10, "+91" + phone10, "91" + phone10,
            clean, clean, "CB" + clean, "CB" + phone10,
            "CB-" + clean, "CB-" + phone10,
            phone10, "%" + phone10
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public boolean existsByUsername(String username) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM accounts_customuser WHERE username = ?",
            Integer.class, username
        );
        return count != null && count > 0;
    }

    public boolean existsByPhone(String phone) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM accounts_customuser WHERE phone = ?",
            Integer.class, phone
        );
        return count != null && count > 0;
    }

    /**
     * Inserts a new Captain user into accounts_customuser.
     * Returns the generated database ID.
     */
    public long insertCaptainUser(String username, String hashedPassword, String email,
                                   String fullName, String phone, String pincode,
                                   String sponsorId, String prefixedId) {
        return insertCaptainUser(username, hashedPassword, email, fullName, phone, pincode, sponsorId, prefixedId, true);
    }

    public long insertCaptainUser(String username, String hashedPassword, String email,
                                   String fullName, String phone, String pincode,
                                   String sponsorId, String prefixedId, boolean isActive) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO accounts_customuser (" +
                "  username, password, email, first_name, last_name, " +
                "  is_active, is_staff, is_superuser, date_joined, " +
                "  role, category, full_name, phone, pincode, " +
                "  sponsor_id, prefix_code, prefixed_id, " +
                "  account_active, autopool_enabled, rewards_enabled, " +
                "  is_agency_unlocked, can_create_self_accounts, " +
                "  address, depth, identity_type" +
                ") VALUES (" +
                "  ?, ?, ?, '', '', " +
                "  ?, false, false, NOW(), " +
                "  'agency', 'agency_sub_franchise', ?, ?, ?, " +
                "  ?, 'CB', ?, " +
                "  ?, false, false, false, false, " +
                "  '', 0, 'END_USER'" +
                ") RETURNING id",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, username);
            ps.setString(2, hashedPassword);
            ps.setString(3, email != null ? email : "");
            ps.setBoolean(4, isActive);
            ps.setString(5, fullName);
            ps.setString(6, phone);
            ps.setString(7, pincode);
            ps.setString(8, sponsorId);
            ps.setString(9, prefixedId);
            ps.setBoolean(10, isActive);
            return ps;
        }, keyHolder);

        if (keyHolder.getKeys() != null && keyHolder.getKeys().containsKey("id")) {
            return ((Number) keyHolder.getKeys().get("id")).longValue();
        }
        throw new RuntimeException("Failed to get generated user ID after insert");
    }

    /**
     * Inserts an audit record into captain_registrations table (created by Liquibase).
     */
    public void insertCaptainAudit(String captainUsername, String phone, String fullName,
                                    String email, String pincode, String district,
                                    String stateName, String sponsorId, Long userId) {
        jdbc.update(
            "INSERT INTO captain_registrations " +
            "(captain_username, phone, full_name, email, pincode, district, state_name, sponsor_id, user_id) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            captainUsername, phone, fullName, email, pincode, district, stateName, sponsorId, userId
        );
    }

    /**
     * Inserts a new B2B or B2C merchant user into accounts_customuser.
     */
    public long insertMerchantUser(String username, String hashedPassword, String email,
                                    String fullName, String phone, String pincode,
                                    String sponsorId, String prefixedId, String prefixCode,
                                    String category) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO accounts_customuser (" +
                "  username, password, email, first_name, last_name, " +
                "  is_active, is_staff, is_superuser, date_joined, " +
                "  role, category, full_name, phone, pincode, " +
                "  sponsor_id, prefix_code, prefixed_id, " +
                "  account_active, autopool_enabled, rewards_enabled, " +
                "  is_agency_unlocked, can_create_self_accounts, " +
                "  address, depth, identity_type" +
                ") VALUES (" +
                "  ?, ?, ?, '', '', " +
                "  true, false, false, NOW(), " +
                "  'user', ?, ?, ?, ?, " +
                "  ?, ?, ?, " +
                "  true, false, false, false, false, " +
                "  '', 0, 'END_USER'" +
                ") RETURNING id",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, username);
            ps.setString(2, hashedPassword);
            ps.setString(3, email != null ? email : "");
            ps.setString(4, category);
            ps.setString(5, fullName);
            ps.setString(6, phone);
            ps.setString(7, pincode);
            ps.setString(8, sponsorId != null ? sponsorId : "");
            ps.setString(9, prefixCode);
            ps.setString(10, prefixedId);
            return ps;
        }, keyHolder);

        if (keyHolder.getKeys() != null && keyHolder.getKeys().containsKey("id")) {
            return ((Number) keyHolder.getKeys().get("id")).longValue();
        }
        throw new RuntimeException("Failed to get generated user ID after insert");
    }

    /**
     * Inserts a merchant profile in market_merchantprofile.
     */
    public void insertMerchantProfile(long userId, String businessName, String mobile, String address, String businessCategory, String serviceMode) {
        jdbc.update(
            "INSERT INTO market_merchantprofile " +
            "(user_id, business_name, mobile_number, commission_percent, service_mode, address, business_category, is_verified, created_at) " +
            "SELECT ?, ?, ?, 0.00, ?, ?, ?, true, NOW() " +
            "WHERE NOT EXISTS (SELECT 1 FROM market_merchantprofile WHERE user_id = ?)",
            userId, businessName, mobile,
            serviceMode != null ? serviceMode.toUpperCase() : "OFFLINE",
            address != null ? address : "",
            businessCategory != null ? businessCategory : "",
            userId
        );
    }

    /**
     * Inserts a baseline shop in market_shop.
     */
    public void insertShop(long merchantId, String shopName, String address, String city, String pincode,
                           Double latitude, Double longitude, String contactNumber, Double discountPercent,
                           Integer categoryId, Integer subcategoryId, String additionalImages) {
        jdbc.update(
            "INSERT INTO market_shop " +
            "(merchant_id, shop_name, address, city, pincode, latitude, longitude, contact_number, status, created_at, " +
            " discount_percent, category_id, subcategory_id, additional_images) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', NOW(), ?, ?, ?, ?)",
            merchantId, shopName, address != null ? address : "", city != null ? city : "", pincode != null ? pincode : "",
            latitude, longitude, contactNumber != null ? contactNumber : "",
            discountPercent != null ? discountPercent : 0.00,
            categoryId, subcategoryId,
            additionalImages != null ? additionalImages : "[]"
        );
    }

    /**
     * Finds shops referred by this Captain or within Captain's assigned pincode.
     */
    public List<Map<String, Object>> findShopsForCaptain(String captainUsername, String captainPhone, String captainPincode) {
        String query =
            "SELECT s.id, s.shop_name, s.address, s.city, s.pincode, s.contact_number, s.status, s.created_at, " +
            "       s.category_id, mc.name as category_name, " +
            "       u.id as merchant_id, u.full_name as merchant_name, u.phone as merchant_phone, u.category as merchant_category, " +
            "       COALESCE(mp.service_mode, 'OFFLINE') as service_mode, " +
            "       COALESCE(mp.is_verified, false) as is_verified " +
            "FROM market_shop s " +
            "JOIN accounts_customuser u ON s.merchant_id = u.id " +
            "LEFT JOIN market_merchantprofile mp ON u.id = mp.user_id " +
            "LEFT JOIN business_merchantcategory mc ON s.category_id = mc.id " +
            "WHERE (u.sponsor_id = ? OR u.sponsor_id = ? OR UPPER(u.sponsor_id) = UPPER(?) OR s.pincode = ?) " +
            "ORDER BY s.created_at DESC LIMIT 100";
        return jdbc.queryForList(query, captainUsername, captainPhone, "CB-" + captainPhone, captainPincode != null ? captainPincode : "");
    }

    /**
     * Approves a shop and activates Prime status on the merchant.
     */
    public boolean approveShopByCaptain(long shopId) {
        int rows = jdbc.update("UPDATE market_shop SET status = 'ACTIVE' WHERE id = ?", shopId);
        jdbc.update("UPDATE market_merchantprofile SET is_verified = true WHERE user_id = (SELECT merchant_id FROM market_shop WHERE id = ?)", shopId);
        return rows > 0;
    }
}
