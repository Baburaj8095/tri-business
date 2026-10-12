package com.trikonekt.captain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrizoneCommissionRecord {
    private Long id;
    private Long offlinePaymentId;
    private Long beneficiaryUserId;
    private String beneficiaryName;
    private String beneficiaryRole;
    private Long shopId;
    private String shopName;
    private String pincode;
    private BigDecimal netOnlineAmount;
    private BigDecimal shopCommissionPercent;
    private BigDecimal totalCommissionPool;
    private BigDecimal roleSharePercent;
    private BigDecimal commissionAmount;
    private String status;
    private String createdAt;
}
