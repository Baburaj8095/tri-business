package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.OnlineOrder;
import com.trikonekt.captain.model.OnlineOrderItem;
import com.trikonekt.captain.model.OrderStatusHistory;
import com.trikonekt.captain.model.InventoryLease;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class OrderRepository {

    private final JdbcTemplate jdbc;

    public OrderRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ==========================================
    // 1. INVENTORY LEASE HOLDS (10 MINUTES HOLD)
    // ==========================================

    /**
     * Gets the sum of all currently active lease holds on an item that are not finalized into orders yet.
     */
    public int getActiveLeasedQuantity(Long productId) {
        String sql = "SELECT COALESCE(SUM(quantity), 0) FROM inventory_leases " +
                     "WHERE product_id = ? AND expires_at > NOW() AND order_id IS NULL";
        Integer leased = jdbc.queryForObject(sql, Integer.class, productId);
        return leased != null ? leased : 0;
    }

    /**
     * Acquires a 10-minute temporary lease hold on inventory at checkout state.
     */
    public void acquireInventoryLease(Long productId, Integer quantity, Long userId) {
        // First delete any older active leases this user holds on this specific product to refresh it
        jdbc.update("DELETE FROM inventory_leases WHERE user_id = ? AND product_id = ? AND order_id IS NULL", userId, productId);

        String sql = "INSERT INTO inventory_leases (product_id, quantity, user_id, expires_at) " +
                     "VALUES (?, ?, ?, NOW() + INTERVAL '10 minutes')";
        jdbc.update(sql, productId, quantity, userId);
    }

    /**
     * Delete active temporary leases for a user.
     */
    public void clearUserTemporaryLeases(Long userId) {
        jdbc.update("DELETE FROM inventory_leases WHERE user_id = ? AND order_id IS NULL", userId);
    }

    /**
     * Associates temporary active inventory leases to a finalized Order ID so we keep trace of lease transitions.
     */
    public void associateLeasesWithOrder(Long userId, Long orderId) {
        String sql = "UPDATE inventory_leases SET order_id = ?, expires_at = NOW() + INTERVAL '24 hours' " +
                     "WHERE user_id = ? AND order_id IS NULL";
        jdbc.update(sql, orderId, userId);
    }

    // ==========================================
    // 2. ORDER PROCESSING & MANAGEMENT
    // ==========================================

    /**
     * Insert a new online delivery order.
     */
    public Long createOrder(Long userId, Long shopId, Long addressId,
                            String orderNumber,
                            Double totalMrp, Double totalDiscount,
                            Double subtotal, Double deliveryFee, Double grandTotal,
                            String paymentMethod, String orderChannel, String notes) {
        String sql = "INSERT INTO online_orders (" +
                     "user_id, shop_id, delivery_address_id, order_number, status, " +
                     "total_mrp, total_discount, subtotal, delivery_fee, grand_total, total, " +
                      "payment_method, order_channel, payment_status, notes, created_at, updated_at" +
                      ") VALUES (?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, NOW(), NOW())";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, userId);
            ps.setLong(2, shopId);
            ps.setLong(3, addressId);
            ps.setString(4, orderNumber);
            ps.setDouble(5, totalMrp);
            ps.setDouble(6, totalDiscount);
            ps.setDouble(7, subtotal);
            ps.setDouble(8, deliveryFee);
            ps.setDouble(9, grandTotal);
            ps.setDouble(10, grandTotal); // total mirrors grand_total
            ps.setString(11, paymentMethod);
            ps.setString(12, orderChannel != null ? orderChannel : "ONLINE_DELIVERY");
            ps.setString(13, notes != null ? notes : "");
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            throw new RuntimeException("Failed to retrieve generated order reference key.");
        }
        return key.longValue();
    }

    /**
     * Add line item to a finalized order with price and MRP snapshots.
     */
    public void createOrderItem(Long orderId, Long productId, String productTitle,
                                Double mrpAtPurchase, Integer quantity, Double price) {
        String sql = "INSERT INTO online_order_items " +
                     "(order_id, product_id, quantity, price, mrp_at_purchase) " +
                     "VALUES (?, ?, ?, ?, ?)";
        jdbc.update(sql, orderId, productId, quantity, price, mrpAtPurchase);
    }

    /**
     * Update the state machine status of an order.
     */
    public int updateOrderStatus(Long orderId, String status, String paymentStatus) {
        String sql = "UPDATE online_orders SET status = ?, payment_status = ?, updated_at = NOW() WHERE id = ?";
        return jdbc.update(sql, status, paymentStatus, orderId);
    }

    /**
     * Link a Near Store delivery order to the existing offline Pay Store payment record.
     */
    public void linkOfflinePayment(Long orderId, Long offlinePaymentId, String paymentStatus) {
        String sql = "UPDATE online_orders SET offline_payment_id = ?, payment_status = ?, updated_at = NOW() WHERE id = ?";
        jdbc.update(sql, offlinePaymentId, paymentStatus, orderId);
    }

    /**
     * Update only the payment status for an order after the linked offline payment is actioned.
     */
    public void updateOrderPaymentStatus(Long orderId, String paymentStatus) {
        String sql = "UPDATE online_orders SET payment_status = ?, updated_at = NOW() WHERE id = ?";
        jdbc.update(sql, paymentStatus, orderId);
    }

    /**
     * Set cancellation reason when an order is cancelled.
     */
    public void setCancellationReason(Long orderId, String reason) {
        String sql = "UPDATE online_orders SET cancellation_reason = ?, updated_at = NOW() WHERE id = ?";
        jdbc.update(sql, reason, orderId);
    }

    // ==========================================
    // 3. STATUS HISTORY TRACKING
    // ==========================================

    /**
     * Record a status transition event in history log.
     */
    public void insertStatusHistory(Long orderId, String status, String notes, String changedBy) {
        String sql = "INSERT INTO online_order_status_history (order_id, status, notes, changed_by, changed_at) " +
                     "VALUES (?, ?, ?, ?, NOW())";
        jdbc.update(sql, orderId, status, notes, changedBy);
    }

    /**
     * Fetch the full status history for an order, newest first.
     */
    public List<OrderStatusHistory> findStatusHistoryByOrderId(Long orderId) {
        String sql = "SELECT id, order_id, status, notes, changed_by, changed_at " +
                     "FROM online_order_status_history " +
                     "WHERE order_id = ? ORDER BY changed_at DESC";
        return jdbc.query(sql, new Object[]{orderId}, (rs, rowNum) -> OrderStatusHistory.builder()
                .id(rs.getLong("id"))
                .orderId(rs.getLong("order_id"))
                .status(rs.getString("status"))
                .notes(rs.getString("notes"))
                .changedBy(rs.getString("changed_by"))
                .changedAt(rs.getString("changed_at"))
                .build());
    }

    /**
     * Get order details by ID.
     */
    public Optional<OnlineOrder> findOrderById(Long orderId) {
        String sql = ORDER_SELECT_SQL + " WHERE o.id = ?";
        List<OnlineOrder> list = jdbc.query(sql, new Object[]{orderId}, this::mapOrder);
        if (list.isEmpty()) {
            return Optional.empty();
        }
        OnlineOrder order = list.get(0);
        order.setItems(findItemsByOrderId(orderId));
        order.setStatusHistory(findStatusHistoryByOrderId(orderId));
        return Optional.of(order);
    }

    /**
     * Find order by ID associated with a user.
     */
    public Optional<OnlineOrder> findOrderByIdAndUserId(Long orderId, Long userId) {
        String sql = ORDER_SELECT_SQL + " WHERE o.id = ? AND o.user_id = ?";
        List<OnlineOrder> list = jdbc.query(sql, new Object[]{orderId, userId}, this::mapOrder);
        if (list.isEmpty()) {
            return Optional.empty();
        }
        OnlineOrder order = list.get(0);
        order.setItems(findItemsByOrderId(orderId));
        order.setStatusHistory(findStatusHistoryByOrderId(orderId));
        return Optional.of(order);
    }

    /**
     * List user orders.
     */
    public List<OnlineOrder> findOrdersByUserId(Long userId) {
        String sql = ORDER_SELECT_SQL + " WHERE o.user_id = ? ORDER BY o.id DESC";
        List<OnlineOrder> orders = jdbc.query(sql, new Object[]{userId}, this::mapOrder);
        for (OnlineOrder o : orders) {
            o.setItems(findItemsByOrderId(o.getId()));
        }
        return orders;
    }

    /**
     * List shop orders (for corporate/merchant dashboards).
     */
    public List<OnlineOrder> findOrdersByShopId(Long shopId) {
        String sql = ORDER_SELECT_SQL + " WHERE o.shop_id = ? ORDER BY o.id DESC";
        List<OnlineOrder> orders = jdbc.query(sql, new Object[]{shopId}, this::mapOrder);
        for (OnlineOrder o : orders) {
            o.setItems(findItemsByOrderId(o.getId()));
        }
        return orders;
    }

    /**
     * Retrieve items associated with an order reference (uses snapshot columns).
     */
    public List<OnlineOrderItem> findItemsByOrderId(Long orderId) {
        String sql = "SELECT oi.id, oi.order_id, oi.product_id, " +
                     "COALESCE(p.title, 'Unknown Product') as product_title, " +
                     "oi.quantity, oi.price, oi.mrp_at_purchase " +
                     "FROM online_order_items oi " +
                     "LEFT JOIN market_shopproduct p ON oi.product_id = p.id " +
                     "WHERE oi.order_id = ?";
        return jdbc.query(sql, new Object[]{orderId}, (rs, rowNum) -> OnlineOrderItem.builder()
                .id(rs.getLong("id"))
                .orderId(rs.getLong("order_id"))
                .productId(rs.getLong("product_id"))
                .productTitle(rs.getString("product_title"))
                .quantity(rs.getInt("quantity"))
                .price(rs.getDouble("price"))
                .mrpAtPurchase(rs.getDouble("mrp_at_purchase"))
                .build());
    }

    /**
     * Find an order by its unique order_number (used by payment webhook).
     */
    public Optional<OnlineOrder> findOrderByOrderNumber(String orderNumber) {
        String sql = ORDER_SELECT_SQL + " WHERE o.order_number = ?";
        List<OnlineOrder> list = jdbc.query(sql, new Object[]{orderNumber}, this::mapOrder);
        if (list.isEmpty()) {
            return Optional.empty();
        }
        OnlineOrder order = list.get(0);
        order.setItems(findItemsByOrderId(order.getId()));
        return Optional.of(order);
    }

    /**
     * Persist the external payment transaction reference on the order.
     */
    public void setPaymentRef(Long orderId, String paymentRef) {
        String sql = "UPDATE online_orders SET payment_ref_id = ?, updated_at = NOW() WHERE id = ?";
        jdbc.update(sql, paymentRef, orderId);
    }

    /**
     * Update Shiprocket shipment and courier details on an order.
     */
    public void updateShipmentDetails(Long orderId, String shipmentId, String awbNumber, String courierName, String labelUrl, String trackingUrl) {
        String sql = "UPDATE online_orders SET shipment_id = ?, awb_number = ?, courier_name = ?, label_url = ?, tracking_url = ?, updated_at = NOW() WHERE id = ?";
        jdbc.update(sql, shipmentId, awbNumber, courierName, labelUrl, trackingUrl, orderId);
    }

    // Shared SELECT clause reused across all order fetch methods
    private static final String ORDER_SELECT_SQL =
            "SELECT o.id, o.order_number, o.user_id, o.shop_id, s.shop_name, s.contact_number AS shop_phone, " +
            "COALESCE(s.address, '') || COALESCE(', ' || s.city, '') AS shop_address, " +
            "o.delivery_address_id, o.order_channel, o.status, " +
            "o.total_mrp, o.total_discount, o.subtotal, o.delivery_fee, o.grand_total, o.total, " +
            "o.payment_method, o.payment_status, o.payment_ref_id, o.offline_payment_id, o.cancellation_reason, o.notes, " +
            "o.shipment_id, o.awb_number, o.courier_name, o.label_url, o.tracking_url, " +
            "o.created_at, o.updated_at, " +
            "COALESCE(da.address_line1, '') || COALESCE(', ' || da.address_line2, '') || COALESCE(', ' || da.city, '') || COALESCE(', ' || da.state_name, '') || COALESCE(' - ' || da.pincode, '') AS delivery_address " +
            "FROM online_orders o " +
            "JOIN market_shop s ON o.shop_id = s.id " +
            "LEFT JOIN user_delivery_addresses da ON o.delivery_address_id = da.id";

    private OnlineOrder mapOrder(ResultSet rs, int rowNum) throws SQLException {
        return OnlineOrder.builder()
                .id(rs.getLong("id"))
                .orderNumber(rs.getString("order_number"))
                .userId(rs.getLong("user_id"))
                .shopId(rs.getLong("shop_id"))
                .shopName(rs.getString("shop_name"))
                .shopPhone(rs.getString("shop_phone"))
                .shopAddress(rs.getString("shop_address"))
                .deliveryAddressId(rs.getLong("delivery_address_id"))
                .address(rs.getString("delivery_address"))
                .orderChannel(rs.getString("order_channel"))
                .status(rs.getString("status"))
                .totalMrp(rs.getDouble("total_mrp"))
                .totalDiscount(rs.getDouble("total_discount"))
                .subtotal(rs.getDouble("subtotal"))
                .deliveryFee(rs.getDouble("delivery_fee"))
                .grandTotal(rs.getDouble("grand_total"))
                .total(rs.getDouble("total"))
                .paymentMethod(rs.getString("payment_method"))
                .paymentStatus(rs.getString("payment_status"))
                .paymentRefId(rs.getString("payment_ref_id"))
                .offlinePaymentId(rs.getObject("offline_payment_id") != null ? rs.getLong("offline_payment_id") : null)
                .cancellationReason(rs.getString("cancellation_reason"))
                .shipmentId(rs.getString("shipment_id"))
                .awbNumber(rs.getString("awb_number"))
                .courierName(rs.getString("courier_name"))
                .labelUrl(rs.getString("label_url"))
                .trackingUrl(rs.getString("tracking_url"))
                .notes(rs.getString("notes"))
                .createdAt(rs.getString("created_at"))
                .updatedAt(rs.getString("updated_at"))
                .build();
    }
}
