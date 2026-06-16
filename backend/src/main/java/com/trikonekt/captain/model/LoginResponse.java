package com.trikonekt.captain.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String access;
    private String refresh;
    private String username;
    private String captainId;
    private String fullName;
    private String role;
    private String category;
    private String pincode;
    private String district;
    private String state;
}
