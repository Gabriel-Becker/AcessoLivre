package com.example.acessolivre.model;

import jakarta.persistence.*;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario")
    private Usuario usuario;

    @Column(name = "senha_hash", nullable = false)
    private String senhaHash;

    @Column(name = "token_jwt")
    private String tokenJwt;

    @Column(name = "data_expiracao", nullable = false)
    private LocalDateTime dataExpiracao;
}
