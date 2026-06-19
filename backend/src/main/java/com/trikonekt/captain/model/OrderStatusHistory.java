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
public class OrderStatusHistory {

    private Long id;

    @JsonProperty("order_id")
    private Long orderId;

    private String status;

    private String notes;

    @JsonProperty("changed_by")
    private String changedBy;

    @JsonProperty("changed_at")
    private String changedAt;
}
