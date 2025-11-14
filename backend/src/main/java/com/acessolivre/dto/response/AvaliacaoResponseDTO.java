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
    private String comentario; // opcional
    private Boolean moderado;
    private LocalDateTime dataAvaliacao;

    private Long idUsuario;
    private Long idLocal;
}
