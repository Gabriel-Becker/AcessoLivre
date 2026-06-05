package com.acessolivre.model;

import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.enums.TipoAcessibilidade;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "local")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Local {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idlocal")
    private Long idLocal;

    @Column(name = "nome", nullable = false, length = 200)
    private String nome;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "imagem", columnDefinition = "TEXT")
    private String imagem;

    @Column(name = "avaliacao_media")
    private Double avaliacaoMedia;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusLocal status;

    @Enumerated(EnumType.STRING)
    @Column(name = "categoria")
    private Categoria categoria;

    @ElementCollection(targetClass = TipoAcessibilidade.class)
    @CollectionTable(name = "local_tipos_acessibilidade", 
                     joinColumns = @JoinColumn(name = "idlocal"))
    @Column(name = "tipo_acessibilidade")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Set<TipoAcessibilidade> tiposAcessibilidade = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario")
    @JsonIgnore
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idendereco")
    private Endereco endereco;

    // ===== NOVO CAMPO DECLARATIVO =====
    @Column(name = "nome_local_principal", length = 200)
    private String nomeLocalPrincipal;

    // ===== AUTO-RELACIONAMENTO (Hierarquia) - Mantido para compatibilidade futura =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idlocal_principal")
    @JsonIgnore
    private Local localPrincipal;

    @OneToMany(mappedBy = "localPrincipal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Local> subLocais = new ArrayList<>();

    @Column(name = "nivel_hierarquia")
    @Builder.Default
    private Integer nivelHierarquia = 0;

    @Column(name = "data_criacao", updatable = false)
    @CreationTimestamp
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    @UpdateTimestamp
    private LocalDateTime dataAtualizacao;

    // ===== RELACIONAMENTO COM IMAGENS =====
    @OneToMany(mappedBy = "local", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Imagem> imagens = new ArrayList<>();

    // ===== MÉTODOS AUXILIARES PARA HIERARQUIA =====
    
    public void adicionarSubLocal(Local subLocal) {
        if (subLocal != null) {
            subLocais.add(subLocal);
            subLocal.setLocalPrincipal(this);
            subLocal.setNivelHierarquia(this.nivelHierarquia + 1);
        }
    }
    
    public void removerSubLocal(Local subLocal) {
        if (subLocal != null) {
            subLocais.remove(subLocal);
            subLocal.setLocalPrincipal(null);
            subLocal.setNivelHierarquia(0);
        }
    }
    
    public boolean isRaiz() {
        return localPrincipal == null;
    }
    
    public boolean isFolha() {
        return subLocais == null || subLocais.isEmpty();
    }
    
    // ===== MÉTODOS AUXILIARES PARA IMAGENS =====
    
    public void addImagem(Imagem imagem) {
        if (imagem != null) {
            imagens.add(imagem);
            imagem.setIdLocal(this.idLocal);
        }
    }
    
    public void removeImagem(Imagem imagem) {
        if (imagem != null) {
            imagens.remove(imagem);
            imagem.setIdLocal(null);
        }
    }
    
    public String getImagemPrincipal() {
        if (imagens != null && !imagens.isEmpty()) {
            Imagem primeira = imagens.stream()
                    .sorted((a, b) -> {
                        int ordemA = a.getOrdem() != null ? a.getOrdem() : 0;
                        int ordemB = b.getOrdem() != null ? b.getOrdem() : 0;
                        return Integer.compare(ordemA, ordemB);
                    })
                    .findFirst()
                    .orElse(null);
            if (primeira != null) {
                return primeira.getCaminhoRelativo();
            }
        }
        return imagem;
    }
    
    public int getTotalImagens() {
        return imagens != null ? imagens.size() : 0;
    }
}