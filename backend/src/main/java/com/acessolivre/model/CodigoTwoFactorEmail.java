package com.acessolivre.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "codigo_two_factor_email")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodigoTwoFactorEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario")
    private Usuario usuario;

    @Column(nullable = false, length = 6)
    private String codigo;

    @CreationTimestamp
    @Column(nullable = false, name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(nullable = false, name = "data_expiracao")
    private LocalDateTime dataExpiracao;

    @Column(nullable = false)
    @Builder.Default
    private Boolean usado = false;

    @Column(nullable = false, name = "remember_me")
    @Builder.Default
    private Boolean rememberMe = false;
}
