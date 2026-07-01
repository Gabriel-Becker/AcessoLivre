package com.acessolivre.config;

import com.acessolivre.mapper.ImagemMapper;
import com.acessolivre.service.ArmazenamentoService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class ConfiguracaoMapperImagem {
    
    private final ArmazenamentoService storageService;
    
    @PostConstruct
    public void init() {
        // Força a inicialização do ImagemMapper com o StorageService
        // O @Component já faz a injeção via setter
        System.out.println("✅ ImagemMapperConfig carregado");
    }
}