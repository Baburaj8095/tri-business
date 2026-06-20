package com.trikonekt.captain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class B2BPaymentActionRequest {
    private String action; // ACCEPT/APPROVE or REJECT
    private String notes;
}