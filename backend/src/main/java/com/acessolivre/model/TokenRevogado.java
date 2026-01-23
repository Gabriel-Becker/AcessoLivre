package com.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "token_revogado", indexes = {
    @Index(name = "idx_token_revogado_token", columnList = "token")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenRevogado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotNull(message = "Data de revogação é obrigatória")
    @Column(name = "data_revogacao", nullable = false)
    private LocalDateTime dataRevogacao;

    @NotNull(message = "Data de expiração é obrigatória")
    @Column(name = "data_expiracao", nullable = false)
    private LocalDateTime expiracao;

    @NotBlank(message = "Token é obrigatório")
    @Column(name = "token", nullable = false)
    private String token;

    @NotNull(message = "Usuário é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario", nullable = false)
    @JsonIgnore
    private Usuario usuario;
}
