package com.trikonekt.captain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MerchantCategoryCreateRequest {
    private String name;
    private String audience;
    private Integer sortOrder;

    @JsonProperty("icon_name")
    private String iconName;

    @JsonProperty("icon_url")
    private String iconUrl;
}