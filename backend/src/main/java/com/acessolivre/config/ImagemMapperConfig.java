package com.acessolivre.config;

import com.acessolivre.mapper.ImagemMapper;
import com.acessolivre.service.StorageService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ImagemMapperConfig {
    
    private final StorageService storageService;
    
    @PostConstruct
    public void init() {
        // Força a inicialização do ImagemMapper com o StorageService
        // O @Component já faz a injeção via setter
        System.out.println("✅ ImagemMapperConfig carregado");
    }
}