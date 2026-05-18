package com.acessolivre.service;

import com.acessolivre.dto.request.ImagemUploadDTO;
import com.acessolivre.model.Imagem;
import com.acessolivre.repository.ImagemRepository;
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
    private final LocalService localService;
    
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
        
        // 1. Validar se o local existe
        localService.buscarPorId(uploadDTO.getIdLocal())
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado com ID: " + uploadDTO.getIdLocal()));
        
        try {
            // 2. Salvar arquivo físico e obter caminho relativo
            String caminhoRelativo = storageService.salvarImagem(
                    uploadDTO.getArquivo(),
                    uploadDTO.getIdLocal(),
                    DOMINIO_LOCAIS
            );
            
            // 3. Gerar UUID único para a imagem
            String uuid = UUID.randomUUID().toString();
            
            // 4. Salvar metadados no banco
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
        
        // 1. Deletar arquivo físico
        boolean deletadoDisco = storageService.deletarImagem(imagem.getCaminhoRelativo());
        
        // 2. Deletar registro do banco
        imagemRepository.deleteById(id);
        
        if (!deletadoDisco) {
            log.warn("Imagem deletada do banco, mas arquivo não encontrado no disco: {}", imagem.getCaminhoRelativo());
        }
        
        log.info("Imagem deletada: {}", id);
        return true;
    }
    
    private String getExtensao(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}