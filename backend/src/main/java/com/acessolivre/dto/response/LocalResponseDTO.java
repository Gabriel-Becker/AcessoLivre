package com.acessolivre.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalResponseDTO {

    private Long idLocal;
    private String nome;
    private String descricao;
    private Double avaliacaoMedia;
    private CategoriaResponseDTO categoria;
    private TipoAcessibilidadeResponseDTO tipoAcessibilidade;
    private Long idUsuario;
    private EnderecoResponseDTO endereco;
}