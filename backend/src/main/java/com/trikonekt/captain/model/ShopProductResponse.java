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
public class ShopProductResponse {
    private Long id;

    @JsonProperty("shop_id")
    private Long shopId;

    @JsonProperty("shop_name")
    private String shopName;

    private String category;

    private String title;
    private String description;
    private Double mrp;
    private Double price;

    @JsonProperty("discount_percent")
    private Double discountPercent;

    @JsonProperty("online_delivery")
    private Boolean onlineDelivery;

    @JsonProperty("offline_delivery")
    private Boolean offlineDelivery;

    @JsonProperty("stock_qty")
    private Integer stockQty;

    private String image;

    @JsonProperty("image_url")
    public String getImageUrl() {
        return image;
    }

    private Boolean is_active;

    @JsonProperty("created_at")
    private String createdAt;
}
