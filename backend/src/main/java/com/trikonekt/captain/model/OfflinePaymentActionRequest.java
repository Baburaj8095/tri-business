package com.trikonekt.captain.model;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class OfflinePaymentActionRequest {
    @NotBlank(message = "Action is required")
    private String action; // ACCEPT or REJECT
}
