package com.trikonekt.captain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateShopRequest {
    private String shop_name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String contact_number;
    private String email;
    private String description;
    private Long category;
    private Long subcategory;
    private String gst_number;
    private String pan_number;
    private String business_reg_number;
}
