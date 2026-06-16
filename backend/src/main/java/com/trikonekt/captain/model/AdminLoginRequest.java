package com.trikonekt.captain.model;

import lombok.Data;

@Data
public class AdminLoginRequest {
    private String username;
    private String password;
}
