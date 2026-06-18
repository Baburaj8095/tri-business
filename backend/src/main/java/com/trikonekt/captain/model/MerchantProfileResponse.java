package com.trikonekt.captain.model;

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
    private String phone;
    private String pincode;
    private String role;
    private String category;
    private Boolean is_active;
    private Integer total_shops;
}
