package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShopResponse {
    private Long id;
    private String shop_name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String contact_number;
    private String email;
    private String shop_image;
    private String banner;
    private Long category;
    private Long subcategory;
    private String description;
    private String gst_number;
    private String pan_number;
    private String business_reg_number;
    private String business_logo;
    private Boolean is_active;

    @JsonProperty("service_mode")
    private String serviceMode;

    @JsonProperty("home_delivery_enabled")
    private Boolean homeDeliveryEnabled;

    @JsonProperty("delivery_radius_km")
    private Double deliveryRadiusKm;

    @JsonProperty("min_order_value")
    private Double minOrderValue;

    @JsonProperty("base_delivery_fee")
    private Double baseDeliveryFee;

    @JsonProperty("discount_percent")
    private Double discountPercent;

    @JsonProperty("distance_km")
    private Double distanceKm;

    @JsonProperty("is_delivery_available")
    private Boolean isDeliveryAvailable;

    @JsonProperty("delivery_unavailable_reason")
    private String deliveryUnavailableReason;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;
}
