package com.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.enums.TipoAcessibilidade;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "local", indexes = {
    @Index(name = "idx_local_nome", columnList = "nome"),
    @Index(name = "idx_local_categoria", columnList = "idcategoria"),
    @Index(name = "idx_local_principal", columnList = "idlocal_principal"),
    @Index(name = "idx_local_status", columnList = "status")
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
    @Column(name = "nome", length = 150, nullable = false)
    private String nome;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 350, message = "Descrição deve ter no máximo 350 caracteres")
    @Column(name = "descricao", length = 350, nullable = false)
    private String descricao;

    @Column(name = "avaliacao_media")
    private Double avaliacaoMedia;
    
    @Size(max = 120, message = "Nome da imagem deve ter no máximo 120 caracteres")
    @Column(name = "imagem", length = 120)
    private String imagem;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private StatusLocal status = StatusLocal.EM_ANALISE;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria", nullable = false)
    @NotNull(message = "Categoria é obrigatória")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario", nullable = false)
    @NotNull(message = "Usuário é obrigatório")
    @JsonIgnore
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idendereco", referencedColumnName = "idendereco")
    @NotNull(message = "Endereço é obrigatório")
    private Endereco endereco;
    
    // AUTO-RELACIONAMENTO (Self-join)
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idlocal_principal")
    @JsonIgnore
    private Local localPrincipal;
    
    @OneToMany(mappedBy = "localPrincipal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Local> subLocais = new ArrayList<>();
    
    @CreationTimestamp
    @Column(name = "data_criacao", updatable = false)
    private LocalDateTime dataCriacao;
    
    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    // Métodos utilitários
    public void adicionarSubLocal(Local subLocal) {
        if (subLocais == null) {
            subLocais = new ArrayList<>();
        }
        subLocais.add(subLocal);
        subLocal.setLocalPrincipal(this);
    }
    
    public void removerSubLocal(Local subLocal) {
        if (subLocais != null) {
            subLocais.remove(subLocal);
            subLocal.setLocalPrincipal(null);
        }
    }
    
    public boolean isRaiz() {
        return localPrincipal == null;
    }
    
    public boolean isFolha() {
        return subLocais == null || subLocais.isEmpty();
    }
    
    public int getNivelHierarquia() {
        int nivel = 0;
        Local atual = this;
        while (atual.getLocalPrincipal() != null) {
            nivel++;
            atual = atual.getLocalPrincipal();
        }
        return nivel;
    }
}