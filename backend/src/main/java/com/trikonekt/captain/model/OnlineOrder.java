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
public class OnlineOrder {
    private Long id;

    @JsonProperty("order_number")
    private String orderNumber;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("shop_id")
    private Long shopId;

    @JsonProperty("shop_name")
    private String shopName;

    @JsonProperty("shop_phone")
    private String shopPhone;

    @JsonProperty("shop_address")
    private String shopAddress;

    @JsonProperty("delivery_address_id")
    private Long deliveryAddressId;

    private String address;

    @JsonProperty("order_channel")
    private String orderChannel;

    private String status; // DRAFT, PENDING_CONFIRMATION, CONFIRMED, PREPARING, DISPATCHED, COMPLETED, CANCELLED

    private Double subtotal;

    @JsonProperty("total_mrp")
    private Double totalMrp;

    @JsonProperty("total_discount")
    private Double totalDiscount;

    @JsonProperty("delivery_fee")
    private Double deliveryFee;

    @JsonProperty("grand_total")
    private Double grandTotal;

    private Double total;

    @JsonProperty("payment_method")
    private String paymentMethod; // COD, ONLINE

    @JsonProperty("payment_status")
    private String paymentStatus; // PENDING, PAID, REFUNDED

    @JsonProperty("payment_ref_id")
    private String paymentRefId;

    @JsonProperty("offline_payment_id")
    private Long offlinePaymentId;

    @JsonProperty("cancellation_reason")
    private String cancellationReason;

    @JsonProperty("shipment_id")
    private String shipmentId;

    @JsonProperty("awb_number")
    private String awbNumber;

    @JsonProperty("courier_name")
    private String courierName;

    @JsonProperty("label_url")
    private String labelUrl;

    @JsonProperty("tracking_url")
    private String trackingUrl;

    private String notes;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    private List<OnlineOrderItem> items;

    @JsonProperty("status_history")
    private List<OrderStatusHistory> statusHistory;
}
