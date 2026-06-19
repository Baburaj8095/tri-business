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
public class CartValidationRequest {
    @JsonProperty("shop_id")
    private Long shopId;

    @JsonProperty("address_id")
    private Long addressId;

    private List<CartItemRequest> items;
}
