package com.acessolivre.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TipoAcessibilidadeResponseDTO {

    private Long idTipoAcessibilidade;
    private String nome;
    private String descricao;
    private String iconeUrl;
}