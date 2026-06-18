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
public class ShopResponse {
    private Long id;
    private String shop_name;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private String contact_number;
    private String email;
    private String shop_image;
    private String banner;
    private Long category;
    private Long subcategory;
    private String description;
    private String gst_number;
    private String pan_number;
    private String business_reg_number;
    private String business_logo;
    private Boolean is_active;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;
}
