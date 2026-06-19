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
public class MarketplaceAd {

    private Long id;

    @JsonProperty("ad_type")
    private String adType; // BANNER, SPONSORED_SHOP, FEATURED_PRODUCT

    @JsonProperty("shop_id")
    private Long shopId;

    @JsonProperty("product_id")
    private Long productId;

    private String title;
    private String description;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("target_url")
    private String targetUrl;

    private Integer priority;

    @JsonProperty("is_active")
    private Boolean isActive;

    @JsonProperty("valid_from")
    private String validFrom;

    @JsonProperty("valid_to")
    private String validTo;

    // Joined fields — populated for SPONSORED_SHOP ads
    @JsonProperty("shop_name")
    private String shopName;

    @JsonProperty("shop_city")
    private String shopCity;

    @JsonProperty("shop_image")
    private String shopImage;

    // Joined fields — populated for FEATURED_PRODUCT ads
    @JsonProperty("product_title")
    private String productTitle;

    @JsonProperty("product_price")
    private Double productPrice;

    @JsonProperty("product_mrp")
    private Double productMrp;

    @JsonProperty("product_discount_percent")
    private Double productDiscountPercent;
}
