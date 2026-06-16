package com.trikonekt.captain.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SponsorInfo {
    private String sponsorId;
    private String sponsorName;
    private String category;
    private boolean valid;
    private String pincode;
    private String state;
    private String district;
}
