package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String full_name;
    
    @JsonProperty("business_name")
    private String businessName;
    
    private String phone;
    
    @JsonProperty("mobile_number")
    private String mobileNumber;

    private String pincode;
    private String role;
    private String category;
    private Boolean is_active;
    private Integer total_shops;
    private String address;
    private Integer age;
}
