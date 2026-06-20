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
public class CreateOrderRequest {
    @JsonProperty("shop_id")
    private Long shopId;

    @JsonProperty("address_id")
    private Long addressId;

    @JsonProperty("payment_method")
    private String paymentMethod; // COD or ONLINE

    @JsonProperty("order_channel")
    private String orderChannel; // NEARBY_DELIVERY for local home-delivery flow

    private Double latitude;

    private Double longitude;

    private String notes;

    private List<CartItemRequest> items;
}
