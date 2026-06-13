package com.acessolivre.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvaliacaoResponseDTO {
    
    private Long idAvaliacao;
    
    private Integer notaAcessibilidadeVisual;
    private Integer notaAcessibilidadeMotora;
    private Integer notaAcessibilidadeAuditiva;
    private Double notaGeral;
    private String comentario;
    private Boolean moderado;
    private LocalDateTime dataAvaliacao;
    
    private UsuarioResumoDTO usuario;
   
    private Long idLocal;
    private String nomeLocal;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioResumoDTO {
        private Long idUsuario;
        private String nome;
        private String email;
    }
}