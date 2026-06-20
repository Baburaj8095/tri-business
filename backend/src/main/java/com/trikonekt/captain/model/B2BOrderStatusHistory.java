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
public class B2BOrderStatusHistory {
    private Long id;

    @JsonProperty("order_id")
    private Long orderId;

    private String status;

    @JsonProperty("payment_status")
    private String paymentStatus;

    private String notes;

    @JsonProperty("changed_by")
    private String changedBy;

    @JsonProperty("changed_by_user_id")
    private Long changedByUserId;

    @JsonProperty("changed_at")
    private String changedAt;
}