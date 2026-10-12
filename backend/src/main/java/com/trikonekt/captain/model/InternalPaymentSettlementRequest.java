package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternalPaymentSettlementRequest {

    @NotNull(message = "Ref ID is required")
    @JsonProperty("ref_id")
    private String refId;

    @NotNull(message = "Gateway Payment ID is required")
    @JsonProperty("gateway_payment_id")
    private String gatewayPaymentId;

    @JsonProperty("gateway_order_id")
    private String gatewayOrderId;

    @JsonProperty("payment_intent_id")
    private String paymentIntentId;

    @NotNull(message = "Shop ID is required")
    @JsonProperty("shop_id")
    private Long shopId;

    @NotNull(message = "Consumer phone is required")
    @JsonProperty("consumer_phone")
    private String consumerPhone;

    @NotNull(message = "Gross amount is required")
    @JsonProperty("gross_amount")
    private BigDecimal grossAmount;

    @JsonProperty("wallet_discount")
    private BigDecimal walletDiscount;

    @JsonProperty("net_online_amount")
    private BigDecimal netOnlineAmount;

    @JsonProperty("payment_method")
    private String paymentMethod;
}
