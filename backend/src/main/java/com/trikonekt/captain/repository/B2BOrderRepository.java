package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.B2BOnlineOrder;
import com.trikonekt.captain.model.B2BOnlineOrderItem;
import com.trikonekt.captain.model.B2BOrderStatusHistory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class B2BOrderRepository {

    private final JdbcTemplate jdbc;

    public B2BOrderRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Map<String, Object>> findOrderableProduct(Long productId) {
        String sql = "SELECT p.id, p.shop_id, p.title, p.mrp, p.price, p.online_delivery, p.stock_qty, p.is_active, " +
                "s.shop_name, s.merchant_id AS seller_id, s.status AS shop_status, " +
                "s.home_delivery_enabled, s.delivery_radius_km, s.latitude, s.longitude, " +
                "COALESCE(mp.service_mode, s.service_mode, 'OFFLINE') AS service_mode, " +
                "u.full_name AS seller_name, u.category AS seller_category, u.is_active AS seller_active " +
                "FROM market_shopproduct p " +
                "JOIN market_shop s ON p.shop_id = s.id " +
                "JOIN accounts_customuser u ON s.merchant_id = u.id " +
                "LEFT JOIN market_merchantprofile mp ON mp.user_id = u.id " +
                "WHERE p.id = ?";
        List<Map<String, Object>> rows = jdbc.queryForList(sql, productId);
        return rows.stream().findFirst();
    }

    public Long createOrder(Long buyerId, Long sellerId, Long shopId, String orderNumber,
                            Double subtotal, Double totalMrp, Double totalDiscount, Double grandTotal,
                            String paymentMethod, String notes) {
        String sql = "INSERT INTO b2b_online_orders (" +
                "buyer_id, seller_id, shop_id, order_number, status, payment_status, payment_method, " +
                "subtotal, total_mrp, total_discount, grand_total, notes, created_at, updated_at" +
                ") VALUES (?, ?, ?, ?, 'PENDING_CONFIRMATION', 'PENDING', ?, ?, ?, ?, ?, ?, NOW(), NOW())";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, buyerId);
            ps.setLong(2, sellerId);
            ps.setLong(3, shopId);
            ps.setString(4, orderNumber);
            ps.setString(5, paymentMethod != null ? paymentMethod : "MANUAL");
            ps.setDouble(6, subtotal);
            ps.setDouble(7, totalMrp);
            ps.setDouble(8, totalDiscount);
            ps.setDouble(9, grandTotal);
            ps.setString(10, notes != null ? notes : "");
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) throw new RuntimeException("Failed to create B2B order.");
        return key.longValue();
    }

    public void createOrderItem(Long orderId, Long productId, String productTitle,
                                Integer quantity, Double price, Double mrpAtPurchase, Double lineTotal) {
        jdbc.update(
                "INSERT INTO b2b_online_order_items " +
                        "(order_id, product_id, product_title, quantity, price, mrp_at_purchase, line_total) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?)",
                orderId, productId, productTitle, quantity, price, mrpAtPurchase, lineTotal
        );
    }

    public Optional<B2BOnlineOrder> findOrderById(Long orderId) {
        List<B2BOnlineOrder> rows = jdbc.query(ORDER_SELECT_SQL + " WHERE o.id = ?", new Object[]{orderId}, this::mapOrder);
        if (rows.isEmpty()) return Optional.empty();
        B2BOnlineOrder order = rows.get(0);
        order.setItems(findItemsByOrderId(orderId));
        order.setStatusHistory(findHistoryByOrderId(orderId));
        return Optional.of(order);
    }

    public Optional<B2BOnlineOrder> findOrderByIdAndBuyerId(Long orderId, Long buyerId) {
        List<B2BOnlineOrder> rows = jdbc.query(ORDER_SELECT_SQL + " WHERE o.id = ? AND o.buyer_id = ?", new Object[]{orderId, buyerId}, this::mapOrder);
        if (rows.isEmpty()) return Optional.empty();
        B2BOnlineOrder order = rows.get(0);
        order.setItems(findItemsByOrderId(orderId));
        order.setStatusHistory(findHistoryByOrderId(orderId));
        return Optional.of(order);
    }

    public Optional<B2BOnlineOrder> findOrderByIdAndSellerId(Long orderId, Long sellerId) {
        List<B2BOnlineOrder> rows = jdbc.query(ORDER_SELECT_SQL + " WHERE o.id = ? AND o.seller_id = ?", new Object[]{orderId, sellerId}, this::mapOrder);
        if (rows.isEmpty()) return Optional.empty();
        B2BOnlineOrder order = rows.get(0);
        order.setItems(findItemsByOrderId(orderId));
        order.setStatusHistory(findHistoryByOrderId(orderId));
        return Optional.of(order);
    }

    public List<B2BOnlineOrder> findOrdersByBuyerId(Long buyerId) {
        List<B2BOnlineOrder> orders = jdbc.query(ORDER_SELECT_SQL + " WHERE o.buyer_id = ? ORDER BY o.id DESC", new Object[]{buyerId}, this::mapOrder);
        for (B2BOnlineOrder order : orders) order.setItems(findItemsByOrderId(order.getId()));
        return orders;
    }

    public List<B2BOnlineOrder> findOrdersBySellerId(Long sellerId) {
        List<B2BOnlineOrder> orders = jdbc.query(ORDER_SELECT_SQL + " WHERE o.seller_id = ? ORDER BY o.id DESC", new Object[]{sellerId}, this::mapOrder);
        for (B2BOnlineOrder order : orders) order.setItems(findItemsByOrderId(order.getId()));
        return orders;
    }

    public List<B2BOnlineOrderItem> findItemsByOrderId(Long orderId) {
        return jdbc.query(
                "SELECT id, order_id, product_id, product_title, quantity, price, mrp_at_purchase, line_total " +
                        "FROM b2b_online_order_items WHERE order_id = ? ORDER BY id ASC",
                new Object[]{orderId},
                (rs, rowNum) -> B2BOnlineOrderItem.builder()
                        .id(rs.getLong("id"))
                        .orderId(rs.getLong("order_id"))
                        .productId(rs.getLong("product_id"))
                        .productTitle(rs.getString("product_title"))
                        .quantity(rs.getInt("quantity"))
                        .price(rs.getDouble("price"))
                        .mrpAtPurchase(rs.getDouble("mrp_at_purchase"))
                        .lineTotal(rs.getDouble("line_total"))
                        .build()
        );
    }

    public List<B2BOrderStatusHistory> findHistoryByOrderId(Long orderId) {
        return jdbc.query(
                "SELECT id, order_id, status, payment_status, notes, changed_by, changed_by_user_id, changed_at " +
                        "FROM b2b_order_status_history WHERE order_id = ? ORDER BY changed_at DESC",
                new Object[]{orderId},
                (rs, rowNum) -> B2BOrderStatusHistory.builder()
                        .id(rs.getLong("id"))
                        .orderId(rs.getLong("order_id"))
                        .status(rs.getString("status"))
                        .paymentStatus(rs.getString("payment_status"))
                        .notes(rs.getString("notes"))
                        .changedBy(rs.getString("changed_by"))
                        .changedByUserId(rs.getObject("changed_by_user_id") != null ? rs.getLong("changed_by_user_id") : null)
                        .changedAt(rs.getString("changed_at"))
                        .build()
        );
    }

    public void insertHistory(Long orderId, String status, String paymentStatus, String notes, String changedBy, Long userId) {
        jdbc.update(
                "INSERT INTO b2b_order_status_history (order_id, status, payment_status, notes, changed_by, changed_by_user_id, changed_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, NOW())",
                orderId, status, paymentStatus, notes, changedBy, userId
        );
    }

    public void updateOrderStatus(Long orderId, String status) {
        jdbc.update("UPDATE b2b_online_orders SET status = ?, updated_at = NOW() WHERE id = ?", status, orderId);
    }

    public void updateOrderPaymentStatus(Long orderId, String paymentStatus, String paymentRef) {
        jdbc.update("UPDATE b2b_online_orders SET payment_status = ?, payment_ref_id = COALESCE(?, payment_ref_id), updated_at = NOW() WHERE id = ?",
                paymentStatus, paymentRef, orderId);
    }

    public void setCancellationReason(Long orderId, String reason) {
        jdbc.update("UPDATE b2b_online_orders SET cancellation_reason = ?, updated_at = NOW() WHERE id = ?", reason, orderId);
    }

    public void deductStock(Long productId, Integer quantity) {
        jdbc.update("UPDATE market_shopproduct SET stock_qty = GREATEST(COALESCE(stock_qty, 0) - ?, 0) WHERE id = ?", quantity, productId);
    }

    public void replenishStock(Long productId, Integer quantity) {
        jdbc.update("UPDATE market_shopproduct SET stock_qty = COALESCE(stock_qty, 0) + ? WHERE id = ?", quantity, productId);
    }

    public Long createPayment(Long orderId, Long buyerId, Long sellerId, Long shopId, Double amount,
                              String paymentMethod, String reference, String notes) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO b2b_order_payments (order_id, buyer_id, seller_id, shop_id, amount, payment_method, reference, notes, status, created_at, updated_at) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setLong(1, orderId);
            ps.setLong(2, buyerId);
            ps.setLong(3, sellerId);
            ps.setLong(4, shopId);
            ps.setDouble(5, amount);
            ps.setString(6, paymentMethod != null ? paymentMethod : "MANUAL");
            ps.setString(7, reference != null ? reference : "");
            ps.setString(8, notes != null ? notes : "");
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) throw new RuntimeException("Failed to create B2B payment.");
        return key.longValue();
    }

    public int updateLatestPendingPayment(Long orderId, String status) {
        return jdbc.update(
                "UPDATE b2b_order_payments SET status = ?, updated_at = NOW() " +
                        "WHERE id = (SELECT id FROM b2b_order_payments WHERE order_id = ? AND status = 'PENDING' ORDER BY id DESC LIMIT 1)",
                status, orderId
        );
    }

    private static final String ORDER_SELECT_SQL =
            "SELECT o.id, o.order_number, o.buyer_id, buyer.full_name AS buyer_name, " +
            "o.seller_id, seller.full_name AS seller_name, o.shop_id, s.shop_name, " +
            "o.status, o.payment_status, o.payment_method, o.payment_ref_id, " +
            "o.subtotal, o.total_mrp, o.total_discount, o.grand_total, o.notes, o.cancellation_reason, o.created_at, o.updated_at " +
            "FROM b2b_online_orders o " +
            "JOIN accounts_customuser buyer ON o.buyer_id = buyer.id " +
            "JOIN accounts_customuser seller ON o.seller_id = seller.id " +
            "JOIN market_shop s ON o.shop_id = s.id";

    private B2BOnlineOrder mapOrder(ResultSet rs, int rowNum) throws SQLException {
        return B2BOnlineOrder.builder()
                .id(rs.getLong("id"))
                .orderNumber(rs.getString("order_number"))
                .buyerId(rs.getLong("buyer_id"))
                .buyerName(rs.getString("buyer_name"))
                .sellerId(rs.getLong("seller_id"))
                .sellerName(rs.getString("seller_name"))
                .shopId(rs.getLong("shop_id"))
                .shopName(rs.getString("shop_name"))
                .status(rs.getString("status"))
                .paymentStatus(rs.getString("payment_status"))
                .paymentMethod(rs.getString("payment_method"))
                .paymentRefId(rs.getString("payment_ref_id"))
                .subtotal(rs.getDouble("subtotal"))
                .totalMrp(rs.getDouble("total_mrp"))
                .totalDiscount(rs.getDouble("total_discount"))
                .grandTotal(rs.getDouble("grand_total"))
                .notes(rs.getString("notes"))
                .cancellationReason(rs.getString("cancellation_reason"))
                .createdAt(rs.getString("created_at"))
                .updatedAt(rs.getString("updated_at"))
                .build();
    }

    public Optional<Map<String, Object>> findBuyerShop(Long buyerId) {
        String sql = "SELECT id, latitude, longitude, city, pincode FROM market_shop WHERE merchant_id = ? LIMIT 1";
        List<Map<String, Object>> rows = jdbc.queryForList(sql, buyerId);
        return rows.stream().findFirst();
    }
}