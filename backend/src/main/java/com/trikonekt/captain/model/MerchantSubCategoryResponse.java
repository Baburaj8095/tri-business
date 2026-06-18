package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MerchantSubCategoryResponse {
    private Long id;
    private String name;

    @JsonProperty("category_id")
    private Long categoryId;

    private String audience;

    @JsonProperty("sort_order")
    private int sortOrder;
}
