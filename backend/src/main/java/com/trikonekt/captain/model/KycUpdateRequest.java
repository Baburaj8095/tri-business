package com.trikonekt.captain.model;

import lombok.Data;

@Data
public class KycUpdateRequest {
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
}
