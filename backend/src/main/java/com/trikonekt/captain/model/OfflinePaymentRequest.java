package com.trikonekt.captain.model;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

@Data
public class OfflinePaymentRequest {
    @NotNull(message = "Shop ID is required")
    private Long shopId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "10.00", message = "Amount must be at least ₹10")
    private BigDecimal amount;

    private String paymentMethod = "MANUAL";
}
