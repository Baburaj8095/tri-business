package com.trikonekt.captain.controller;

import com.trikonekt.captain.model.ShopProductResponse;
import com.trikonekt.captain.model.ShopResponse;
import com.trikonekt.captain.model.StockAdjustmentRequest;
import com.trikonekt.captain.model.StockMovementResponse;
import com.trikonekt.captain.repository.ProductRepository;
import com.trikonekt.captain.repository.ShopRepository;
import com.trikonekt.captain.repository.UserRepository;
import com.trikonekt.captain.service.CloudinaryService;
import com.trikonekt.captain.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/captain/merchant")
public class MerchantProductController {

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public MerchantProductController(ProductRepository productRepository, ShopRepository shopRepository,
                                     JwtService jwtService, UserRepository userRepository,
                                     CloudinaryService cloudinaryService) {
        this.productRepository = productRepository;
        this.shopRepository = shopRepository;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    private Long extractUserIdFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            Map<String, Object> user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            Object idObj = user.get("id");
            if (idObj == null) {
                throw new RuntimeException("User ID not found in database");
            }
            return ((Number) idObj).longValue();
        } catch (Exception e) {
            throw new RuntimeException("Invalid or expired token: " + e.getMessage());
        }
    }

    /**
     * GET /captain/merchant/shops/{shopId}/products
     * Fetch all products (active + inactive) for a specific shop owned by the merchant
     */
    @GetMapping("/shops/{shopId}/products")
    public ResponseEntity<List<ShopProductResponse>> listMyShopProducts(
            @PathVariable Long shopId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        ShopResponse shop = shopRepository.findShopByIdAndMerchantId(shopId, userId)
                .orElseThrow(() -> new RuntimeException("Shop not found or not owned by you."));

        List<ShopProductResponse> products = productRepository.findAllProductsByShopId(shop.getId());
        return ResponseEntity.ok(products);
    }

    /**
     * GET /captain/merchant/shops/{shopId}/products/by-barcode
     * Look up a product by scanned barcode or SKU
     */
    @GetMapping("/shops/{shopId}/products/by-barcode")
    public ResponseEntity<?> getProductByBarcode(
            @PathVariable Long shopId,
            @RequestParam("barcode") String barcode,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        ShopResponse shop = shopRepository.findShopByIdAndMerchantId(shopId, userId)
                .orElseThrow(() -> new RuntimeException("Shop not found or not owned by you."));

        return productRepository.findProductByBarcodeOrSku(shop.getId(), barcode)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    /**
     * POST /captain/merchant/shops/{shopId}/products
     * Create a product under a specific shop owned by the merchant (authenticated, multipart)
     */
    @PostMapping(value = "/shops/{shopId}/products", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, Object>> createMyShopProduct(
            @PathVariable Long shopId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("mrp") Double mrp,
            @RequestParam(value = "discount_percent", required = false, defaultValue = "0") Double discountPercent,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "online_delivery", required = false, defaultValue = "false") Boolean onlineDelivery,
            @RequestParam(value = "offline_delivery", required = false, defaultValue = "true") Boolean offlineDelivery,
            @RequestParam(value = "stock_qty", required = false, defaultValue = "0") Integer stockQty,
            @RequestParam(value = "is_active", required = false, defaultValue = "true") Boolean isActive,
            @RequestParam(value = "category", required = false, defaultValue = "") String category,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam(value = "barcode", required = false) String barcode,
            @RequestParam(value = "low_stock_threshold", required = false, defaultValue = "5") Integer lowStockThreshold,
            @RequestParam(value = "wholesale_price", required = false) Double wholesalePrice,
            @RequestParam(value = "moq", required = false, defaultValue = "1") Integer moq,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        ShopResponse shop = shopRepository.findShopByIdAndMerchantId(shopId, userId)
                .orElseThrow(() -> new RuntimeException("Shop not found or not owned by you."));

        // Validation
        if (title == null || title.trim().isBlank()) {
            throw new IllegalArgumentException("Product title is required.");
        }
        if (mrp == null || mrp <= 0) {
            throw new IllegalArgumentException("MRP must be greater than zero.");
        }
        double calculatedPrice = (price == null || price <= 0) ? (mrp * (1 - discountPercent / 100)) : price;
        if (calculatedPrice <= 0) {
            throw new IllegalArgumentException("Selling price must be greater than zero.");
        }
        if (calculatedPrice > mrp) {
            throw new IllegalArgumentException("Selling price cannot exceed MRP.");
        }
        if (stockQty != null && stockQty < 0) {
            throw new IllegalArgumentException("Initial stock quantity cannot be negative.");
        }
        if (lowStockThreshold != null && lowStockThreshold < 0) {
            throw new IllegalArgumentException("Low stock threshold cannot be negative.");
        }
        if (moq != null && moq < 1) {
            throw new IllegalArgumentException("Minimum order quantity (MOQ) must be at least 1.");
        }

        // SKU / Barcode uniqueness check within this shop
        if (sku != null && !sku.trim().isBlank() && productRepository.isSkuDuplicate(shop.getId(), sku, null)) {
            throw new IllegalArgumentException("SKU '" + sku.trim() + "' is already assigned to another product in this shop.");
        }
        if (barcode != null && !barcode.trim().isBlank() && productRepository.isBarcodeDuplicate(shop.getId(), barcode, null)) {
            throw new IllegalArgumentException("Barcode '" + barcode.trim() + "' is already assigned to another product in this shop.");
        }

        // Image upload with Cloudinary Service
        String imageUrl = "";
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadFile(image);
        }

        int finalStock = stockQty != null ? stockQty : 0;
        productRepository.insertProduct(
                shop.getId(),
                title.trim(),
                description,
                mrp,
                calculatedPrice,
                discountPercent,
                onlineDelivery,
                offlineDelivery,
                finalStock,
                imageUrl,
                isActive,
                category,
                sku != null && !sku.isBlank() ? sku.trim() : null,
                barcode != null && !barcode.isBlank() ? barcode.trim() : null,
                lowStockThreshold,
                wholesalePrice,
                moq
        );

        // Record initial stock movement if inventory > 0
        if (finalStock > 0) {
            // Find newly created product
            productRepository.findProductByBarcodeOrSku(shop.getId(), barcode != null && !barcode.isBlank() ? barcode.trim() : sku)
                    .ifPresent(p -> productRepository.recordStockMovement(
                            p.getId(), shop.getId(), userId, "MERCHANT", "ADD",
                            finalStock, 0, finalStock, "Initial stock ingestion", "INITIAL_SETUP"
                    ));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Product created successfully under shop: " + shop.getShop_name());
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /captain/merchant/products/{productId}
     * Update details of an existing product (authenticated, multipart)
     */
    @PutMapping(value = "/products/{productId}", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, Object>> updateMyShopProduct(
            @PathVariable Long productId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "mrp", required = false) Double mrp,
            @RequestParam(value = "discount_percent", required = false) Double discountPercent,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "online_delivery", required = false) Boolean onlineDelivery,
            @RequestParam(value = "offline_delivery", required = false) Boolean offlineDelivery,
            @RequestParam(value = "stock_qty", required = false) Integer stockQty,
            @RequestParam(value = "is_active", required = false) Boolean isActive,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam(value = "barcode", required = false) String barcode,
            @RequestParam(value = "low_stock_threshold", required = false) Integer lowStockThreshold,
            @RequestParam(value = "wholesale_price", required = false) Double wholesalePrice,
            @RequestParam(value = "moq", required = false) Integer moq,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        Long userId = extractUserIdFromToken(authHeader);

        // Retrieve existing product
        ShopProductResponse existing = productRepository.findProductById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        // Verify shop ownership
        ShopResponse shop = shopRepository.findShopByIdAndMerchantId(existing.getShopId(), userId)
                .orElseThrow(() -> new RuntimeException("Unauthorized. You do not own the shop for this product."));

        String finalTitle = title != null ? title.trim() : existing.getTitle();
        String finalDescription = description != null ? description : existing.getDescription();
        Double finalMrp = mrp != null ? mrp : existing.getMrp();
        Double finalDiscount = discountPercent != null ? discountPercent : existing.getDiscountPercent();
        Double finalPrice = price != null ? price : (mrp != null ? (mrp * (1 - finalDiscount / 100)) : existing.getPrice());

        if (finalMrp != null && finalMrp <= 0) {
            throw new IllegalArgumentException("MRP must be greater than zero.");
        }
        if (finalPrice != null && finalPrice <= 0) {
            throw new IllegalArgumentException("Selling price must be greater than zero.");
        }
        if (finalMrp != null && finalPrice != null && finalPrice > finalMrp) {
            throw new IllegalArgumentException("Selling price cannot exceed MRP.");
        }

        String finalSku = sku != null ? sku.trim() : existing.getSku();
        String finalBarcode = barcode != null ? barcode.trim() : existing.getBarcode();

        if (finalSku != null && !finalSku.isBlank() && productRepository.isSkuDuplicate(shop.getId(), finalSku, productId)) {
            throw new IllegalArgumentException("SKU '" + finalSku + "' is already assigned to another product.");
        }
        if (finalBarcode != null && !finalBarcode.isBlank() && productRepository.isBarcodeDuplicate(shop.getId(), finalBarcode, productId)) {
            throw new IllegalArgumentException("Barcode '" + finalBarcode + "' is already assigned to another product.");
        }

        Boolean finalOnline = onlineDelivery != null ? onlineDelivery : existing.getOnlineDelivery();
        Boolean finalOffline = offlineDelivery != null ? offlineDelivery : existing.getOfflineDelivery();
        Integer finalStock = stockQty != null ? stockQty : existing.getStockQty();
        Boolean finalActive = isActive != null ? isActive : existing.getIs_active();
        String finalCategory = category != null ? category : existing.getCategory();
        Integer finalThreshold = lowStockThreshold != null ? lowStockThreshold : existing.getLowStockThreshold();
        Double finalWholesale = wholesalePrice != null ? wholesalePrice : existing.getWholesalePrice();
        Integer finalMoq = moq != null ? moq : existing.getMoq();

        String imageUrl = existing.getImage();
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadFile(image);
        }

        productRepository.updateProduct(
                productId,
                finalTitle,
                finalDescription,
                finalMrp,
                finalPrice,
                finalDiscount,
                finalOnline,
                finalOffline,
                finalStock,
                imageUrl,
                finalActive,
                finalCategory,
                finalSku,
                finalBarcode,
                finalThreshold,
                finalWholesale,
                finalMoq
        );

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Product updated successfully.");
        return ResponseEntity.ok(response);
    }

    /**
     * POST /captain/merchant/products/{productId}/stock-adjustment
     * Explicit atomic stock adjustment workflow
     */
    @PostMapping("/products/{productId}/stock-adjustment")
    public ResponseEntity<Map<String, Object>> adjustProductStock(
            @PathVariable Long productId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody StockAdjustmentRequest req
    ) {
        Long userId = extractUserIdFromToken(authHeader);

        ShopProductResponse product = productRepository.findProductById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        shopRepository.findShopByIdAndMerchantId(product.getShopId(), userId)
                .orElseThrow(() -> new RuntimeException("Unauthorized. You do not own the shop for this product."));

        if (req == null || req.getQuantity() == null) {
            throw new IllegalArgumentException("Stock quantity adjustment is required.");
        }

        ShopProductResponse updated = productRepository.adjustStockAtomic(
                productId,
                product.getShopId(),
                userId,
                "MERCHANT",
                req.getMovementType(),
                req.getQuantity(),
                req.getReason() != null ? req.getReason() : "Merchant manual adjustment",
                req.getReferenceId()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Stock adjusted successfully.");
        response.put("product", updated);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /captain/merchant/products/{productId}/stock-movements
     * Retrieve audit history of stock adjustments for a product
     */
    @GetMapping("/products/{productId}/stock-movements")
    public ResponseEntity<List<StockMovementResponse>> getProductStockMovements(
            @PathVariable Long productId,
            @RequestParam(value = "limit", defaultValue = "20") int limit,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = extractUserIdFromToken(authHeader);

        ShopProductResponse product = productRepository.findProductById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        shopRepository.findShopByIdAndMerchantId(product.getShopId(), userId)
                .orElseThrow(() -> new RuntimeException("Unauthorized. You do not own the shop for this product."));

        List<StockMovementResponse> movements = productRepository.findStockMovements(productId, limit);
        return ResponseEntity.ok(movements);
    }

    /**
     * DELETE /captain/merchant/products/{productId}
     * Delete an existing product from the shop roster (authenticated)
     */
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> deleteMyShopProduct(
            @PathVariable Long productId,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = extractUserIdFromToken(authHeader);
        ShopProductResponse product = productRepository.findProductById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found or already deleted: " + productId));

        shopRepository.findShopByIdAndMerchantId(product.getShopId(), userId)
                .orElseThrow(() -> new RuntimeException("Unauthorized. You do not own the shop for this product."));

        productRepository.deleteProduct(productId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Product deleted successfully.");
        return ResponseEntity.ok(response);
    }
}
