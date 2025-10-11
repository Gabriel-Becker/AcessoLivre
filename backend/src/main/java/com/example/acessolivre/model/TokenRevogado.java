package com.example.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "token_revogado")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenRevogado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "data_revogacao", nullable = false)
    private LocalDateTime dataRevogacao;

    @Column(name = "token", nullable = false)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", referencedColumnName = "idusuario")
    @JsonIgnore
    private Usuario usuario;
}
