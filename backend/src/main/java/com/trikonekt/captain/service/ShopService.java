package com.trikonekt.captain.service;

import com.trikonekt.captain.model.CreateShopRequest;
import com.trikonekt.captain.model.MerchantProfileResponse;
import com.trikonekt.captain.model.MerchantProfileUpdateRequest;
import com.trikonekt.captain.model.ShopProductResponse;
import com.trikonekt.captain.model.ShopResponse;
import com.trikonekt.captain.repository.ShopRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ShopService {

    private final ShopRepository shopRepository;
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public ShopService(ShopRepository shopRepository) {
        this.shopRepository = shopRepository;
    }

    /**
     * Get all shops owned by a merchant (authenticated)
     */
    public List<ShopResponse> listMyShops(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        try {
            return shopRepository.findShopsByMerchantId(userId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to fetch shops: " + e.getMessage());
        }
    }

    /**
     * Create a new shop (authenticated)
     */
    public Map<String, Object> createShop(Long userId, CreateShopRequest request) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }

        validateShopRequest(request);

        try {
            String now = LocalDateTime.now().format(dateFormatter);

            int rowsInserted = shopRepository.insertShop(
                userId,
                request.getShop_name(),
                request.getAddress(),
                request.getCity(),
                request.getState(),
                request.getPincode(),
                request.getLatitude(),
                request.getLongitude(),
                request.getContact_number(),
                request.getEmail(),
                request.getDescription(),
                request.getCategory(),
                request.getSubcategory(),
                request.getGst_number(),
                request.getPan_number(),
                request.getBusiness_reg_number(),
                now
            );

            if (rowsInserted == 0) {
                throw new RuntimeException("Failed to insert shop into database");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Shop created successfully");
            response.put("shop_name", request.getShop_name());
            return response;
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to create shop: " + e.getMessage());
        }
    }

    /**
     * Get public shop detail (public)
     */
    public ShopResponse getShopDetail(Long shopId) {
        if (shopId == null || shopId <= 0) {
            throw new IllegalArgumentException("Invalid shop ID");
        }
        try {
            return shopRepository.findActiveShopById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found or inactive"));
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to fetch shop: " + e.getMessage());
        }
    }

    /**
     * List all public active shops (public)
     */
    public List<ShopResponse> listPublicShops() {
        try {
            return shopRepository.findAllActiveShops();
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to fetch shops: " + e.getMessage());
        }
    }

    /**
     * Get products for a shop (public)
     */
    public List<ShopProductResponse> getShopProducts(Long shopId) {
        if (shopId == null || shopId <= 0) {
            throw new IllegalArgumentException("Invalid shop ID");
        }
        try {
            return shopRepository.findProductsByShopId(shopId);
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to fetch products: " + e.getMessage());
        }
    }

    /**
     * Get merchant profile info (authenticated)
     */
    public MerchantProfileResponse getMerchantProfile(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        try {
            return shopRepository.findMerchantProfile(userId)
                .orElseThrow(() -> new RuntimeException("Merchant profile not found"));
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to fetch merchant profile: " + e.getMessage());
        }
    }

    /**
     * Update merchant profile (authenticated)
     */
    public MerchantProfileResponse updateMerchantProfile(Long userId, MerchantProfileUpdateRequest request) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        try {
            shopRepository.updateMerchantProfile(userId, request);
            return shopRepository.findMerchantProfile(userId)
                .orElseThrow(() -> new RuntimeException("Merchant profile not found after update"));
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to update merchant profile: " + e.getMessage());
        }
    }

    /**
     * Get a specific shop owned by the merchant (authenticated)
     */
    public ShopResponse getMyShopDetail(Long userId, Long shopId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        if (shopId == null || shopId <= 0) {
            throw new IllegalArgumentException("Invalid shop ID");
        }
        try {
            return shopRepository.findShopByIdAndMerchantId(shopId, userId)
                .orElseThrow(() -> new RuntimeException("Shop not found or you are not the owner"));
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to fetch shop details: " + e.getMessage());
        }
    }

    /**
     * Update an existing shop (authenticated)
     */
    public Map<String, Object> updateShop(Long userId, Long shopId, CreateShopRequest request) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        if (shopId == null || shopId <= 0) {
            throw new IllegalArgumentException("Invalid shop ID");
        }

        // Check if shop exists and is owned by user
        ShopResponse existing = shopRepository.findShopByIdAndMerchantId(shopId, userId)
            .orElseThrow(() -> new RuntimeException("Shop not found or access denied"));

        try {
            // Apply partial updates from request
            String shopName = request.getShop_name() != null ? request.getShop_name() : existing.getShop_name();
            String address = request.getAddress() != null ? request.getAddress() : existing.getAddress();
            String city = request.getCity() != null ? request.getCity() : existing.getCity();
            String state = request.getState() != null ? request.getState() : existing.getState();
            String pincode = request.getPincode() != null ? request.getPincode() : existing.getPincode();
            Double latitude = request.getLatitude() != null ? request.getLatitude() : existing.getLatitude();
            Double longitude = request.getLongitude() != null ? request.getLongitude() : existing.getLongitude();
            String contactNumber = request.getContact_number() != null ? request.getContact_number() : existing.getContact_number();
            
            // Allow category & subcategory update/keep
            Long categoryId = request.getCategory() != null ? request.getCategory() : existing.getCategory();
            Long subcategoryId = request.getSubcategory() != null ? request.getSubcategory() : existing.getSubcategory();

            int rowsUpdated = shopRepository.updateShop(
                shopId,
                userId,
                shopName,
                address,
                city,
                state,
                pincode,
                latitude,
                longitude,
                contactNumber,
                categoryId,
                subcategoryId
            );

            if (rowsUpdated == 0) {
                // Return success anyway or throw if preferred (if database returns 0 rows updated but it works)
                // Often update returns 0 if nothing changed. Let's just return success if we can still read it.
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Shop updated successfully");
            response.put("shop_name", shopName);
            return response;
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to update shop: " + e.getMessage());
        }
    }

    /**
     * Delete an existing shop (authenticated)
     */
    public Map<String, Object> deleteShop(Long userId, Long shopId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }
        if (shopId == null || shopId <= 0) {
            throw new IllegalArgumentException("Invalid shop ID");
        }

        // Check if shop exists and is owned by user
        shopRepository.findShopByIdAndMerchantId(shopId, userId)
            .orElseThrow(() -> new RuntimeException("Shop not found or access denied"));

        try {
            int rowsDeleted = shopRepository.deleteShopByIdAndMerchantId(shopId, userId);
            if (rowsDeleted == 0) {
                throw new RuntimeException("Failed to delete shop");
            }

            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Shop deleted successfully");
            return response;
        } catch (DataAccessException e) {
            throw new RuntimeException("Failed to delete shop: " + e.getMessage());
        }
    }

    /**
     * Validate shop creation request
     */
    private void validateShopRequest(CreateShopRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Shop request cannot be null");
        }
        if (request.getShop_name() == null || request.getShop_name().isBlank()) {
            throw new IllegalArgumentException("Shop name is required");
        }
        if (request.getAddress() == null || request.getAddress().isBlank()) {
            throw new IllegalArgumentException("Address is required");
        }
        if (request.getCity() == null || request.getCity().isBlank()) {
            throw new IllegalArgumentException("City is required");
        }
        if (request.getState() == null || request.getState().isBlank()) {
            throw new IllegalArgumentException("State is required");
        }
        if (request.getPincode() == null || request.getPincode().isBlank()) {
            throw new IllegalArgumentException("Pincode is required");
        }
        if (request.getContact_number() == null || request.getContact_number().isBlank()) {
            throw new IllegalArgumentException("Contact number is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
    }
}
