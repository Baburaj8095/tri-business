package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.ShopProductResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class ProductRepository {

    private final JdbcTemplate jdbc;

    public ProductRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Get a specific product by ID
     */
    public Optional<ShopProductResponse> findProductById(Long id) {
        String sql = "SELECT id, shop_id, title, description, mrp, price, discount_percent, " +
                "online_delivery, offline_delivery, stock_qty, image, is_active, created_at " +
                "FROM market_shopproduct WHERE id = ?";
        List<ShopProductResponse> list = jdbc.query(sql, new Object[]{id}, this::mapProduct);
        return list.stream().findFirst();
    }

    /**
     * Insert a new product under a specific shop
     */
    public int insertProduct(Long shopId, String title, String description, Double mrp, Double price,
                              Double discountPercent, Boolean onlineDelivery, Boolean offlineDelivery,
                              Integer stockQty, String image, Boolean isActive) {
        String sql = "INSERT INTO market_shopproduct (" +
                "shop_id, title, description, mrp, price, discount_percent, " +
                "online_delivery, offline_delivery, stock_qty, image, is_active, created_at" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        return jdbc.update(sql,
                shopId,
                title,
                description,
                mrp,
                price,
                discountPercent,
                onlineDelivery,
                offlineDelivery,
                stockQty,
                image,
                isActive
        );
    }

    /**
     * Update an existing product
     */
    public int updateProduct(Long id, String title, String description, Double mrp, Double price,
                              Double discountPercent, Boolean onlineDelivery, Boolean offlineDelivery,
                              Integer stockQty, String image, Boolean isActive) {
        String sql = "UPDATE market_shopproduct SET " +
                "title = ?, description = ?, mrp = ?, price = ?, discount_percent = ?, " +
                "online_delivery = ?, offline_delivery = ?, stock_qty = ?, image = ?, is_active = ? " +
                "WHERE id = ?";

        return jdbc.update(sql,
                title,
                description,
                mrp,
                price,
                discountPercent,
                onlineDelivery,
                offlineDelivery,
                stockQty,
                image,
                isActive,
                id
        );
    }

    /**
     * Delete product by ID
     */
    public int deleteProduct(Long id) {
        return jdbc.update("DELETE FROM market_shopproduct WHERE id = ?", id);
    }

    /**
     * Fetch all online-enabled products across all active shops.
     * Supports optional search (title) and category (shop category) filtering.
     * Used by the consumer Online Shop browse screen.
     */
    public List<ShopProductResponse> findOnlineProducts(String search, String category, int limit, int offset) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.id, p.shop_id, s.shop_name, sc.name AS category, " +
            "p.title, p.description, p.mrp, p.price, p.discount_percent, " +
            "p.online_delivery, p.offline_delivery, p.stock_qty, p.image, p.is_active, p.created_at " +
            "FROM market_shopproduct p " +
            "JOIN market_shop s ON p.shop_id = s.id " +
            "LEFT JOIN business_merchantcategory sc ON s.category_id = sc.id " +
            "WHERE p.online_delivery = TRUE AND p.is_active = TRUE " +
            "AND s.is_active = TRUE AND s.service_mode IN ('ONLINE', 'BOTH') "
        );
        java.util.List<Object> params = new java.util.ArrayList<>();
        if (search != null && !search.isBlank()) {
            sql.append("AND UPPER(p.title) LIKE ? ");
            params.add("%" + search.trim().toUpperCase() + "%");
        }
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
            sql.append("AND UPPER(sc.name) = ? ");
            params.add(category.trim().toUpperCase());
        }
        sql.append("ORDER BY p.id DESC LIMIT ? OFFSET ?");
        params.add(limit);
        params.add(offset);
        return jdbc.query(sql.toString(), params.toArray(), this::mapOnlineProduct);
    }

    /**
     * Fetch distinct shop categories that have active online products.
     * Used to build the category filter grid on the consumer Online Shop screen.
     */
    public List<String> findOnlineProductCategories() {
        String sql =
            "SELECT DISTINCT sc.name " +
            "FROM market_shopproduct p " +
            "JOIN market_shop s ON p.shop_id = s.id " +
            "LEFT JOIN business_merchantcategory sc ON s.category_id = sc.id " +
            "WHERE p.online_delivery = TRUE AND p.is_active = TRUE " +
            "AND s.is_active = TRUE AND s.service_mode IN ('ONLINE', 'BOTH') " +
            "AND sc.name IS NOT NULL " +
            "ORDER BY sc.name ASC";
        return jdbc.queryForList(sql, String.class);
    }

    private ShopProductResponse mapOnlineProduct(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return ShopProductResponse.builder()
                .id(rs.getLong("id"))
                .shopId(rs.getLong("shop_id"))
                .shopName(rs.getString("shop_name"))
                .category(rs.getString("category"))
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
                .build();
    }

    private ShopProductResponse mapProduct(ResultSet rs, int rowNum) throws SQLException {
        return ShopProductResponse.builder()
                .id(rs.getLong("id"))
                .shopId(rs.getLong("shop_id"))
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
                .build();
    }
}
