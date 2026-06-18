package com.trikonekt.captain.model;

import lombok.Data;

@Data
public class MerchantCategoryCreateRequest {
    private String name;
    private String audience;
    private Integer sortOrder;
}