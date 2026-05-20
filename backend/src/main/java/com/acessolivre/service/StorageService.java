package com.acessolivre.service;

import com.acessolivre.config.StorageProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {
    
    private final StorageProperties storageProperties;
    private final ImageOptimizerService imageOptimizerService;
    
    private static final String DIR_LOCAIS = "locais";
    private static final String DIR_USUARIOS = "usuarios";
    private static final String DIR_AVALIACOES = "avaliacoes";
    
    public String salvarImagem(MultipartFile arquivo, Long idLocal, String dominio) throws IOException {
        log.info("💾 Salvando imagem para local: {}", idLocal);
        
        // 1. Validar arquivo
        validarArquivo(arquivo);
        
        // 2. Gerar nome único com UUID (tratando nome original null)
        String originalFilename = arquivo.getOriginalFilename();
        String extensao = getExtensao(originalFilename);
        String uuid = UUID.randomUUID().toString();
        String nomeArquivo = uuid + "." + extensao;
        
        log.info("Arquivo original: {}, extensão: {}, nome gerado: {}", originalFilename, extensao, nomeArquivo);
        
        // 3. Construir caminho
        String subDir = determinarSubDiretorio(dominio, idLocal);
        Path diretorio = Paths.get(storageProperties.getUploadDir(), subDir);
        
        // 4. Criar diretório se não existir
        if (!Files.exists(diretorio)) {
            Files.createDirectories(diretorio);
            log.info("📁 Diretório criado: {}", diretorio.toAbsolutePath());
        }
        
        // 5. Otimizar a imagem (ou usar original em caso de erro)
        byte[] imagemBytes;
        try {
            imagemBytes = imageOptimizerService.otimizarImagem(arquivo);
            log.info("✅ Imagem otimizada: {} bytes", imagemBytes.length);
        } catch (Exception e) {
            log.warn("⚠️ Erro na otimização, usando arquivo original: {}", e.getMessage());
            imagemBytes = arquivo.getBytes();
        }
        
        // 6. Salvar arquivo no disco
        Path caminhoCompleto = diretorio.resolve(nomeArquivo);
        Files.write(caminhoCompleto, imagemBytes);
        
        // 7. Retornar caminho relativo
        String caminhoRelativo = storageProperties.getStaticPrefix() + "/" + subDir + "/" + nomeArquivo;
        
        log.info("✅ Imagem salva: {} ({} KB)", caminhoRelativo, imagemBytes.length / 1024);
        return caminhoRelativo;
    }
    
    public boolean deletarImagem(String caminhoRelativo) {
        try {
            String caminhoSemPrefix = caminhoRelativo.replace(storageProperties.getStaticPrefix() + "/", "");
            Path caminhoAbsoluto = Paths.get(storageProperties.getUploadDir(), caminhoSemPrefix);
            return Files.deleteIfExists(caminhoAbsoluto);
        } catch (IOException e) {
            log.error("Erro ao deletar imagem: {}", caminhoRelativo, e);
            return false;
        }
    }
    
    public String construirUrlCompleta(String caminhoRelativo) {
        if (caminhoRelativo == null) return null;
        if (caminhoRelativo.startsWith("http")) return caminhoRelativo;
        
        String baseUrl = storageProperties.getBaseUrl();
        if (baseUrl == null) {
            baseUrl = "http://localhost:8080";
        }
        
        if (baseUrl.endsWith("/") && caminhoRelativo.startsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        
        return baseUrl + caminhoRelativo;
    }
    
    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }
        
        log.info("Validando arquivo: size={}, contentType={}, originalFilename={}", 
            arquivo.getSize(), arquivo.getContentType(), arquivo.getOriginalFilename());
        
        if (arquivo.getSize() > storageProperties.getMaxFileSize()) {
            throw new IllegalArgumentException("Arquivo excede tamanho máximo de " + 
                    storageProperties.getMaxFileSize() / (1024 * 1024) + "MB");
        }
        
        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.warn("ContentType inválido: {}", contentType);
            throw new IllegalArgumentException("Formato não suportado. Envie apenas imagens.");
        }
    }
    
    private String getExtensao(String filename) {
        if (filename == null || filename.isEmpty() || !filename.contains(".")) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
    
    private String determinarSubDiretorio(String dominio, Long idLocal) {
        return switch (dominio) {
            case "locais" -> DIR_LOCAIS + "/" + idLocal;
            case "usuarios" -> DIR_USUARIOS;
            case "avaliacoes" -> DIR_AVALIACOES;
            default -> DIR_LOCAIS + "/" + idLocal;
        };
    }
}