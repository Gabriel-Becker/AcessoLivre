package com.acessolivre.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração de cache para dados estáticos
 * Utiliza cache em memória (ConcurrentMapCache) para categorias e tipos de acessibilidade
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Define os nomes dos caches disponíveis
     * - categorias: lista e busca por ID de categorias
     * - tiposAcessibilidade: lista e busca por ID de tipos de acessibilidade
     */
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("categorias", "tiposAcessibilidade");
    }
}
