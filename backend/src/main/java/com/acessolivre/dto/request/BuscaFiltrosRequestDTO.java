package com.acessolivre.dto.request;

import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.TipoAcessibilidade;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * DTO para filtros de busca de locais
 * 
 * @author AcessoLivre Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuscaFiltrosRequestDTO {
    
    private String searchText;
    private Set<Categoria> categorias;
    private Set<TipoAcessibilidade> recursos;
    private Double notaMinima;
}