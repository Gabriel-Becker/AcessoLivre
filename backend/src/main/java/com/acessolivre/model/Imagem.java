package com.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "imagem", indexes = {
    @Index(name = "idx_imagem_local", columnList = "idlocal")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Imagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idimagem")
    private Long idImagem;

    @NotBlank(message = "URL da imagem é obrigatória")
    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "idlocal", nullable = false)
    private Long idLocal;

    @Column(name = "nome_original")
    private String nomeOriginal;

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "ordem")
    @Builder.Default
    private Integer ordem = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idlocal", referencedColumnName = "idlocal", insertable = false, updatable = false)
    @JsonIgnore
    private Local local;
}