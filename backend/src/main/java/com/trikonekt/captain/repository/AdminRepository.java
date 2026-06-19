package com.trikonekt.captain.repository;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class AdminRepository {

    private final JdbcTemplate jdbc;

    public AdminRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Map<String, Object>> findAdminByUsername(String username) {
        String sql = "SELECT id, username, password, email, role, modules FROM business_admins WHERE username = ? LIMIT 1";
        try {
            return Optional.of(jdbc.queryForMap(sql, username));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Map<String, Object>> findAdminById(long id) {
        String sql = "SELECT id, username, email, role, modules FROM business_admins WHERE id = ? LIMIT 1";
        try {
            return Optional.of(jdbc.queryForMap(sql, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Map<String, Object>> listSubAdmins() {
        return jdbc.queryForList("SELECT id, username, email, role, modules, created_at FROM business_admins WHERE role = 'SUB_ADMIN' ORDER BY id DESC");
    }

    public void insertSubAdmin(String username, String passwordHash, String email, String modules) {
        jdbc.update(
            "INSERT INTO business_admins (username, password, email, role, modules, created_at, updated_at) " +
            "VALUES (?, ?, ?, 'SUB_ADMIN', ?, NOW(), NOW())",
            username, passwordHash, email, modules
        );
    }

    public void updateSubAdmin(long id, String email, String modules) {
        jdbc.update(
            "UPDATE business_admins SET email = ?, modules = ?, updated_at = NOW() WHERE id = ? AND role = 'SUB_ADMIN'",
            email, modules, id
        );
    }

    public void activateMerchantShop(long merchantUserId) {
        // Set shop to active and ensure service_mode is BOTH
        jdbc.update(
            "UPDATE market_shop SET is_active = TRUE, service_mode = 'BOTH', updated_at = NOW() " +
            "WHERE merchant_id = ?",
            merchantUserId
        );
    }

    public void deleteSubAdmin(long id) {
        jdbc.update("DELETE FROM business_admins WHERE id = ? AND role = 'SUB_ADMIN'", id);
    }

    public Map<String, Object> getDashboardStats() {
        // Total Captains
        Integer totalCaptains = jdbc.queryForObject(
            "SELECT COUNT(*) FROM accounts_customuser WHERE category = 'agency_sub_franchise'", Integer.class
        );

        // Active Captains
        Integer activeCaptains = jdbc.queryForObject(
            "SELECT COUNT(*) FROM accounts_customuser WHERE category = 'agency_sub_franchise' AND is_active = true", Integer.class
        );

        // Pending KYC
        Integer pendingKyc = jdbc.queryForObject(
            "SELECT COUNT(*) FROM accounts_customuser u " +
            "LEFT JOIN captain_kyc_details k ON u.id = k.user_id " +
            "WHERE u.category = 'agency_sub_franchise' AND (k.kyc_status IS NULL OR k.kyc_status = 'PENDING')", Integer.class
        );

        // Registered This Month
        Integer monthCaptains = jdbc.queryForObject(
            "SELECT COUNT(*) FROM accounts_customuser WHERE category = 'agency_sub_franchise' " +
            "AND date_joined >= date_trunc('month', NOW())", Integer.class
        );

        // Total B2B (merchant)
        Integer totalB2B = jdbc.queryForObject(
            "SELECT COUNT(*) FROM accounts_customuser WHERE category = 'merchant'", Integer.class
        );

        // Total B2C (business)
        Integer totalB2C = jdbc.queryForObject(
            "SELECT COUNT(*) FROM accounts_customuser WHERE category = 'business'", Integer.class
        );

        return Map.of(
            "totalCaptains", totalCaptains != null ? totalCaptains : 0,
            "activeCaptains", activeCaptains != null ? activeCaptains : 0,
            "pendingKyc", pendingKyc != null ? pendingKyc : 0,
            "registeredThisMonth", monthCaptains != null ? monthCaptains : 0,
            "totalB2B", totalB2B != null ? totalB2B : 0,
            "totalB2C", totalB2C != null ? totalB2C : 0
        );
    }

    public List<Map<String, Object>> listCaptains(String search, String kycStatus, Boolean isActive, int limit, int offset) {
        StringBuilder sql = new StringBuilder(
            "SELECT u.id, u.username, u.full_name, u.phone, u.pincode, u.sponsor_id, u.is_active, u.date_joined, " +
            "       COALESCE(k.kyc_status, 'PENDING') AS kyc_status " +
            "FROM accounts_customuser u " +
            "LEFT JOIN captain_kyc_details k ON u.id = k.user_id " +
            "WHERE u.category = 'agency_sub_franchise' "
        );

        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append("AND (UPPER(u.username) LIKE ? OR UPPER(u.full_name) LIKE ? OR u.phone LIKE ?) ");
            String term = "%" + search.trim().toUpperCase() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
        }

        if (kycStatus != null && !kycStatus.isBlank()) {
            if ("PENDING".equalsIgnoreCase(kycStatus)) {
                sql.append("AND (k.kyc_status IS NULL OR k.kyc_status = 'PENDING') ");
            } else {
                sql.append("AND k.kyc_status = ? ");
                params.add(kycStatus.toUpperCase());
            }
        }

        if (isActive != null) {
            sql.append("AND u.is_active = ? ");
            params.add(isActive);
        }

        sql.append("ORDER BY u.date_joined DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbc.queryForList(sql.toString(), params.toArray());
    }

    public int countCaptains(String search, String kycStatus, Boolean isActive) {
        StringBuilder sql = new StringBuilder(
            "SELECT COUNT(*) " +
            "FROM accounts_customuser u " +
            "LEFT JOIN captain_kyc_details k ON u.id = k.user_id " +
            "WHERE u.category = 'agency_sub_franchise' "
        );

        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append("AND (UPPER(u.username) LIKE ? OR UPPER(u.full_name) LIKE ? OR u.phone LIKE ?) ");
            String term = "%" + search.trim().toUpperCase() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
        }

        if (kycStatus != null && !kycStatus.isBlank()) {
            if ("PENDING".equalsIgnoreCase(kycStatus)) {
                sql.append("AND (k.kyc_status IS NULL OR k.kyc_status = 'PENDING') ");
            } else {
                sql.append("AND k.kyc_status = ? ");
                params.add(kycStatus.toUpperCase());
            }
        }

        if (isActive != null) {
            sql.append("AND u.is_active = ? ");
            params.add(isActive);
        }

        Integer count = jdbc.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count != null ? count : 0;
    }

    public void updateCaptainAccountStatus(long id, boolean active) {
        jdbc.update("UPDATE accounts_customuser SET is_active = ?, account_active = ? WHERE id = ? AND category = 'agency_sub_franchise'", active, active, id);
    }

    public void updateUserAccountStatus(long id, boolean active) {
        jdbc.update("UPDATE accounts_customuser SET is_active = ?, account_active = ? WHERE id = ?", active, active, id);
    }

    public void updateCaptainKycStatus(long id, String status, String reason, long verifiedByAdminId) {
        // Verify if detail record exists first
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM captain_kyc_details WHERE user_id = ?",
            Integer.class, id
        );

        boolean exists = count != null && count > 0;

        if (exists) {
            jdbc.update(
                "UPDATE captain_kyc_details SET kyc_status = ?, kyc_rejection_reason = ?, " +
                "verified_at = NOW(), verified_by = ?, updated_at = NOW() WHERE user_id = ?",
                status.toUpperCase(), reason, verifiedByAdminId, id
            );
        } else {
            jdbc.update(
                "INSERT INTO captain_kyc_details (user_id, kyc_status, kyc_rejection_reason, verified_at, verified_by, created_at, updated_at) " +
                "VALUES (?, ?, ?, NOW(), ?, NOW(), NOW())",
                id, status.toUpperCase(), reason, verifiedByAdminId
            );
        }
    }

    public List<Map<String, Object>> listMerchants(String category, String search, int limit, int offset) {
        StringBuilder sql = new StringBuilder(
            "SELECT u.id, u.username, u.full_name, u.phone, u.pincode, u.sponsor_id, u.is_active, u.date_joined, " +
            "       s.shop_name, s.address, s.city, s.contact_number, s.status AS shop_status, s.discount_percent " +
            "FROM accounts_customuser u " +
            "LEFT JOIN market_shop s ON u.id = s.merchant_id " +
            "WHERE u.category = ? "
        );

        List<Object> params = new ArrayList<>();
        params.add(category);

        if (search != null && !search.isBlank()) {
            sql.append("AND (UPPER(u.username) LIKE ? OR UPPER(u.full_name) LIKE ? OR u.phone LIKE ? OR UPPER(s.shop_name) LIKE ?) ");
            String term = "%" + search.trim().toUpperCase() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
            params.add(term);
        }

        sql.append("ORDER BY u.date_joined DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);

        return jdbc.queryForList(sql.toString(), params.toArray());
    }

    public int countMerchants(String category, String search) {
        StringBuilder sql = new StringBuilder(
            "SELECT COUNT(*) " +
            "FROM accounts_customuser u " +
            "LEFT JOIN market_shop s ON u.id = s.merchant_id " +
            "WHERE u.category = ? "
        );

        List<Object> params = new ArrayList<>();
        params.add(category);

        if (search != null && !search.isBlank()) {
            sql.append("AND (UPPER(u.username) LIKE ? OR UPPER(u.full_name) LIKE ? OR u.phone LIKE ? OR UPPER(s.shop_name) LIKE ?) ");
            String term = "%" + search.trim().toUpperCase() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
            params.add(term);
        }

        Integer count = jdbc.queryForObject(sql.toString(), Integer.class, params.toArray());
        return count != null ? count : 0;
    }
}
