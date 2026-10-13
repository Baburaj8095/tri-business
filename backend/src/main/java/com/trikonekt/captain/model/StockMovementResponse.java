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
public class StockMovementResponse {
    private Long id;

    @JsonProperty("product_id")
    private Long productId;

    @JsonProperty("shop_id")
    private Long shopId;

    @JsonProperty("actor_user_id")
    private Long actorUserId;

    @JsonProperty("actor_role")
    private String actorRole;

    @JsonProperty("movement_type")
    private String movementType;

    @JsonProperty("quantity_change")
    private Integer quantityChange;

    @JsonProperty("previous_stock")
    private Integer previousStock;

    @JsonProperty("resulting_stock")
    private Integer resultingStock;

    private String reason;

    @JsonProperty("reference_id")
    private String referenceId;

    @JsonProperty("created_at")
    private String createdAt;
}
