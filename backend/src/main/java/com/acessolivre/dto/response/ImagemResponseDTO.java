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
    private String urlCompleta;     
    private String caminhoRelativo;   
    private String nomeOriginal;
    private Long idLocal;
    private Long tamanhoBytes;
    private String contentType;
    private Integer ordem;
}