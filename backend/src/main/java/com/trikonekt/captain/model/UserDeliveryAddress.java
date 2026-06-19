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
public class UserDeliveryAddress {
    private Long id;
    
    @JsonProperty("user_id")
    private Long userId;
    
    @JsonProperty("recipients_name")
    private String recipientsName;
    
    @JsonProperty("recipients_phone")
    private String recipientsPhone;
    
    @JsonProperty("address_line1")
    private String addressLine1;
    
    @JsonProperty("address_line2")
    private String addressLine2;
    
    private String landmark;
    private String city;
    
    @JsonProperty("state_name")
    private String stateName;
    
    private String pincode;
    
    @JsonProperty("is_default")
    private Boolean isDefault;
    
    @JsonProperty("created_at")
    private String createdAt;
    
    @JsonProperty("updated_at")
    private String updatedAt;
}
