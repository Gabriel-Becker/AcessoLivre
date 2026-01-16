package com.acessolivre.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TwoFactorRecoveryRequestDTO {
    @NotBlank(message = "Código de recuperação é obrigatório")
    private String recoveryCode;
}
