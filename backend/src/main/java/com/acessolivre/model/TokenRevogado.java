package com.acessolivre.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @Column(name = "token", nullable = false, length = 2048)
    private String token;

    @NotNull(message = "Usuário é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario", nullable = false)
    @JsonIgnore
    private Usuario usuario;
}
