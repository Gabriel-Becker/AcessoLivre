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
import java.nio.file.StandardCopyOption;
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
    
    /**
     * Salva a imagem otimizada no disco e retorna o caminho relativo
     */
    public String salvarImagem(MultipartFile arquivo, Long idLocal, String dominio) throws IOException {
        // 1. Validar arquivo
        validarArquivo(arquivo);
        
        // 2. Gerar nome único com UUID
        String extensao = getExtensao(arquivo.getOriginalFilename());
        String uuid = UUID.randomUUID().toString();
        String nomeArquivo = uuid + "." + extensao;
        
        // 3. Construir caminho: /uploads/locais/{idLocal}/{uuid}.jpg
        String subDir = determinarSubDiretorio(dominio, idLocal);
        Path diretorio = Paths.get(storageProperties.getUploadDir(), subDir);
        
        // 4. Criar diretório se não existir
        if (!Files.exists(diretorio)) {
            Files.createDirectories(diretorio);
            log.info("Diretório criado: {}", diretorio);
        }
        
        // 5. Otimizar a imagem (redimensionar + comprimir)
        byte[] imagemOtimizada = imageOptimizerService.otimizarImagem(arquivo);
        
        // 6. Salvar arquivo no disco
        Path caminhoCompleto = diretorio.resolve(nomeArquivo);
        Files.write(caminhoCompleto, imagemOtimizada);
        
        // 7. Retornar caminho relativo (para salvar no banco)
        String caminhoRelativo = storageProperties.getStaticPrefix() + "/" + subDir + "/" + nomeArquivo;
        
        log.info("Imagem salva: {} ({})", caminhoRelativo, arquivo.getSize() / 1024 + "KB");
        return caminhoRelativo;
    }
    
    /**
     * Deleta a imagem do disco
     */
    public boolean deletarImagem(String caminhoRelativo) {
        try {
            // Converte caminho relativo para absoluto
            // /uploads/locais/1/image.jpg -> uploads/locais/1/image.jpg
            String caminhoSemPrefix = caminhoRelativo.replace(storageProperties.getStaticPrefix() + "/", "");
            Path caminhoAbsoluto = Paths.get(storageProperties.getUploadDir(), caminhoSemPrefix);
            
            return Files.deleteIfExists(caminhoAbsoluto);
        } catch (IOException e) {
            log.error("Erro ao deletar imagem: {}", caminhoRelativo, e);
            return false;
        }
    }
    
    /**
     * Constrói URL completa para acesso
     */
    public String construirUrlCompleta(String caminhoRelativo) {
        if (caminhoRelativo == null) return null;
        return storageProperties.getBaseUrl() + caminhoRelativo;
    }
    
    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }
        
        if (arquivo.getSize() > storageProperties.getMaxFileSize()) {
            throw new IllegalArgumentException("Arquivo excede tamanho máximo de " + 
                    storageProperties.getMaxFileSize() / (1024 * 1024) + "MB");
        }
        
        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Formato não suportado. Envie apenas imagens.");
        }
    }
    
    private String getExtensao(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg"; // default
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