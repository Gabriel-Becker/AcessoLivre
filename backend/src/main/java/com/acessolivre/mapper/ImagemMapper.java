package com.acessolivre.mapper;

import com.acessolivre.dto.request.ImagemRequestDTO;
import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.model.Imagem;
import com.acessolivre.model.Local;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ImagemMapper {

    public static Imagem toEntity(ImagemRequestDTO dto, Local local) {
        return Imagem.builder()
                .imagemBase64(dto.getImagemBase64())
                .local(local)
                .build();
    }

    public static ImagemResponseDTO toResponse(Imagem entity) {
        if (entity == null) {
            return null;
        }

        return ImagemResponseDTO.builder()
                .idImagem(entity.getIdImagem())
                .imagemBase64(entity.getImagemBase64())
                .idLocal(entity.getLocal().getIdLocal())
                .build();
    }

    public static void updateEntity(Imagem entity, ImagemRequestDTO dto, Local local) {
        entity.setImagemBase64(dto.getImagemBase64());
        entity.setLocal(local);
    }
}
