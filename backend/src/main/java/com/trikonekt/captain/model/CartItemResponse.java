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
public class CartItemResponse {
    @JsonProperty("product_id")
    private Long productId;

    private String title;
    private Double price;
    private Integer quantity;

    @JsonProperty("sub_total")
    private Double subTotal;

    @JsonProperty("is_available")
    private Boolean isAvailable;

    private String message;
}
