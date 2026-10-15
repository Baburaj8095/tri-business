package com.trikonekt.captain.model;

import lombok.Data;

@Data
public class LoginRequest {
    private String identifier; // 10-digit mobile number or username
    private String password;
    private String portal;     // "CAPTAIN" or "MERCHANT" / "BUSINESS"
    private String role;       // Alias for portal
    private String prefix;     // Optional prefix: "ONB2C", "ONB2B", "NSB2C", "NSB2B"
    private String channel;    // Optional: "ONLINE" or "OFFLINE"
    private String businessType; // Optional: "B2C" or "B2B"
}
