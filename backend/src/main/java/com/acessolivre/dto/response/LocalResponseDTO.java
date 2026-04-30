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
    private String imagem;  // Para compatibilidade (primeira imagem)
    private Double avaliacaoMedia;
    private StatusLocal status;
    private Categoria categoria;
    private Set<TipoAcessibilidade> tiposAcessibilidade;
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
    
    // ===== NOVOS CAMPOS PARA MÚLTIPLAS IMAGENS =====
    private List<ImagemResponseDTO> imagens;      // Lista completa de imagens
    private String imagemPrincipal;                // Primeira imagem (thumbnail)
    private Integer totalImagens;                  // Quantidade total de imagens
}