package com.acessolivre.dto.response;

import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.enums.TipoAcessibilidade;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalResponseDTO {

    private Long idLocal;
    private String nome;
    private String descricao;
    
    // ✅ Campo padronizado para URL da primeira imagem
    private String imagemUrl;  
    
    private Double avaliacaoMedia;
    private StatusLocal status;
    private Categoria categoria;
    private Set<TipoAcessibilidade> tiposAcessibilidade;
    private Long idUsuario;
    private String nomeUsuario;
    private EnderecoResponseDTO endereco;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    
    // ✅ NOVO CAMPO - Nome do local principal (declarativo)
    private String nomeLocalPrincipal;
    
    // Informações do auto-relacionamento
    private Long idLocalPrincipal;
    private List<LocalResumoResponseDTO> subLocais;
    private Integer nivelHierarquia;
    private Boolean isRaiz;
    private Boolean isFolha;
    
    private List<ImagemResponseDTO> imagens;
    private Integer totalImagens;
}