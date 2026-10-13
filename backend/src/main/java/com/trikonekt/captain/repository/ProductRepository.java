package com.trikonekt.captain.repository;

import com.trikonekt.captain.model.ShopProductResponse;
import com.trikonekt.captain.model.StockMovementResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
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
                "online_delivery, offline_delivery, stock_qty, image, is_active, created_at, category, " +
                "sku, barcode, low_stock_threshold, wholesale_price, moq " +
                "FROM market_shopproduct WHERE id = ?";
        List<ShopProductResponse> list = jdbc.query(sql, new Object[]{id}, this::mapProduct);
        return list.stream().findFirst();
    }

    /**
     * Get all products owned by a shop (includes active and inactive for merchant management)
     */
    public List<ShopProductResponse> findAllProductsByShopId(Long shopId) {
        String sql = "SELECT id, shop_id, title, description, mrp, price, discount_percent, " +
                "online_delivery, offline_delivery, stock_qty, image, is_active, created_at, category, " +
                "sku, barcode, low_stock_threshold, wholesale_price, moq " +
                "FROM market_shopproduct WHERE shop_id = ? ORDER BY id DESC";
        return jdbc.query(sql, new Object[]{shopId}, this::mapProduct);
    }

    /**
     * Find product by barcode or SKU for a specific shop
     */
    public Optional<ShopProductResponse> findProductByBarcodeOrSku(Long shopId, String barcodeOrSku) {
        if (barcodeOrSku == null || barcodeOrSku.isBlank()) return Optional.empty();
        String trimmed = barcodeOrSku.trim();
        String sql = "SELECT id, shop_id, title, description, mrp, price, discount_percent, " +
                "online_delivery, offline_delivery, stock_qty, image, is_active, created_at, category, " +
                "sku, barcode, low_stock_threshold, wholesale_price, moq " +
                "FROM market_shopproduct WHERE shop_id = ? AND (barcode = ? OR sku = ?) LIMIT 1";
        List<ShopProductResponse> list = jdbc.query(sql, new Object[]{shopId, trimmed, trimmed}, this::mapProduct);
        return list.stream().findFirst();
    }

    /**
     * Check if barcode is already used in a shop by a different product
     */
    public boolean isBarcodeDuplicate(Long shopId, String barcode, Long excludeProductId) {
        if (barcode == null || barcode.isBlank()) return false;
        String sql = "SELECT COUNT(*) FROM market_shopproduct WHERE shop_id = ? AND barcode = ?" +
                (excludeProductId != null ? " AND id <> ?" : "");
        Object[] params = excludeProductId != null ? new Object[]{shopId, barcode.trim(), excludeProductId} : new Object[]{shopId, barcode.trim()};
        Integer count = jdbc.queryForObject(sql, params, Integer.class);
        return count != null && count > 0;
    }

    /**
     * Check if SKU is already used in a shop by a different product
     */
    public boolean isSkuDuplicate(Long shopId, String sku, Long excludeProductId) {
        if (sku == null || sku.isBlank()) return false;
        String sql = "SELECT COUNT(*) FROM market_shopproduct WHERE shop_id = ? AND sku = ?" +
                (excludeProductId != null ? " AND id <> ?" : "");
        Object[] params = excludeProductId != null ? new Object[]{shopId, sku.trim(), excludeProductId} : new Object[]{shopId, sku.trim()};
        Integer count = jdbc.queryForObject(sql, params, Integer.class);
        return count != null && count > 0;
    }

    /**
     * Insert a new product under a specific shop
     */
    public int insertProduct(Long shopId, String title, String description, Double mrp, Double price,
                              Double discountPercent, Boolean onlineDelivery, Boolean offlineDelivery,
                              Integer stockQty, String image, Boolean isActive, String category,
                              String sku, String barcode, Integer lowStockThreshold,
                              Double wholesalePrice, Integer moq) {
        String sql = "INSERT INTO market_shopproduct (" +
                "shop_id, title, description, mrp, price, discount_percent, " +
                "online_delivery, offline_delivery, stock_qty, image, is_active, created_at, category, " +
                "sku, barcode, low_stock_threshold, wholesale_price, moq" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)";

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
                isActive,
                category,
                sku,
                barcode,
                lowStockThreshold != null ? lowStockThreshold : 5,
                wholesalePrice,
                moq != null ? moq : 1
        );
    }

    public int insertProduct(Long shopId, String title, String description, Double mrp, Double price,
                              Double discountPercent, Boolean onlineDelivery, Boolean offlineDelivery,
                              Integer stockQty, String image, Boolean isActive, String category) {
        return insertProduct(shopId, title, description, mrp, price, discountPercent, onlineDelivery,
                offlineDelivery, stockQty, image, isActive, category, null, null, 5, null, 1);
    }

    public int insertProduct(Long shopId, String title, String description, Double mrp, Double price,
                              Double discountPercent, Boolean onlineDelivery, Boolean offlineDelivery,
                              Integer stockQty, String image, Boolean isActive) {
        return insertProduct(shopId, title, description, mrp, price, discountPercent, onlineDelivery,
                offlineDelivery, stockQty, image, isActive, null, null, null, 5, null, 1);
    }

    /**
     * Update an existing product
     */
    public int updateProduct(Long id, String title, String description, Double mrp, Double price,
                              Double discountPercent, Boolean onlineDelivery, Boolean offlineDelivery,
                              Integer stockQty, String image, Boolean isActive, String category,
                              String sku, String barcode, Integer lowStockThreshold,
                              Double wholesalePrice, Integer moq) {
        String sql = "UPDATE market_shopproduct SET " +
                "title = ?, description = ?, mrp = ?, price = ?, discount_percent = ?, " +
                "online_delivery = ?, offline_delivery = ?, stock_qty = ?, image = ?, is_active = ?, category = ?, " +
                "sku = ?, barcode = ?, low_stock_threshold = ?, wholesale_price = ?, moq = ? " +
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
                category,
                sku,
                barcode,
                lowStockThreshold != null ? lowStockThreshold : 5,
                wholesalePrice,
                moq != null ? moq : 1,
                id
        );
    }

    public int updateProduct(Long id, String title, String description, Double mrp, Double price,
                              Double discountPercent, Boolean onlineDelivery, Boolean offlineDelivery,
                              Integer stockQty, String image, Boolean isActive, String category) {
        // preserve existing extra fields
        ShopProductResponse existing = findProductById(id).orElse(null);
        String sku = existing != null ? existing.getSku() : null;
        String barcode = existing != null ? existing.getBarcode() : null;
        Integer threshold = existing != null && existing.getLowStockThreshold() != null ? existing.getLowStockThreshold() : 5;
        Double wholesale = existing != null ? existing.getWholesalePrice() : null;
        Integer moq = existing != null && existing.getMoq() != null ? existing.getMoq() : 1;
        return updateProduct(id, title, description, mrp, price, discountPercent, onlineDelivery,
                offlineDelivery, stockQty, image, isActive, category, sku, barcode, threshold, wholesale, moq);
    }

    public int updateProduct(Long id, String title, String description, Double mrp, Double price,
                              Double discountPercent, Boolean onlineDelivery, Boolean offlineDelivery,
                              Integer stockQty, String image, Boolean isActive) {
        String existingCategory = findProductById(id).map(ShopProductResponse::getCategory).orElse(null);
        return updateProduct(id, title, description, mrp, price, discountPercent, onlineDelivery,
                offlineDelivery, stockQty, image, isActive, existingCategory);
    }

    /**
     * Delete product by ID
     */
    public int deleteProduct(Long id) {
        return jdbc.update("DELETE FROM market_shopproduct WHERE id = ?", id);
    }

    /**
     * Atomic stock adjustment with durable stock movement ledger entry
     */
    @Transactional
    public ShopProductResponse adjustStockAtomic(Long productId, Long shopId, Long actorUserId,
                                                 String actorRole, String movementType, int qty,
                                                 String reason, String referenceId) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT id, shop_id, stock_qty FROM market_shopproduct WHERE id = ? AND shop_id = ? FOR UPDATE",
                productId, shopId
        );
        if (rows.isEmpty()) {
            throw new RuntimeException("Product not found or not owned by shop.");
        }
        int previousStock = ((Number) rows.get(0).get("stock_qty")).intValue();
        int quantityChange;
        int resultingStock;

        String type = movementType != null ? movementType.trim().toUpperCase() : "CORRECTION";
        switch (type) {
            case "ADD":
                if (qty <= 0) throw new IllegalArgumentException("Quantity to add must be greater than 0");
                quantityChange = qty;
                resultingStock = previousStock + qty;
                break;
            case "REDUCE":
                if (qty <= 0) throw new IllegalArgumentException("Quantity to reduce must be greater than 0");
                if (previousStock < qty) {
                    throw new IllegalArgumentException("Cannot reduce stock by " + qty + ". Current stock is " + previousStock);
                }
                quantityChange = -qty;
                resultingStock = previousStock - qty;
                break;
            case "CORRECTION":
            default:
                if (qty < 0) throw new IllegalArgumentException("Corrected stock count cannot be negative");
                quantityChange = qty - previousStock;
                resultingStock = qty;
                break;
        }

        jdbc.update("UPDATE market_shopproduct SET stock_qty = ? WHERE id = ?", resultingStock, productId);

        jdbc.update(
                "INSERT INTO product_stock_movements " +
                "(product_id, shop_id, actor_user_id, actor_role, movement_type, quantity_change, previous_stock, resulting_stock, reason, reference_id, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
                productId, shopId, actorUserId, actorRole != null ? actorRole : "MERCHANT",
                type, quantityChange, previousStock, resultingStock, reason, referenceId
        );

        return findProductById(productId).orElseThrow();
    }

    /**
     * Record stock movement from order lifecycle (confirmation / cancellation)
     */
    public void recordStockMovement(Long productId, Long shopId, Long actorUserId, String actorRole,
                                    String movementType, int quantityChange, int previousStock,
                                    int resultingStock, String reason, String referenceId) {
        try {
            jdbc.update(
                    "INSERT INTO product_stock_movements " +
                    "(product_id, shop_id, actor_user_id, actor_role, movement_type, quantity_change, previous_stock, resulting_stock, reason, reference_id, created_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
                    productId, shopId, actorUserId != null ? actorUserId : 1L,
                    actorRole != null ? actorRole : "SYSTEM",
                    movementType, quantityChange, previousStock, resultingStock, reason, referenceId
            );
        } catch (Exception ignored) {
            // Safe logging, do not fail parent transaction
        }
    }

    /**
     * Retrieve stock audit movements for a product
     */
    public List<StockMovementResponse> findStockMovements(Long productId, int limit) {
        String sql = "SELECT id, product_id, shop_id, actor_user_id, actor_role, movement_type, " +
                "quantity_change, previous_stock, resulting_stock, reason, reference_id, created_at " +
                "FROM product_stock_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT ?";
        return jdbc.query(sql, new Object[]{productId, limit > 0 ? limit : 20}, (rs, rowNum) ->
                StockMovementResponse.builder()
                        .id(rs.getLong("id"))
                        .productId(rs.getLong("product_id"))
                        .shopId(rs.getLong("shop_id"))
                        .actorUserId(rs.getLong("actor_user_id"))
                        .actorRole(rs.getString("actor_role"))
                        .movementType(rs.getString("movement_type"))
                        .quantityChange(rs.getInt("quantity_change"))
                        .previousStock(rs.getInt("previous_stock"))
                        .resultingStock(rs.getInt("resulting_stock"))
                        .reason(rs.getString("reason"))
                        .referenceId(rs.getString("reference_id"))
                        .createdAt(rs.getString("created_at"))
                        .build()
        );
    }

    /**
     * Fetch all online-enabled products across all active shops.
     */
    public List<ShopProductResponse> findOnlineProducts(String search, String category, int limit, int offset) {
        StringBuilder sql = new StringBuilder(
            "SELECT p.id, p.shop_id, s.shop_name, sc.name AS category, " +
            "p.title, p.description, p.mrp, p.price, p.discount_percent, " +
            "p.online_delivery, p.offline_delivery, p.stock_qty, p.image, p.is_active, p.created_at, " +
            "p.sku, p.barcode, p.low_stock_threshold, p.wholesale_price, p.moq " +
            "FROM market_shopproduct p " +
            "JOIN market_shop s ON p.shop_id = s.id " +
            "JOIN accounts_customuser u ON s.merchant_id = u.id " +
            "LEFT JOIN market_merchantprofile mp ON mp.user_id = u.id " +
            "LEFT JOIN business_merchantcategory sc ON s.category_id = sc.id " +
            "WHERE p.online_delivery = TRUE AND p.is_active = TRUE " +
            "AND s.status = 'ACTIVE' AND UPPER(COALESCE(s.service_mode, mp.service_mode, 'OFFLINE')) IN ('ONLINE', 'BOTH') "
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
     */
    public List<String> findOnlineProductCategories() {
        String sql =
            "SELECT DISTINCT sc.name " +
            "FROM market_shopproduct p " +
            "JOIN market_shop s ON p.shop_id = s.id " +
            "JOIN accounts_customuser u ON s.merchant_id = u.id " +
            "LEFT JOIN market_merchantprofile mp ON mp.user_id = u.id " +
            "LEFT JOIN business_merchantcategory sc ON s.category_id = sc.id " +
            "WHERE p.online_delivery = TRUE AND p.is_active = TRUE " +
            "AND s.status = 'ACTIVE' AND UPPER(COALESCE(s.service_mode, mp.service_mode, 'OFFLINE')) IN ('ONLINE', 'BOTH') " +
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
                .sku(rs.getString("sku"))
                .barcode(rs.getString("barcode"))
                .lowStockThreshold(rs.getInt("low_stock_threshold"))
                .wholesalePrice(rs.getObject("wholesale_price") != null ? rs.getDouble("wholesale_price") : null)
                .moq(rs.getInt("moq"))
                .build();
    }

    private ShopProductResponse mapProduct(ResultSet rs, int rowNum) throws SQLException {
        int threshold = 5;
        try { threshold = rs.getInt("low_stock_threshold"); } catch (SQLException ignored) {}
        int moq = 1;
        try { moq = rs.getInt("moq"); } catch (SQLException ignored) {}
        Double wholesale = null;
        try {
            double w = rs.getDouble("wholesale_price");
            wholesale = rs.wasNull() ? null : w;
        } catch (SQLException ignored) {}
        String sku = null;
        try { sku = rs.getString("sku"); } catch (SQLException ignored) {}
        String barcode = null;
        try { barcode = rs.getString("barcode"); } catch (SQLException ignored) {}

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
                .category(rs.getString("category"))
                .sku(sku)
                .barcode(barcode)
                .lowStockThreshold(threshold)
                .wholesalePrice(wholesale)
                .moq(moq)
                .build();
    }
}
