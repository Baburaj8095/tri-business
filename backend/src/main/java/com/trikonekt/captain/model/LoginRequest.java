package com.trikonekt.captain.model;

import lombok.Data;

@Data
public class LoginRequest {
    private String identifier; // CB ID or 10-digit phone
    private String password;
}
