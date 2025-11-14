package com.acessolivre.service;

import com.acessolivre.dto.request.ImagemRequestDTO;
import com.acessolivre.mapper.ImagemMapper;
import com.acessolivre.model.Imagem;
import com.acessolivre.model.Local;
import com.acessolivre.repository.ImagemRepository;
import com.acessolivre.repository.LocalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImagemService {

    private final ImagemRepository imagemRepository;
    private final LocalRepository localRepository;

    public List<Imagem> listarTodos() {
        log.info("Listando todas as imagens");
        return imagemRepository.findAll();
    }

    public Optional<Imagem> buscarPorId(Long id) {
        log.info("Buscando imagem por ID: {}", id);
        return imagemRepository.findById(id);
    }

    public List<Imagem> buscarPorLocal(Long idLocal) {
        log.info("Buscando imagens por local ID: {}", idLocal);
        return imagemRepository.findByLocalIdLocal(idLocal);
    }

    @Transactional
    public Imagem salvar(ImagemRequestDTO dto) {
        log.info("Salvando nova imagem para local ID: {}", dto.getIdLocal());

        Local local = localRepository.findById(dto.getIdLocal())
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado"));

        Imagem imagem = ImagemMapper.toEntity(dto, local);
        return imagemRepository.save(imagem);
    }

    @Transactional
    public Optional<Imagem> atualizar(Long id, ImagemRequestDTO dto) {
        log.info("Atualizando imagem ID: {}", id);

        return imagemRepository.findById(id).map(imagem -> {
            Local local = localRepository.findById(dto.getIdLocal())
                    .orElseThrow(() -> new IllegalArgumentException("Local não encontrado"));

            ImagemMapper.updateEntity(imagem, dto, local);
            return imagemRepository.save(imagem);
        });
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando imagem ID: {}", id);
        
        if (!imagemRepository.existsById(id)) {
            return false;
        }

        imagemRepository.deleteById(id);
        return true;
    }
}
