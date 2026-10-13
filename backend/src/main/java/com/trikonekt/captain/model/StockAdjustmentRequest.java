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
public class StockAdjustmentRequest {
    /**
     * 'ADD' | 'REDUCE' | 'CORRECTION'
     */
    @JsonProperty("movement_type")
    private String movementType;

    private Integer quantity;

    private String reason;

    @JsonProperty("reference_id")
    private String referenceId;
}
