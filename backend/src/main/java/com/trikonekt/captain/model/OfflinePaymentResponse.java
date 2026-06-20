package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("online_order_id")
    private Long onlineOrderId;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
