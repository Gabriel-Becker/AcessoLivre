package com.acessolivre.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImagemResponseDTO {

    private Long idImagem;
    private String imagemBase64;
    private Long idLocal;
    private Integer ordem;
    private String dataCriacao;
}