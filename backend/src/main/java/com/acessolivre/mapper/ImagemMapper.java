package com.acessolivre.mapper;

import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.model.Imagem;
import com.acessolivre.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ImagemMapper {
    
    private final StorageService storageService;
    
    public ImagemResponseDTO toResponse(Imagem entity) {
        if (entity == null) {
            return null;
        }
        
        return ImagemResponseDTO.builder()
                .idImagem(entity.getIdImagem())
                .urlCompleta(storageService.construirUrlCompleta(entity.getCaminhoRelativo()))
                .caminhoRelativo(entity.getCaminhoRelativo())
                .nomeOriginal(entity.getNomeOriginal())
                .idLocal(entity.getIdLocal())
                .tamanhoBytes(entity.getTamanhoBytes())
                .contentType(entity.getContentType())
                .ordem(entity.getOrdem())
                .build();
    }
}