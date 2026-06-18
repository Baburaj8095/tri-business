package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MerchantProfileUpdateRequest {
    @JsonProperty("business_name")
    private String businessName;

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("mobile_number")
    private String mobileNumber;

    private String phone;
    private String email;
    private String address;
    private Integer age;
}
