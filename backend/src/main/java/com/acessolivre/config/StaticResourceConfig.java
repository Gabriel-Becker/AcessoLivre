package com.acessolivre.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
    
    @Value("${app.uploads.path:/uploads}")
    private String uploadPath;
    
    @Value("${app.uploads.url-pattern:/uploads/**}")
    private String urlPattern;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Garantir que o path termine com barra
        String normalizedPath = uploadPath.endsWith("/") ? uploadPath : uploadPath + "/";
        
        registry.addResourceHandler(urlPattern)
                .addResourceLocations("file:" + normalizedPath)
                .setCachePeriod(3600); 
        
        // Log para debug
        System.out.println("Static resources configured:");
        System.out.println("  - Handler: " + urlPattern);
        System.out.println("  - Location: file:" + normalizedPath);
    }
}