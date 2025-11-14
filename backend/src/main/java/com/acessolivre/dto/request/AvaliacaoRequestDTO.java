package com.acessolivre.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvaliacaoRequestDTO {

    @NotNull(message = "Nota de acessibilidade visual é obrigatória")
    @Min(value = 1, message = "Nota mínima é 1")
    @Max(value = 5, message = "Nota máxima é 5")
    private Integer notaAcessibilidadeVisual;

    @NotNull(message = "Nota de acessibilidade motora é obrigatória")
    @Min(value = 1, message = "Nota mínima é 1")
    @Max(value = 5, message = "Nota máxima é 5")
    private Integer notaAcessibilidadeMotora;

    @NotNull(message = "Nota de acessibilidade auditiva é obrigatória")
    @Min(value = 1, message = "Nota mínima é 1")
    @Max(value = 5, message = "Nota máxima é 5")
    private Integer notaAcessibilidadeAuditiva;

    // Comentário opcional junto à avaliação
    private String comentario;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long idUsuario;

    @NotNull(message = "ID do local é obrigatório")
    private Long idLocal;
}
