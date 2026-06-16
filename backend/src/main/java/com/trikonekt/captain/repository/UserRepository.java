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
            "SELECT id, username, password, email, full_name, phone, pincode, " +
            "sponsor_id, prefixed_id, prefix_code, role, category, is_active " +
            "FROM accounts_customuser WHERE username = ? LIMIT 1",
            username
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public Optional<Map<String, Object>> findByPhone(String phone) {
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT id, username, password, email, full_name, phone, pincode, " +
            "sponsor_id, prefixed_id, prefix_code, role, category, is_active " +
            "FROM accounts_customuser WHERE phone = ? LIMIT 1",
            phone
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public List<Map<String, Object>> findPublicB2bMerchants() {
        return jdbc.queryForList(
            "SELECT u.id, u.full_name, u.phone, u.pincode, " +
            "       s.shop_name, s.address, s.city " +
            "FROM accounts_customuser u " +
            "LEFT JOIN market_shop s ON u.id = s.merchant_id " +
            "WHERE u.category = 'merchant' AND u.is_active = true " +
            "LIMIT 50"
        );
    }

    public List<Map<String, Object>> findPublicB2cMerchants() {
        return jdbc.queryForList(
            "SELECT u.id, u.full_name, u.phone, u.pincode, " +
            "       s.shop_name, s.address, s.city " +
            "FROM accounts_customuser u " +
            "LEFT JOIN market_shop s ON u.id = s.merchant_id " +
            "WHERE u.category = 'business' AND u.is_active = true " +
            "LIMIT 50"
        );
    }

    /**
     * Searches for a sponsor by username or prefixed_id (case-insensitive).
     * Returns TRPN (agency_pincode) or Captain (agency_sub_franchise) sponsors,
     * plus admins (is_superuser=true or is_staff=true).
     */
    public Optional<Map<String, Object>> findSponsor(String sponsorId) {
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT id, username, full_name, category, role, pincode, sponsor_id, prefixed_id, is_superuser, is_staff " +
            "FROM accounts_customuser " +
            "WHERE (UPPER(username) = UPPER(?) OR UPPER(prefixed_id) = UPPER(?)) " +
            "AND (category IN ('agency_pincode', 'agency_sub_franchise') OR is_superuser = true OR is_staff = true) " +
            "LIMIT 1",
            sponsorId, sponsorId
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
                "  'agency', 'agency_sub_franchise', ?, ?, ?, " +
                "  ?, 'CB', ?, " +
                "  false, false, false, false, false, " +
                "  '', 0, 'END_USER'" +
                ") RETURNING id",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, username);
            ps.setString(2, hashedPassword);
            ps.setString(3, email != null ? email : "");
            ps.setString(4, fullName);
            ps.setString(5, phone);
            ps.setString(6, pincode);
            ps.setString(7, sponsorId);
            ps.setString(8, prefixedId);
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
    public void insertMerchantProfile(long userId, String businessName, String mobile, String address, String businessCategory) {
        jdbc.update(
            "INSERT INTO market_merchantprofile " +
            "(user_id, business_name, mobile_number, commission_percent, service_mode, address, business_category, is_verified, created_at) " +
            "VALUES (?, ?, ?, 0.00, 'BOTH', ?, ?, true, NOW()) " +
            "ON CONFLICT (user_id) DO NOTHING",
            userId, businessName, mobile, address != null ? address : "", businessCategory != null ? businessCategory : ""
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
}
