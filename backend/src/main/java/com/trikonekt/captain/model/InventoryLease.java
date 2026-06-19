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
public class InventoryLease {
    private Long id;

    @JsonProperty("product_id")
    private Long productId;

    private Integer quantity;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("expires_at")
    private String expiresAt;

    @JsonProperty("order_id")
    private Long orderId;

    @JsonProperty("created_at")
    private String createdAt;
}
