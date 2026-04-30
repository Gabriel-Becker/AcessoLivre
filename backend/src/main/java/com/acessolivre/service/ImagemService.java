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

import java.util.ArrayList;
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
        return imagemRepository.findByLocalIdLocalOrderByOrdemAsc(idLocal);
    }

    @Transactional
    public Imagem salvar(ImagemRequestDTO dto) {
        log.info("Salvando imagem: localId={}", dto.getIdLocal());

        Local local = localRepository.findById(dto.getIdLocal())
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado com ID: " + dto.getIdLocal()));

        // Define a ordem automaticamente se não for fornecida
        if (dto.getOrdem() == null) {
            long totalImagens = imagemRepository.countByLocalIdLocal(local.getIdLocal());
            dto.setOrdem((int) totalImagens);
        }

        Imagem imagem = ImagemMapper.toEntity(dto, local);
        Imagem salva = imagemRepository.save(imagem);
        log.info("Imagem salva: id={}, ordem={}", salva.getIdImagem(), salva.getOrdem());
        return salva;
    }

    /**
     * Salva múltiplas imagens de uma vez
     * @param idLocal ID do local
     * @param dtos Lista de DTOs das imagens
     * @return Lista de imagens salvas
     */
    @Transactional
    public List<Imagem> salvarBatch(Long idLocal, List<ImagemRequestDTO> dtos) {
        log.info("Salvando batch de {} imagens para local ID: {}", dtos.size(), idLocal);

        Local local = localRepository.findById(idLocal)
                .orElseThrow(() -> new IllegalArgumentException("Local não encontrado com ID: " + idLocal));

        long totalImagensAtuais = imagemRepository.countByLocalIdLocal(local.getIdLocal());
        
        List<Imagem> imagens = new ArrayList<>();
        for (int i = 0; i < dtos.size(); i++) {
            ImagemRequestDTO dto = dtos.get(i);
            dto.setIdLocal(idLocal);
            
            // Define a ordem automaticamente
            if (dto.getOrdem() == null) {
                dto.setOrdem((int) (totalImagensAtuais + i));
            }
            
            Imagem imagem = ImagemMapper.toEntity(dto, local);
            imagens.add(imagem);
        }

        List<Imagem> salvas = imagemRepository.saveAll(imagens);
        log.info("{} imagens salvas para local ID: {}", salvas.size(), idLocal);
        return salvas;
    }

    @Transactional
    public Optional<Imagem> atualizar(Long id, ImagemRequestDTO dto) {
        log.info("Atualizando imagem: id={}", id);

        return imagemRepository.findById(id).map(imagem -> {
            if (dto.getIdLocal() != null && !dto.getIdLocal().equals(imagem.getLocal().getIdLocal())) {
                Local novoLocal = localRepository.findById(dto.getIdLocal())
                        .orElseThrow(() -> new IllegalArgumentException("Local não encontrado"));
                imagem.setLocal(novoLocal);
            }
            
            if (dto.getImagemBase64() != null) {
                imagem.setImagemBase64(dto.getImagemBase64());
            }
            if (dto.getOrdem() != null) {
                imagem.setOrdem(dto.getOrdem());
            }
            
            Imagem atualizada = imagemRepository.save(imagem);
            log.info("Imagem atualizada: id={}", atualizada.getIdImagem());
            return atualizada;
        });
    }

    @Transactional
    public boolean deletar(Long id) {
        log.info("Deletando imagem: id={}", id);
        
        if (!imagemRepository.existsById(id)) {
            log.warn("Imagem não encontrada para deletar: id={}", id);
            return false;
        }

        imagemRepository.deleteById(id);
        log.info("Imagem deletada: id={}", id);
        return true;
    }

    /**
     * Deleta todas as imagens de um local
     */
    @Transactional
    public void deletarImagensDoLocal(Long idLocal) {
        log.info("Deletando todas as imagens do local ID: {}", idLocal);
        imagemRepository.deleteByLocalId(idLocal);
    }

    /**
     * Conta quantas imagens um local tem
     */
    public long contarImagensDoLocal(Long idLocal) {
        return imagemRepository.countByLocalIdLocal(idLocal);
    }
}