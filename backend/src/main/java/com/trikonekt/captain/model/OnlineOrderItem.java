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
public class OnlineOrderItem {
    private Long id;

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("product_title")
    private String productTitle;

    @JsonProperty("mrp_at_purchase")
    private Double mrpAtPurchase;

    private Integer quantity;
    private Double price;
}
