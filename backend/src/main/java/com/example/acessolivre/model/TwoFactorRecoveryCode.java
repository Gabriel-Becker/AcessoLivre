package com.example.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "two_factor_recovery_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorRecoveryCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank(message = "Código é obrigatório")
    @Size(max = 150, message = "Código deve ter no máximo 150 caracteres")
    @Column(name = "code", nullable = false, length = 150)
    private String code;

    @NotNull(message = "Data de criação é obrigatória")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @NotNull(message = "Data de expiração é obrigatória")
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @NotNull(message = "Status de uso é obrigatório")
    @Column(name = "used", nullable = false)
    @Builder.Default
    private Boolean used = false;

    @NotNull(message = "Usuário é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", referencedColumnName = "idusuario", nullable = false)
    @JsonIgnore
    private Usuario usuario;
}
