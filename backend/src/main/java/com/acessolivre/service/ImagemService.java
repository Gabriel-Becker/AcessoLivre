// service/ImagemService.java
package com.acessolivre.service;

import com.acessolivre.dto.request.ImagemRequestDTO;
import com.acessolivre.mapper.ImagemMapper;
import com.acessolivre.model.Imagem;
import com.acessolivre.repository.ImagemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImagemService {

    private final ImagemRepository imagemRepository;
    private final StorageService storageService;
    private final LocalService localService; // para validar se local existe

    @Transactional(readOnly = true)
    public List<Imagem> listarTodos() {
        log.info("Listando todas as imagens");
        return imagemRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Imagem> buscarPorId(Long id) {
        log.info("Buscando imagem por ID: {}", id);
        return imagemRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Imagem> buscarPorLocal(Long idLocal) {
        log.info("Buscando imagens por local ID: {}", idLocal);
        return imagemRepository.findByIdLocalOrderByIdImagemDesc(idLocal);
    }

    @Transactional
    public Imagem salvar(ImagemRequestDTO requestDTO) {
        log.info("Salvando imagem para local ID: {}", requestDTO.getIdLocal());
        
        // 1. Validar se o local existe
        localService.buscarPorId(requestDTO.getIdLocal())
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado"));
        
        // 2. Salvar arquivo no disco
        MultipartFile arquivo = requestDTO.getArquivo();
        String url = storageService.salvarImagem(arquivo, requestDTO.getIdLocal());
        
        // 3. Salvar referência no banco
        Imagem imagem = ImagemMapper.toEntity(
            url,
            requestDTO.getIdLocal(),
            arquivo.getOriginalFilename(),
            arquivo.getContentType(),
            arquivo.getSize()
        );
        
        Imagem salva = imagemRepository.save(imagem);
        log.info("Imagem salva com sucesso. ID: {}", salva.getIdImagem());
        return salva;
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
        boolean deletadoDisco = storageService.deletarImagem(imagem.getUrl());
        
        // 2. Deletar registro do banco
        imagemRepository.deleteById(id);
        
        if (!deletadoDisco) {
            log.warn("Imagem deletada do banco, mas arquivo não encontrado no disco: {}", imagem.getUrl());
        }
        
        log.info("Imagem deletada: {}", id);
        return true;
    }
}