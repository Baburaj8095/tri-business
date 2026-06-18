package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MerchantSubCategoryCreateRequest {
    private String name;

    @JsonProperty("category_id")
    private Long categoryId;

    private String audience;

    @JsonProperty("sort_order")
    private Integer sortOrder;
}
