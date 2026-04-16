package com.acessolivre.dto.response;

import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.StatusLocal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalResponseDTO {

    private Long idLocal;
    private String nome;
    private String descricao;
    private String imagem;
    private Double avaliacaoMedia;
    private StatusLocal status;
    private Categoria categoria;
    private TipoAcessibilidadeResponseDTO tipoAcessibilidade;
    private Long idUsuario;
    private String nomeUsuario;
    private EnderecoResponseDTO endereco;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    
    // Informações do auto-relacionamento
    private Long idLocalPrincipal;
    private String nomeLocalPrincipal;
    private List<LocalResumoResponseDTO> subLocais;
    private Integer nivelHierarquia;
    private Boolean isRaiz;
    private Boolean isFolha;
}

