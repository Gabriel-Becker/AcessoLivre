package com.acessolivre.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "avaliacao",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_avaliacao_usuario_local", columnNames = {"idusuario", "idlocal"})
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idavaliacao")
    private Long idAvaliacao;

    @NotNull(message = "Nota de acessibilidade visual é obrigatória")
    @Min(value = 1, message = "Nota mínima é 1")
    @Max(value = 5, message = "Nota máxima é 5")
    @Column(name = "nota_acessibilidade_visual")
    private Integer notaAcessibilidadeVisual;

    @NotNull(message = "Nota de acessibilidade motora é obrigatória")
    @Min(value = 1, message = "Nota mínima é 1")
    @Max(value = 5, message = "Nota máxima é 5")
    @Column(name = "nota_acessibilidade_motora")
    private Integer notaAcessibilidadeMotora;

    @NotNull(message = "Nota de acessibilidade auditiva é obrigatória")
    @Min(value = 1, message = "Nota mínima é 1")
    @Max(value = 5, message = "Nota máxima é 5")
    @Column(name = "nota_acessibilidade_auditiva")
    private Integer notaAcessibilidadeAuditiva;

    @Column(name = "nota_geral")
    private Double notaGeral;

    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario; // Opcional

    @NotNull
    @Builder.Default
    private Boolean moderado = Boolean.FALSE; // Comentários iniciam não moderados

    @CreationTimestamp
    @Column(name = "data_avaliacao")
    private LocalDateTime dataAvaliacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario")
    @NotNull(message = "Usuário é obrigatório")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idlocal", referencedColumnName = "idlocal")
    @NotNull(message = "Local é obrigatório")
    private Local local;
}
