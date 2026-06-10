package com.acessolivre.model;

import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "denuncias", indexes = {
    @Index(name = "idx_denuncia_tipo_target", columnList = "tipo, target_id"),
    @Index(name = "idx_denuncia_status", columnList = "status"),
    @Index(name = "idx_denuncia_data", columnList = "data_criacao")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoDenuncia tipo;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Column(name = "target_name", length = 255)
    private String targetName;

    @Column(nullable = false, length = 50)
    private String motivo;

    @Column(name = "motivo_label", length = 100)
    private String motivoLabel;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatusDenuncia status = StatusDenuncia.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"password", "role", "enabled", "avaliacoes", "locais"})
    private Usuario usuario;

    @Column(name = "usuario_nome", length = 100)
    private String usuarioNome;

    @CreationTimestamp
    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    @UpdateTimestamp
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @Column(name = "data_resolucao")
    private LocalDateTime dataResolucao;

    @Column(name = "resolvido_por", length = 100)
    private String resolvidoPor;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;
}