package com.acessolivre.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {
    
    /** Diretório raiz onde as imagens serão armazenadas */
    private String uploadDir = "uploads";
    
    /** URL base para acesso público (ex: http://localhost:8080) */
    private String baseUrl = "http://localhost:8080";
    
    /** Prefixo da URL para acesso estático */
    private String staticPrefix = "/uploads";
    
    /** Tamanho máximo do arquivo em bytes (5MB default) */
    private long maxFileSize = 5 * 1024 * 1024;
    
    /** Formatos permitidos */
    private String[] allowedFormats = {"jpg", "jpeg", "png", "webp"};
}