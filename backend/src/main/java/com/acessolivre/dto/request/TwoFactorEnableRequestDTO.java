package com.acessolivre.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TwoFactorEnableRequestDTO {
    @NotBlank(message = "Código de verificação é obrigatório")
    private String verificationCode;
}
