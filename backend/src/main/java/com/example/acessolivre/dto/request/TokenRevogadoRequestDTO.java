package com.example.acessolivre.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenRevogadoRequestDTO {

    @NotNull(message = "Data de revogação é obrigatória")
    private LocalDateTime dataRevogacao;

    @NotBlank(message = "Token é obrigatório")
    private String token;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long usuarioId;
}
