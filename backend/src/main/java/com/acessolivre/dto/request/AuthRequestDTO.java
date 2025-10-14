package com.acessolivre.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO para autenticação do usuário
 */
@Data
public class AuthRequestDTO {
    @NotBlank(message = "Por favor, informe seu CPF")
    private String cpf;

    @NotBlank(message = "Por favor, informe sua senha")
    private String senha;

    // remember-me opcional
    private Boolean rememberMe;

    // código 2FA opcional (se disponível)
    private String twoFactorCode;
}
