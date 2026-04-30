package com.acessolivre.mapper;

import com.acessolivre.dto.request.ImagemRequestDTO;
import com.acessolivre.dto.response.ImagemResponseDTO;
import com.acessolivre.model.Imagem;
import com.acessolivre.model.Local;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class ImagemMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static Imagem toEntity(ImagemRequestDTO dto, Local local) {
        if (dto == null) {
            return null;
        }
        
        return Imagem.builder()
                .imagemBase64(dto.getImagemBase64())
                .local(local)
                .ordem(dto.getOrdem() != null ? dto.getOrdem() : 0)
                .build();
    }

    public static ImagemResponseDTO toResponse(Imagem entity) {
        if (entity == null) {
            return null;
        }

        return ImagemResponseDTO.builder()
                .idImagem(entity.getIdImagem())
                .imagemBase64(entity.getImagemBase64()) // SEM TRUNCAR - imagem completa
                .idLocal(entity.getLocal() != null ? entity.getLocal().getIdLocal() : null)
                .ordem(entity.getOrdem())
                .dataCriacao(entity.getDataCriacao() != null ? entity.getDataCriacao().format(FORMATTER) : null)
                .build();
    }

    public static void updateEntity(Imagem entity, ImagemRequestDTO dto, Local local) {
        if (dto.getImagemBase64() != null) {
            entity.setImagemBase64(dto.getImagemBase64());
        }
        if (local != null) {
            entity.setLocal(local);
        }
        if (dto.getOrdem() != null) {
            entity.setOrdem(dto.getOrdem());
        }
    }
}