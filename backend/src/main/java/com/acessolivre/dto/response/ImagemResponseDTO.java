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
    private String url;  // URL pública da imagem
    private String thumbnailUrl;  // URL da thumbnail
    private Long tamanhoBytes;
    private String contentType;
    private Integer largura;
    private Integer altura;
    private Integer ordem;
    private String dataCriacao;
}