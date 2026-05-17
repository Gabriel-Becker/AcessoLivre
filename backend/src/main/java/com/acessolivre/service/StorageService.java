// service/StorageService.java
package com.acessolivre.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class StorageService {
    
    @Value("${app.uploads.path:/uploads}")
    private String uploadPath;
    
    @Value("${app.uploads.url-pattern:/uploads/**}")
    private String urlPattern;
    
    private final ImageOptimizerService imageOptimizerService;
    
    public StorageService(ImageOptimizerService imageOptimizerService) {
        this.imageOptimizerService = imageOptimizerService;
    }
    
    /**
     * Salva uma imagem otimizada no disco
     * @param arquivo MultipartFile da imagem
     * @param idLocal ID do local para criar subpasta
     * @return URL pública da imagem
     */
    public String salvarImagem(MultipartFile arquivo, Long idLocal) {
        try {
            // 1. Validar arquivo
            validarArquivo(arquivo);
            
            // 2. Criar subpasta /uploads/locais/{idLocal}/
            Path diretorioLocal = Paths.get(uploadPath, "locais", idLocal.toString());
            Files.createDirectories(diretorioLocal);
            
            // 3. Gerar nome único para o arquivo
            String extensao = obterExtensao(arquivo.getOriginalFilename());
            String nomeArquivo = UUID.randomUUID().toString() + extensao;
            
            // 4. Caminho completo físico
            Path caminhoFisico = diretorioLocal.resolve(nomeArquivo);
            
            // 5. Otimizar e salvar imagem (já em webp se configurado)
            byte[] imagemOtimizada = imageOptimizerService.otimizarImagem(arquivo);
            Files.write(caminhoFisico, imagemOtimizada);
            
            // 6. Construir URL pública
            String urlPublica = construirUrlPublica(idLocal, nomeArquivo);
            
            log.info("Imagem salva com sucesso: {} -> {}", caminhoFisico, urlPublica);
            return urlPublica;
            
        } catch (IOException e) {
            log.error("Erro ao salvar imagem", e);
            throw new RuntimeException("Erro ao salvar imagem: " + e.getMessage(), e);
        }
    }
    
    /**
     * Deleta uma imagem do disco
     * @param url URL da imagem (completa ou relativa)
     * @return true se deletado com sucesso
     */
    public boolean deletarImagem(String url) {
        try {
            // Converter URL para caminho físico
            Path caminhoFisico = converterUrlParaCaminho(url);
            
            if (Files.exists(caminhoFisico)) {
                Files.delete(caminhoFisico);
                log.info("Imagem deletada do disco: {}", caminhoFisico);
                return true;
            } else {
                log.warn("Arquivo não encontrado para deletar: {}", caminhoFisico);
                return false;
            }
        } catch (IOException e) {
            log.error("Erro ao deletar imagem: {}", url, e);
            return false;
        }
    }
    
    /**
     * Constrói a URL pública baseada no caminho
     */
    private String construirUrlPublica(Long idLocal, String nomeArquivo) {
        // Exemplo: /uploads/locais/11/8f3a9c.webp
        return String.format("/uploads/locais/%d/%s", idLocal, nomeArquivo);
    }
    
    /**
     * Converte URL pública em caminho físico
     */
    private Path converterUrlParaCaminho(String url) {
        // Remove o prefixo da URL se necessário
        String caminhoRelativo = url;
        if (url.startsWith("http")) {
            // Se for URL completa, extrair o path
            // Normalmente você guardaria apenas o path relativo no banco
            caminhoRelativo = url.substring(url.indexOf("/uploads"));
        }
        
        // Remove o primeiro "/" para concatenar
        if (caminhoRelativo.startsWith("/")) {
            caminhoRelativo = caminhoRelativo.substring(1);
        }
        
        return Paths.get(uploadPath, caminhoRelativo);
    }
    
    /**
     * Validações básicas do arquivo
     */
    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }
        
        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Arquivo não é uma imagem válida");
        }
        
        // Verificar tamanho máximo (5MB)
        if (arquivo.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Imagem excede tamanho máximo de 5MB");
        }
    }
    
    /**
     * Obtém extensão do arquivo
     */
    private String obterExtensao(String nomeArquivo) {
        if (nomeArquivo == null || !nomeArquivo.contains(".")) {
            return ".webp"; // Default
        }
        return nomeArquivo.substring(nomeArquivo.lastIndexOf("."));
    }
}
