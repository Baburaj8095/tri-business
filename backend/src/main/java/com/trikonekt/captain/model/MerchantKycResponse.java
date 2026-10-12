package com.trikonekt.captain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantKycResponse {
    private Long id;
    private Long userId;
    private String panNumber;
    private String panCardUrl;
    private Boolean isGstRegistered;
    private String gstin;
    private String gstLegalName;
    private String gstCertificateUrl;
    private String businessProofType;
    private String businessProofUrl;
    private String kycStatus; // 'NOT_STARTED', 'PENDING', 'VERIFIED', 'REJECTED'
    private String kycRejectionReason;
    private String verifiedAt;
    private String createdAt;
    private String updatedAt;
}
