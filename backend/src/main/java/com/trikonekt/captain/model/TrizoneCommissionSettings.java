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
public class TrizoneCommissionSettings {
    private Long id;
    private BigDecimal captainSharePercent;
    private BigDecimal pincodePartnerSharePercent;
    private BigDecimal districtFranchiseSharePercent;
    private BigDecimal platformReserveSharePercent;
    private BigDecimal defaultShopCommissionPercent;
    private Boolean isActive;
    private String updatedBy;
    private String updatedAt;
}
