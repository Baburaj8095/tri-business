package com.trikonekt.captain.model;

import lombok.Data;

@Data
public class LoginRequest {
    private String identifier; // 10-digit mobile number or username
    private String password;
    private String portal;     // "CAPTAIN" or "MERCHANT" / "BUSINESS"
    private String role;       // Alias for portal
}
