package com.acessolivre.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenRevogadoRequestDTO {

    @NotNull(message = "Data de revogação é obrigatória")
    private LocalDateTime dataRevogacao;

    @NotBlank(message = "Token é obrigatório")
    @Size(max = 500, message = "Token deve ter no máximo 500 caracteres")
    private String token;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long usuarioId;
}
