package com.trikonekt.captain.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CaptainProfileResponse {
    // Core User Info
    private Long id;
    private String username;
    private String fullName;
    private String phone;
    private String email;
    private boolean active;

    // Profile Details
    private String dob;
    private String gender;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String stateName;
    private String pincode;

    // KYC Documents Details
    private String aadhaarNumber;
    private String panNumber;
    private String aadhaarFrontUrl;
    private String aadhaarBackUrl;
    private String panCardUrl;
    private String selfieUrl;
    private String kycStatus; // PENDING, APPROVED, REJECTED
    private String kycRejectionReason;

    // Nominee Details
    private String nomineeName;
    private String nomineeRelationship;
    private String nomineePhone;
    private String nomineeAadhaar;
    private String nomineeDob;

    // Bank Account Details
    private String bankHolderName;
    private String bankName;
    private String bankAccountNumber;
    private String bankIfsc;
    private String bankAccountType;

    // Audit Info
    private String joinedAt;
}
