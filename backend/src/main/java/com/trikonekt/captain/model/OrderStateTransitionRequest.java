package com.trikonekt.captain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStateTransitionRequest {
    private String status; // PENDING_CONFIRMATION, CONFIRMED, PREPARING, DISPATCHED, COMPLETED, CANCELLED
    private String notes;
    private String cancellationReason;
}
