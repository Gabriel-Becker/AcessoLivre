package com.acessolivre.dto.response;

import com.acessolivre.enums.StatusLocal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class LocalResumoResponseDTO {
    private Long idLocal;
    private String nome;
    private String imagem;
    private Double avaliacaoMedia;
    private StatusLocal status;
}
