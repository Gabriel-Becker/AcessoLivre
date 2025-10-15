package com.acessolivre.model;

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
    @Size(min = 6, max = 20, message = "Código deve ter entre 6 e 20 caracteres")
    @Column(name = "codigo")
    private String codigo;

    @NotNull(message = "Data de criação é obrigatória")
    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @NotNull(message = "Data de expiração é obrigatória")
    @Column(name = "data_expiracao")
    private LocalDateTime dataExpiracao;

    @NotNull(message = "Status de utilização é obrigatório")
    @Column(name = "utilizado")
    @Builder.Default
    private Boolean utilizado = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario")
    @JsonIgnore
    private Usuario usuario;
}