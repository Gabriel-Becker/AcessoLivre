package com.acessolivre.mapper;

import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.model.Imagem;
import com.acessolivre.service.StorageService;
import org.springframework.stereotype.Component;

@Component
public class ImagemMapper {
    
    private static StorageService storageService;
    
    public ImagemMapper(StorageService service) {
        storageService = service;
    }
    
    public static ImagemResponseDTO toResponse(Imagem entity) {
        if (entity == null) {
            return null;
        }
        
        String urlCompleta = null;
        if (storageService != null && entity.getCaminhoRelativo() != null) {
            urlCompleta = storageService.construirUrlCompleta(entity.getCaminhoRelativo());
        }
        
        return ImagemResponseDTO.builder()
                .idImagem(entity.getIdImagem())
                .urlCompleta(urlCompleta)
                .caminhoRelativo(entity.getCaminhoRelativo())
                .nomeOriginal(entity.getNomeOriginal())
                .idLocal(entity.getIdLocal())
                .tamanhoBytes(entity.getTamanhoBytes())
                .contentType(entity.getContentType())
                .ordem(entity.getOrdem())
                .build();
    }
}