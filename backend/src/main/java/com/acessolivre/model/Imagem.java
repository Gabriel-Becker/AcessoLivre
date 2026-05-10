package com.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "imagem", indexes = {
    @Index(name = "idx_local_id", columnList = "idlocal"),
    @Index(name = "idx_ordem", columnList = "idlocal, ordem")
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

    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;  // Path no S3: "locais/123/foto_abc123.jpg"

    @Column(name = "url_publica", length = 1000)
    private String urlPublica;  // URL do CloudFront ou S3

    @Column(name = "thumbnail_key", length = 500)
    private String thumbnailKey;  // Path da thumbnail no S3

    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;  // URL da thumbnail

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "largura")
    private Integer largura;

    @Column(name = "altura")
    private Integer altura;

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