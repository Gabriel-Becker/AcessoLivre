package com.acessolivre.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
@RequiredArgsConstructor
public class ConfiguracaoWeb implements WebMvcConfigurer {
    
    private final PropriedadesArmazenamento storageProperties;
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapeia /uploads/** para o diretório físico
        String uploadPath = new File(storageProperties.getUploadDir())
                .getAbsolutePath() + File.separator;
        
        registry.addResourceHandler(storageProperties.getStaticPrefix() + "/**")
                .addResourceLocations("file:" + uploadPath)
                .setCachePeriod(3600) // Cache de 1 hora
                .resourceChain(true);
    }
}