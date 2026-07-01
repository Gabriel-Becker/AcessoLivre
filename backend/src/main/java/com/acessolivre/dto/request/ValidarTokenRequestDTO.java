package com.acessolivre.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ValidarTokenRequestDTO {
    @NotBlank(message = "Token é obrigatório")
    private String token;
}
