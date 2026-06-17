package com.trikonekt.captain.model;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfflinePaymentResponse {
    private Long id;
    private String refId;
    private Long consumerId;
    private String consumerName;
    private String consumerPhone;
    private Long shopId;
    private String shopName;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
