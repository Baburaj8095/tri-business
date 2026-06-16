package com.trikonekt.captain.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminLoginResponse {
    private String token;
    private String username;
    private String email;
    private String role;     // SUPER_ADMIN, SUB_ADMIN
    private String modules;  // e.g. "captains,kyc,sub_admins" or "all"
}
