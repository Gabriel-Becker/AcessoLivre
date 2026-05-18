package com.acessolivre.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
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
    private String uuid;  // Nome único do arquivo
    
    @Column(name = "caminho_relativo", length = 500, nullable = false)
    private String caminhoRelativo;  // /uploads/locais/8f3a9c1e.jpg
    
    @Column(name = "nome_original", length = 255)
    private String nomeOriginal;
    
    @Column(name = "idlocal", nullable = false)
    private Long idLocal;
    
    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;
    
    @Column(name = "content_type")
    private String contentType;
    
    @Column(name = "formato")
    private String formato;
    
    @Column(name = "ordem")
    @Builder.Default
    private Integer ordem = 0;
    
    @Column(name = "data_upload")
    private LocalDateTime dataUpload;
    
    @PrePersist
    protected void onCreate() {
        dataUpload = LocalDateTime.now();
    }
}