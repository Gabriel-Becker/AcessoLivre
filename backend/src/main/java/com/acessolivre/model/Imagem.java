package com.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "imagem")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Imagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idimagem")
    private Long idImagem;

    @NotBlank(message = "Imagem base64 é obrigatória")
    @Column(name = "imagem_base64", columnDefinition = "TEXT")
    private String imagemBase64;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idlocal", referencedColumnName = "idlocal")
    @NotNull(message = "Local é obrigatório")
    @JsonIgnore
    private Local local;

    @Column(name = "ordem")
    @Builder.Default
    private Integer ordem = 0;

    @CreationTimestamp
    @Column(name = "data_criacao", updatable = false)
    private LocalDateTime dataCriacao;
}