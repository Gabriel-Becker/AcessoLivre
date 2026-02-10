package com.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "local", indexes = {
    @Index(name = "idx_local_nome", columnList = "nome"),
    @Index(name = "idx_local_categoria", columnList = "idcategoria")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Local {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idlocal")
    private Long idLocal;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    private String nome;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 300, message = "Descrição deve ter no máximo 300 caracteres")
    private String descricao;

    @Column(name = "avaliacao_media")
    private Double avaliacaoMedia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idcategoria", referencedColumnName = "idcategoria")
    @NotNull(message = "Categoria é obrigatória")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idtipo_acessibilidade", referencedColumnName = "idtipo_acessibilidade")
    @NotNull(message = "Tipo de acessibilidade é obrigatório")
    private TipoAcessibilidade tipoAcessibilidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario")
    @NotNull(message = "Usuário é obrigatório")
    @JsonIgnore
    private Usuario usuario;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "idendereco", referencedColumnName = "idendereco")
    @NotNull(message = "Endereço é obrigatório")
    private Endereco endereco;
}