// service/ImagemService.java
package com.acessolivre.service;

import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.exception.StorageException;
import com.acessolivre.model.Imagem;
import com.acessolivre.model.Local;
import com.acessolivre.repository.ImagemRepository;
import com.acessolivre.repository.LocalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImagemService {

    private final ImagemRepository imagemRepository;
    private final LocalRepository localRepository;
    private final StorageService storageService;
    private final ImageOptimizerService imageOptimizer;

    /**
     * Upload e salvamento de múltiplas imagens
     */
    @Transactional
    public List<ImagemResponseDTO> uploadImagens(Long localId, List<MultipartFile> files) {
        Local local = localRepository.findById(localId)
            .orElseThrow(() -> new IllegalArgumentException("Local não encontrado: " + localId));

        long totalAtual = imagemRepository.countByLocalIdLocal(localId);
        List<Imagem> imagens = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            
            try {
                // Validação básica
                validateFile(file);
                
                // Otimiza a imagem
                var optimized = imageOptimizer.optimize(file);
                
                // Gera path único
                String extension = getExtension(optimized.contentType());
                String path = String.format("locais/%d/%s.%s", 
                    localId, UUID.randomUUID().toString(), extension);
                
                // Upload para o storage
                String url = storageService.upload(path, optimized.bytes(), optimized.contentType());
                
                // Gera thumbnail se habilitado
                String thumbnailUrl = null;
                String thumbnailPath = null;
                if (imageOptimizer.optimize(file).bytes() != null) {
                    byte[] thumbnailBytes = imageOptimizer.generateThumbnail(optimized.bytes(), optimized.contentType());
                    if (thumbnailBytes != null) {
                        thumbnailPath = String.format("locais/%d/thumb_%s.%s", 
                            localId, UUID.randomUUID().toString(), extension);
                        thumbnailUrl = storageService.upload(thumbnailPath, thumbnailBytes, optimized.contentType());
                    }
                }
                
                // Cria registro no banco
                Imagem imagem = Imagem.builder()
                    .storageKey(path)
                    .urlPublica(url)
                    .thumbnailKey(thumbnailPath)
                    .thumbnailUrl(thumbnailUrl)
                    .tamanhoBytes((long) optimized.bytes().length)
                    .contentType(optimized.contentType())
                    .largura(optimized.width())
                    .altura(optimized.height())
                    .local(local)
                    .ordem((int) (totalAtual + i))
                    .dataCriacao(LocalDateTime.now())
                    .build();
                
                imagens.add(imagemRepository.save(imagem));
                
                log.info("Imagem salva: {} - {}x{}", path, optimized.width(), optimized.height());
                
            } catch (Exception e) {
                log.error("Erro ao processar imagem: {}", file.getOriginalFilename(), e);
                throw new RuntimeException("Erro ao processar imagem: " + file.getOriginalFilename(), e);
            }
        }
        
        return imagens.stream().map(this::toResponseDTO).toList();
    }

    /**
     * Buscar todas imagens de um local
     */
    @Transactional(readOnly = true)
    public List<ImagemResponseDTO> buscarPorLocal(Long localId) {
        return imagemRepository.findByLocalIdLocalOrderByOrdemAsc(localId)
            .stream()
            .map(this::toResponseDTO)
            .toList();
    }

    /**
     * Buscar imagem por ID
     */
    @Transactional(readOnly = true)
    public ImagemResponseDTO buscarPorId(Long id) {
        Imagem imagem = imagemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Imagem não encontrada: " + id));
        return toResponseDTO(imagem);
    }

    /**
     * Deletar imagem específica
     */
    @Transactional
    public void deletarImagem(Long id) {
        Imagem imagem = imagemRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Imagem não encontrada: " + id));
        
        // Deleta do storage
        try {
            storageService.delete(imagem.getStorageKey());
            if (imagem.getThumbnailKey() != null) {
                storageService.delete(imagem.getThumbnailKey());
            }
        } catch (StorageException e) {
            log.error("Erro ao deletar do storage: {}", e.getMessage());
            // Continua mesmo se falhar no storage
        }
        
        // Deleta do banco
        imagemRepository.deleteById(id);
        log.info("Imagem deletada: {}", id);
    }

    /**
     * Deletar todas imagens de um local
     */
    @Transactional
    public void deletarImagensDoLocal(Long localId) {
        List<Imagem> imagens = imagemRepository.findByLocalIdLocalOrderByOrdemAsc(localId);
        
        if (imagens.isEmpty()) return;
        
        // Coleta paths para deletar do storage
        List<String> paths = new ArrayList<>();
        for (Imagem img : imagens) {
            paths.add(img.getStorageKey());
            if (img.getThumbnailKey() != null) {
                paths.add(img.getThumbnailKey());
            }
        }
        
        // Deleta do storage
        try {
            storageService.deleteAll(paths);
        } catch (StorageException e) {
            log.error("Erro ao deletar imagens do storage: {}", e.getMessage());
        }
        
        // Deleta do banco
        imagemRepository.deleteByLocalId(localId);
        log.info("{} imagens deletadas do local: {}", imagens.size(), localId);
    }

    /**
     * Reordenar imagens
     */
    @Transactional
    public void reordenarImagens(Long localId, List<Long> idsEmOrdem) {
        for (int i = 0; i < idsEmOrdem.size(); i++) {
            imagemRepository.updateOrdem(idsEmOrdem.get(i), i);
        }
        log.info("Imagens reordenadas para local: {}", localId);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }
        
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new IllegalArgumentException("Arquivo muito grande. Máximo: 10MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Arquivo não é uma imagem válida");
        }
        
        List<String> allowedTypes = List.of("image/jpeg", "image/png", "image/webp", "image/jpg");
        if (!allowedTypes.contains(contentType)) {
            throw new IllegalArgumentException("Formato não suportado. Use JPEG, PNG ou WEBP");
        }
    }

    private String getExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
    }

    private ImagemResponseDTO toResponseDTO(Imagem imagem) {
        return ImagemResponseDTO.builder()
            .idImagem(imagem.getIdImagem())
            .url(imagem.getUrlPublica())
            .thumbnailUrl(imagem.getThumbnailUrl())
            .tamanhoBytes(imagem.getTamanhoBytes())
            .contentType(imagem.getContentType())
            .largura(imagem.getLargura())
            .altura(imagem.getAltura())
            .ordem(imagem.getOrdem())
            .dataCriacao(imagem.getDataCriacao() != null ? imagem.getDataCriacao().toString() : null)
            .build();
    }
}