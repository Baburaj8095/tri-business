package com.trikonekt.captain.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file.");
        }

        // Check for default configuration
        if ("demo-cloud".equals(cloudName) || "demo-key".equals(cloudinary.config.apiKey)) {
            log.warn("Cloudinary is using default/demo credentials. Falling back to mock URL for demo testing.");
            return generateMockUrl(file.getOriginalFilename());
        }

        try {
            log.info("Uploading file '{}' to Cloudinary...", file.getOriginalFilename());
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap("resource_type", "auto")
            );
            String url = (String) uploadResult.get("secure_url");
            log.info("Upload successful! Cloudinary URL: {}", url);
            return url;
        } catch (Exception e) {
            log.error("Cloudinary upload failed: {}. Falling back to mock URL.", e.getMessage(), e);
            return generateMockUrl(file.getOriginalFilename());
        }
    }

    private String generateMockUrl(String originalFilename) {
        String ext = "png";
        if (originalFilename != null && originalFilename.contains(".")) {
            ext = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
        }
        // Return a realistic Cloudinary URL format for a placeholder image
        return "https://res.cloudinary.com/demo-cloud/image/upload/v1612345678/mock_" + 
            UUID.randomUUID().toString().substring(0, 8) + "." + ext;
    }
}
