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
public class B2BPaymentRequest {
    private Double amount;

    @JsonProperty("payment_method")
    private String paymentMethod;

    private String reference;
    private String notes;
}