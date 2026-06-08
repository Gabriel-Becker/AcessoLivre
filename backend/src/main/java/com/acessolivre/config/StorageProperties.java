package com.acessolivre.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {
    private String uploadDir = "uploads";
    private String baseUrl = "http://localhost:8080";
    private String staticPrefix = "/uploads";
    private long maxFileSize = 5242880;
    private String[] allowedFormats = {"jpg", "jpeg", "png", "webp"};
}