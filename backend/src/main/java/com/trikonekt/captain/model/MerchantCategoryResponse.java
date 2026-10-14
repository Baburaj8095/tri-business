package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MerchantCategoryResponse {
    private Long id;
    private String name;
    private String audience;

    @JsonProperty("sort_order")
    private int sortOrder;

    @JsonProperty("icon_name")
    private String iconName;

    @JsonProperty("icon_url")
    private String iconUrl;
}
