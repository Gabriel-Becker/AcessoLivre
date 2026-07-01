package com.acessolivre.service;

import com.acessolivre.config.PropriedadesArmazenamento;
import com.acessolivre.model.Local;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.LocalRepository;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArmazenamentoService {
    
    private final PropriedadesArmazenamento storageProperties;
    private final OtimizadorImagemService imageOptimizerService;
    private final UsuarioRepository usuarioRepository;
    private final LocalRepository localRepository;
    
    private static final String DIR_USUARIOS = "usuarios";
    private static final String DIR_LOCAIS = "locais";
    
    public String salvarImagem(MultipartFile arquivo, Long idLocal, Long idUsuario) throws IOException {
 
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + idUsuario));
        
        Local local = localRepository.findById(idLocal)
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado: " + idLocal));
        
        validarArquivo(arquivo);
        
        String extensao = getExtensao(arquivo.getOriginalFilename());
        String uuid = UUID.randomUUID().toString();
        String nomeArquivo = uuid + "." + extensao;
        
        String nomeUsuarioSanitizado = sanitizarNome(usuario.getNome());
        String nomeLocalSanitizado = sanitizarNome(local.getNome());
        
        String subDir = DIR_USUARIOS + "/" + idUsuario + "_" + nomeUsuarioSanitizado 
                + "/" + DIR_LOCAIS + "/" + idLocal + "_" + nomeLocalSanitizado;
        
        Path diretorio = Paths.get(storageProperties.getUploadDir(), subDir);

        if (!Files.exists(diretorio)) {
            Files.createDirectories(diretorio);
            log.info(" Diretório criado: {}", diretorio.toAbsolutePath());
        }
        
        byte[] imagemBytes;
        try {
            imagemBytes = imageOptimizerService.otimizarImagem(arquivo);
            log.info("Imagem otimizada: {} bytes", imagemBytes.length);
        } catch (Exception e) {
            log.warn(" Erro na otimização, usando original: {}", e.getMessage());
            imagemBytes = arquivo.getBytes();
        }

        Path caminhoCompleto = diretorio.resolve(nomeArquivo);
        Files.write(caminhoCompleto, imagemBytes);
        
 
        String caminhoRelativo = storageProperties.getStaticPrefix() + "/" + subDir + "/" + nomeArquivo;
        
        log.info(" Imagem salva: {} ({} KB)", caminhoRelativo, imagemBytes.length / 1024);
        return caminhoRelativo;
    }
    
    public String salvarImagem(MultipartFile arquivo, Long idLocal, String dominio) throws IOException {
        Local local = localRepository.findById(idLocal)
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado: " + idLocal));
        
        return salvarImagem(arquivo, idLocal, local.getUsuario().getIdUsuario());
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

    public boolean deletarImagensDoLocal(Local local, Usuario usuario) {
        try {
            String nomeUsuarioSanitizado = sanitizarNome(usuario.getNome());
            String nomeLocalSanitizado = sanitizarNome(local.getNome());
            
            String subDir = DIR_USUARIOS + "/" + usuario.getIdUsuario() + "_" + nomeUsuarioSanitizado 
                    + "/" + DIR_LOCAIS + "/" + local.getIdLocal() + "_" + nomeLocalSanitizado;
            
            Path diretorio = Paths.get(storageProperties.getUploadDir(), subDir);
            
            if (Files.exists(diretorio)) {
                Files.walk(diretorio)
                    .sorted((a, b) -> -a.compareTo(b))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException e) {
                            log.error("Erro ao deletar arquivo: {}", path, e);
                        }
                    });
                log.info(" Pasta do local deletada: {}", diretorio);
                return true;
            }
            return false;
        } catch (IOException e) {
            log.error("Erro ao deletar imagens do local: {}", local.getIdLocal(), e);
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

    private String sanitizarNome(String nome) {
        if (nome == null) return "sem_nome";
        
        String normalized = Normalizer.normalize(nome, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");

        String sanitizado = normalized
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
        
        if (sanitizado.length() > 50) {
            sanitizado = sanitizado.substring(0, 50);
        }
        
        return sanitizado.isEmpty() ? "sem_nome" : sanitizado;
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
}