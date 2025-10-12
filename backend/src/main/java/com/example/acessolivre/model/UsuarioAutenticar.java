package com.example.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "usuario_autenticar")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAutenticar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idusuario_autenticar")
    private Long idUsuarioAutenticar;

    @NotNull(message = "Usuário é obrigatório")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario", nullable = false)
    @JsonIgnore
    private Usuario usuario;

    @NotBlank(message = "Hash da senha é obrigatório")
    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Column(name = "token_jwt")
    private String tokenJwt;

    @NotNull(message = "Data de expiração é obrigatória")
    @Column(name = "data_expiracao", nullable = false)
    private LocalDateTime dataExpiracao;
}
