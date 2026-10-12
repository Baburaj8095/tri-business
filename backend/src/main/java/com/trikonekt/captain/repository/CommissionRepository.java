package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.TrizoneCommissionRecord;
import com.trikonekt.captain.model.TrizoneCommissionSettings;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class CommissionRepository {

    private final JdbcTemplate jdbc;

    public CommissionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Load the single active commission settings row.
     * Creates a default row if none exists.
     */
    public TrizoneCommissionSettings loadActiveSettings() {
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT id, captain_share_percent, pincode_partner_share_percent, " +
            "       district_franchise_share_percent, platform_reserve_share_percent, " +
            "       default_shop_commission_percent, is_active, updated_by, updated_at " +
            "FROM trizone_commission_settings WHERE is_active = TRUE ORDER BY id ASC LIMIT 1"
        );
        if (rows.isEmpty()) {
            return TrizoneCommissionSettings.builder()
                .captainSharePercent(new BigDecimal("40.00"))
                .pincodePartnerSharePercent(new BigDecimal("30.00"))
                .districtFranchiseSharePercent(new BigDecimal("10.00"))
                .platformReserveSharePercent(new BigDecimal("20.00"))
                .defaultShopCommissionPercent(new BigDecimal("2.00"))
                .isActive(true)
                .updatedBy("DEFAULT")
                .build();
        }
        Map<String, Object> r = rows.get(0);
        return TrizoneCommissionSettings.builder()
            .id(((Number) r.get("id")).longValue())
            .captainSharePercent(asBD(r.get("captain_share_percent")))
            .pincodePartnerSharePercent(asBD(r.get("pincode_partner_share_percent")))
            .districtFranchiseSharePercent(asBD(r.get("district_franchise_share_percent")))
            .platformReserveSharePercent(asBD(r.get("platform_reserve_share_percent")))
            .defaultShopCommissionPercent(asBD(r.get("default_shop_commission_percent")))
            .isActive(Boolean.TRUE.equals(r.get("is_active")))
            .updatedBy((String) r.get("updated_by"))
            .updatedAt(r.get("updated_at") != null ? r.get("updated_at").toString() : null)
            .build();
    }

    /**
     * Update the active commission settings (upsert — update if row exists, insert otherwise).
     */
    public void saveSettings(TrizoneCommissionSettings s, String updatedBy) {
        int updated = jdbc.update(
            "UPDATE trizone_commission_settings SET " +
            "captain_share_percent = ?, pincode_partner_share_percent = ?, " +
            "district_franchise_share_percent = ?, platform_reserve_share_percent = ?, " +
            "default_shop_commission_percent = ?, updated_by = ?, updated_at = NOW() " +
            "WHERE is_active = TRUE",
            s.getCaptainSharePercent(), s.getPincodePartnerSharePercent(),
            s.getDistrictFranchiseSharePercent(), s.getPlatformReserveSharePercent(),
            s.getDefaultShopCommissionPercent(), updatedBy
        );
        if (updated == 0) {
            jdbc.update(
                "INSERT INTO trizone_commission_settings " +
                "(captain_share_percent, pincode_partner_share_percent, district_franchise_share_percent, " +
                "platform_reserve_share_percent, default_shop_commission_percent, is_active, updated_by, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, TRUE, ?, NOW())",
                s.getCaptainSharePercent(), s.getPincodePartnerSharePercent(),
                s.getDistrictFranchiseSharePercent(), s.getPlatformReserveSharePercent(),
                s.getDefaultShopCommissionPercent(), updatedBy
            );
        }
    }

    /**
     * Insert a commission credit record idempotently (silently ignores duplicate on unique constraint).
     */
    public void insertCommissionRecord(long offlinePaymentId, long beneficiaryUserId,
                                       String beneficiaryRole, long shopId, String pincode,
                                       BigDecimal netOnlineAmount, BigDecimal shopCommissionPercent,
                                       BigDecimal totalPool, BigDecimal roleSharePercent,
                                       BigDecimal commissionAmount) {
        try {
            jdbc.update(
                "INSERT INTO trizone_commission_records " +
                "(offline_payment_id, beneficiary_user_id, beneficiary_role, shop_id, pincode, " +
                " net_online_amount, shop_commission_percent, total_commission_pool, " +
                " role_share_percent, commission_amount, status, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CREDITED', NOW())",
                offlinePaymentId, beneficiaryUserId, beneficiaryRole, shopId, pincode,
                netOnlineAmount, shopCommissionPercent, totalPool,
                roleSharePercent, commissionAmount
            );
        } catch (DuplicateKeyException ignored) {
            // idempotent: record already credited
        }
    }

    /**
     * Credit wallet: franchise_shopping_scanner + balance + withdrawable_balance.
     */
    public void creditWallet(long userId, BigDecimal amount) {
        jdbc.update(
            "UPDATE accounts_wallet SET " +
            "  franchise_shopping_scanner = COALESCE(franchise_shopping_scanner, 0) + ?, " +
            "  balance = COALESCE(balance, 0) + ?, " +
            "  withdrawable_balance = COALESCE(withdrawable_balance, 0) + ?, " +
            "  updated_at = NOW() " +
            "WHERE user_id = ?",
            amount, amount, amount, userId
        );
    }

    /**
     * Retrieve commission records for admin view (paginated).
     */
    public List<Map<String, Object>> getCommissionRecords(int page, int size, Long shopId, String status) {
        int offset = (page - 1) * size;
        StringBuilder sql = new StringBuilder(
            "SELECT cr.id, cr.offline_payment_id, cr.beneficiary_user_id, " +
            "       u.full_name AS beneficiary_name, cr.beneficiary_role, " +
            "       cr.shop_id, s.shop_name, cr.pincode, " +
            "       cr.net_online_amount, cr.shop_commission_percent, cr.total_commission_pool, " +
            "       cr.role_share_percent, cr.commission_amount, cr.status, cr.created_at " +
            "FROM trizone_commission_records cr " +
            "JOIN accounts_customuser u ON cr.beneficiary_user_id = u.id " +
            "JOIN market_shop s ON cr.shop_id = s.id " +
            "WHERE 1=1 "
        );
        java.util.List<Object> params = new java.util.ArrayList<>();
        if (shopId != null) { sql.append("AND cr.shop_id = ? "); params.add(shopId); }
        if (status != null && !status.isBlank()) { sql.append("AND cr.status = ? "); params.add(status); }
        sql.append("ORDER BY cr.created_at DESC LIMIT ? OFFSET ?");
        params.add(size);
        params.add(offset);
        return jdbc.queryForList(sql.toString(), params.toArray());
    }

    public long countCommissionRecords(Long shopId, String status) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM trizone_commission_records WHERE 1=1 ");
        java.util.List<Object> params = new java.util.ArrayList<>();
        if (shopId != null) { sql.append("AND shop_id = ? "); params.add(shopId); }
        if (status != null && !status.isBlank()) { sql.append("AND status = ? "); params.add(status); }
        Long c = jdbc.queryForObject(sql.toString(), Long.class, params.toArray());
        return c != null ? c : 0L;
    }

    /**
     * Find Pincode territory partner for a shop pincode.
     */
    public Optional<Long> findPincodePartner(String pincode) {
        if (pincode == null || pincode.isBlank()) return Optional.empty();
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT ara.user_id FROM accounts_agencyregionassignment ara " +
            "JOIN accounts_customuser u ON ara.user_id = u.id " +
            "WHERE ara.pincode = ? AND ara.level = 'pincode' AND u.is_active = TRUE " +
            "ORDER BY ara.id ASC LIMIT 1",
            pincode
        );
        if (rows.isEmpty()) return Optional.empty();
        return Optional.of(((Number) rows.get(0).get("user_id")).longValue());
    }

    /**
     * Find district franchise for a shop pincode (via district field).
     */
    public Optional<Long> findDistrictFranchise(String pincode) {
        if (pincode == null || pincode.isBlank()) return Optional.empty();
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT ara.user_id FROM accounts_agencyregionassignment ara_pincode " +
            "JOIN accounts_agencyregionassignment ara ON ara_pincode.district = ara.district " +
            "   AND ara.level = 'district' " +
            "JOIN accounts_customuser u ON ara.user_id = u.id " +
            "WHERE ara_pincode.pincode = ? AND ara_pincode.level = 'pincode' AND u.is_active = TRUE " +
            "ORDER BY ara.id ASC LIMIT 1",
            pincode
        );
        if (rows.isEmpty()) return Optional.empty();
        return Optional.of(((Number) rows.get(0).get("user_id")).longValue());
    }

    /**
     * Find platform reserve account (superuser/admin user 1 or first superuser).
     */
    public Optional<Long> findPlatformReserveUser() {
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT id FROM accounts_customuser WHERE is_superuser = TRUE ORDER BY id ASC LIMIT 1"
        );
        if (rows.isEmpty()) return Optional.empty();
        return Optional.of(((Number) rows.get(0).get("id")).longValue());
    }

    /**
     * Get shop's scan_pay_commission_percent and pincode.
     */
    public Optional<Map<String, Object>> getShopCommissionInfo(long shopId) {
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT id, pincode, scan_pay_commission_percent FROM market_shop WHERE id = ? LIMIT 1",
            shopId
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    private BigDecimal asBD(Object v) {
        if (v == null) return BigDecimal.ZERO;
        if (v instanceof BigDecimal) return (BigDecimal) v;
        return new BigDecimal(v.toString());
    }
}
