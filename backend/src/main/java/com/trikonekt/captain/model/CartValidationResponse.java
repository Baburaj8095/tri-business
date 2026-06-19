package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartValidationResponse {
    @JsonProperty("shop_id")
    private Long shopId;

    @JsonProperty("shop_name")
    private String shopName;

    @JsonProperty("is_deliverable")
    private Boolean isDeliverable;

    @JsonProperty("sub_total")
    private Double subTotal;

    @JsonProperty("delivery_fee")
    private Double deliveryFee;

    @JsonProperty("min_order_value")
    private Double minOrderValue;

    @JsonProperty("total")
    private Double total;

    private List<CartItemResponse> items;

    @JsonProperty("is_valid")
    private Boolean isValid;

    private String message;
}
