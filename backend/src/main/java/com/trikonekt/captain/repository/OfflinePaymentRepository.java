package com.trikonekt.captain.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class OfflinePaymentRepository {

    private final JdbcTemplate jdbc;

    public OfflinePaymentRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public long createPayment(String refId, long consumerId, long shopId, BigDecimal amount, String paymentMethod, String status) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO offline_payments (ref_id, consumer_id, shop_id, amount, payment_method, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW()) RETURNING id",
                Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, refId);
            ps.setLong(2, consumerId);
            ps.setLong(3, shopId);
            ps.setBigDecimal(4, amount);
            ps.setString(5, paymentMethod);
            ps.setString(6, status);
            return ps;
        }, keyHolder);

        if (keyHolder.getKeys() != null && keyHolder.getKeys().containsKey("id")) {
            return ((Number) keyHolder.getKeys().get("id")).longValue();
        }
        throw new RuntimeException("Failed to get generated payment ID");
    }

    public boolean existsActiveShopById(long shopId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM market_shop WHERE id = ? AND status = 'ACTIVE'",
            Integer.class,
            shopId
        );
        return count != null && count > 0;
    }

    public boolean isShopOwnedByMerchant(long shopId, long merchantId) {
        Integer count = jdbc.queryForObject(
            "SELECT COUNT(*) FROM market_shop WHERE id = ? AND merchant_id = ?",
            Integer.class,
            shopId,
            merchantId
        );
        return count != null && count > 0;
    }

    public Optional<Map<String, Object>> getPaymentById(long id) {
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT p.id, p.ref_id, p.consumer_id, p.shop_id, p.amount, p.payment_method, p.status, p.created_at, p.updated_at, " +
            "       u.full_name as consumer_name, u.phone as consumer_phone, s.shop_name, s.discount_percent " +
            "FROM offline_payments p " +
            "JOIN accounts_customuser u ON p.consumer_id = u.id " +
            "JOIN market_shop s ON p.shop_id = s.id " +
            "WHERE p.id = ? LIMIT 1",
            id
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public List<Map<String, Object>> getPaymentsByConsumerId(long consumerId) {
        return jdbc.queryForList(
            "SELECT p.id, p.ref_id, p.consumer_id, p.shop_id, p.amount, p.payment_method, p.status, p.created_at, p.updated_at, " +
            "       u.full_name as consumer_name, u.phone as consumer_phone, s.shop_name " +
            "FROM offline_payments p " +
            "JOIN accounts_customuser u ON p.consumer_id = u.id " +
            "JOIN market_shop s ON p.shop_id = s.id " +
            "WHERE p.consumer_id = ? " +
            "ORDER BY p.created_at DESC",
            consumerId
        );
    }

    public List<Map<String, Object>> getPendingPaymentsForMerchant(long merchantId) {
        return jdbc.queryForList(
            "SELECT p.id, p.ref_id, p.consumer_id, p.shop_id, p.amount, p.payment_method, p.status, p.created_at, p.updated_at, " +
            "       u.full_name as consumer_name, u.phone as consumer_phone, s.shop_name " +
            "FROM offline_payments p " +
            "JOIN accounts_customuser u ON p.consumer_id = u.id " +
            "JOIN market_shop s ON p.shop_id = s.id " +
            "WHERE s.merchant_id = ? AND p.status = 'PENDING' " +
            "ORDER BY p.created_at DESC",
            merchantId
        );
    }

    public void updatePaymentStatus(long id, String status) {
        jdbc.update(
            "UPDATE offline_payments SET status = ?, updated_at = NOW() WHERE id = ?",
            status, id
        );
    }

    public int updatePaymentStatusIfPending(long id, String status) {
        return jdbc.update(
            "UPDATE offline_payments SET status = ?, updated_at = NOW() WHERE id = ? AND status = 'PENDING'",
            status, id
        );
    }

    public Optional<Map<String, Object>> getWalletByUserId(long userId) {
        List<Map<String, Object>> rows = jdbc.queryForList(
            "SELECT id, balance, main_balance, withdrawable_balance FROM accounts_wallet WHERE user_id = ? LIMIT 1",
            userId
        );
        return rows.isEmpty() ? Optional.empty() : Optional.of(rows.get(0));
    }

    public void createWalletIfMissing(long userId) {
        jdbc.update(
            "INSERT INTO accounts_wallet (user_id, balance, main_balance, withdrawable_balance, created_at, updated_at) " +
            "SELECT ?, 0, 0, 0, NOW(), NOW() " +
            "WHERE NOT EXISTS (SELECT 1 FROM accounts_wallet WHERE user_id = ?)",
            userId, userId
        );
    }

    public void updateWalletBalance(long userId, BigDecimal balance, BigDecimal mainBalance, BigDecimal withdrawableBalance) {
        jdbc.update(
            "UPDATE accounts_wallet SET balance = ?, main_balance = ?, withdrawable_balance = ?, updated_at = NOW() WHERE user_id = ?",
            balance, mainBalance, withdrawableBalance, userId
        );
    }

    public void logWalletTransaction(long userId, BigDecimal amount, BigDecimal balanceAfter, String refId) {
        jdbc.update(
            "INSERT INTO accounts_wallettransaction (user_id, amount, balance_after, type, source_type, source_id, created_at) " +
            "VALUES (?, ?, ?, 'COMMISSION_CREDIT', 'OFFLINE_PAYMENT', ?, NOW())",
            userId, amount, balanceAfter, refId
        );
    }
}
