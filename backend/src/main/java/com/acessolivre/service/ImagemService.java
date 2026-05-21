package com.acessolivre.service;

import com.acessolivre.dto.request.ImagemUploadDTO;
import com.acessolivre.model.Imagem;
import com.acessolivre.model.Local;
import com.acessolivre.repository.ImagemRepository;
import com.acessolivre.repository.LocalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImagemService {

    private final ImagemRepository imagemRepository;
    private final StorageService storageService;
    private final LocalRepository localRepository; 

    private static final String DOMINIO_LOCAIS = "locais";

    @Transactional(readOnly = true)
    public List<Imagem> listarTodos() {
        return imagemRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Imagem> buscarPorId(Long id) {
        return imagemRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Imagem> buscarPorLocal(Long idLocal) {
        return imagemRepository.findByIdLocalOrderByIdImagemDesc(idLocal);
    }

    @Transactional
    public Imagem salvar(ImagemUploadDTO uploadDTO) {
        log.info("Salvando imagem para local ID: {}", uploadDTO.getIdLocal());
        
        // Usar o repository diretamente para evitar ciclo
        Local local = localRepository.findById(uploadDTO.getIdLocal())
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado com ID: " + uploadDTO.getIdLocal()));
        
        try {
            String caminhoRelativo = storageService.salvarImagem(
                    uploadDTO.getArquivo(),
                    local.getIdLocal(),
                    DOMINIO_LOCAIS
            );
            
            String uuid = UUID.randomUUID().toString();
            
            Imagem imagem = Imagem.builder()
                    .uuid(uuid)
                    .caminhoRelativo(caminhoRelativo)
                    .nomeOriginal(uploadDTO.getArquivo().getOriginalFilename())
                    .idLocal(uploadDTO.getIdLocal())
                    .tamanhoBytes(uploadDTO.getArquivo().getSize())
                    .contentType(uploadDTO.getArquivo().getContentType())
                    .formato(getExtensao(uploadDTO.getArquivo().getOriginalFilename()))
                    .ordem(uploadDTO.getOrdem())
                    .dataUpload(LocalDateTime.now())
                    .build();
            
            Imagem salva = imagemRepository.save(imagem);
            log.info("Imagem salva com sucesso. ID: {}, Caminho: {}", salva.getIdImagem(), caminhoRelativo);
            return salva;
            
        } catch (Exception e) {
            log.error("Erro ao salvar imagem", e);
            throw new RuntimeException("Erro ao processar imagem: " + e.getMessage(), e);
        }
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando imagem ID: {}", id);
        
        Optional<Imagem> imagemOpt = imagemRepository.findById(id);
        if (imagemOpt.isEmpty()) {
            log.warn("Imagem não encontrada: {}", id);
            return false;
        }
        
        Imagem imagem = imagemOpt.get();
        
        boolean deletadoDisco = storageService.deletarImagem(imagem.getCaminhoRelativo());
        imagemRepository.deleteById(id);
        
        if (!deletadoDisco) {
            log.warn("Imagem deletada do banco, mas arquivo não encontrado no disco: {}", imagem.getCaminhoRelativo());
        }
        
        log.info("Imagem deletada: {}", id);
        return true;
    }
    
    @Transactional
    public void deletarImagensPorLocal(Long idLocal) {
        log.info("Deletando todas imagens do local ID: {}", idLocal);
        
        List<Imagem> imagens = imagemRepository.findByIdLocalOrderByIdImagemDesc(idLocal);
        
        for (Imagem imagem : imagens) {
            storageService.deletarImagem(imagem.getCaminhoRelativo());
        }
        
        imagemRepository.deleteAll(imagens);
        log.info("{} imagens deletadas do local ID: {}", imagens.size(), idLocal);
    }
    
    private String getExtensao(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}