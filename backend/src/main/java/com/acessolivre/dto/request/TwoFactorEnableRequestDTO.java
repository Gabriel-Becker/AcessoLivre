package com.acessolivre.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TwoFactorEnableRequestDTO {
    @NotNull(message = "Código de verificação é obrigatório")
    private Integer verificationCode;
}
