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

    private ShopProductResponse mapProduct(ResultSet rs, int rowNum) throws SQLException {
        return ShopProductResponse.builder()
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
                .build();
    }
}
