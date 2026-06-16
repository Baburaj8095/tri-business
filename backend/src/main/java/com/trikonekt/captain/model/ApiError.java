package com.trikonekt.captain.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiError {
    private String message;
    private String detail;
    private String field;

    public ApiError(String message) {
        this.message = message;
    }
}
