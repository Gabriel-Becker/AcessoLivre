package com.acessolivre.mapper;

import com.acessolivre.dto.request.ImagemRequestDTO;
import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.model.Imagem;
import org.springframework.stereotype.Component;

@Component
public class ImagemMapper {
    
    public static Imagem toEntity(String url, Long idLocal, String nomeOriginal, String contentType, Long tamanho) {
        return Imagem.builder()
                .url(url)
                .idLocal(idLocal)
                .nomeOriginal(nomeOriginal)
                .contentType(contentType)
                .tamanhoBytes(tamanho)
                .build();
    }
    
    public static ImagemResponseDTO toResponse(Imagem entity) {
        if (entity == null) {
            return null;
        }
        
        return ImagemResponseDTO.builder()
                .idImagem(entity.getIdImagem())
                .url(entity.getUrl())
                .idLocal(entity.getIdLocal())
                .build();
    }
}