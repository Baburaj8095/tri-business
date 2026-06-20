package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class B2BOnlineOrder {
    private Long id;

    @JsonProperty("order_number")
    private String orderNumber;

    @JsonProperty("buyer_id")
    private Long buyerId;

    @JsonProperty("buyer_name")
    private String buyerName;

    @JsonProperty("seller_id")
    private Long sellerId;

    @JsonProperty("seller_name")
    private String sellerName;

    @JsonProperty("shop_id")
    private Long shopId;

    @JsonProperty("shop_name")
    private String shopName;

    private String status;

    @JsonProperty("payment_status")
    private String paymentStatus;

    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("payment_ref_id")
    private String paymentRefId;

    private Double subtotal;

    @JsonProperty("total_mrp")
    private Double totalMrp;

    @JsonProperty("total_discount")
    private Double totalDiscount;

    @JsonProperty("grand_total")
    private Double grandTotal;

    private String notes;

    @JsonProperty("cancellation_reason")
    private String cancellationReason;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    private List<B2BOnlineOrderItem> items;

    @JsonProperty("status_history")
    private List<B2BOrderStatusHistory> statusHistory;
}