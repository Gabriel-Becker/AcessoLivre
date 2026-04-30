package com.acessolivre.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImagemRequestDTO {

    @NotBlank(message = "Imagem base64 é obrigatória")
    private String imagemBase64;

    @NotNull(message = "ID do local é obrigatório")
    private Long idLocal;
    
    private Integer ordem;
}