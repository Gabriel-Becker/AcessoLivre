package com.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "imagem", indexes = {
    @Index(name = "idx_imagem_local", columnList = "idlocal"),
    @Index(name = "idx_imagem_uuid", columnList = "uuid", unique = true)
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

    @Column(name = "uuid", nullable = false, unique = true)
    private String uuid;

    @NotBlank(message = "Caminho da imagem é obrigatório")
    @Column(name = "caminho_relativo", length = 500, nullable = false)
    private String caminhoRelativo;

    @Column(name = "nome_original", length = 255)
    private String nomeOriginal;

    @Column(name = "idlocal", nullable = false)
    private Long idLocal;

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(name = "content_type", length = 100)
    private String contentType;

    @Column(name = "formato", length = 10)
    private String formato;

    @Column(name = "ordem")
    @Builder.Default
    private Integer ordem = 0;

    @Column(name = "data_upload")
    @CreationTimestamp
    private LocalDateTime dataUpload;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idlocal", insertable = false, updatable = false)
    @JsonIgnore
    private Local local; 
}