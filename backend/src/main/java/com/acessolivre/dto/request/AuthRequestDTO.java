package com.acessolivre.dto.request;

import com.acessolivre.validation.SenhaForte;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequestDTO {
    @NotBlank(message = "Por favor, informe seu e-mail")
    @Email(message = "E-mail inválido")
    private String email;

    @NotBlank(message = "Por favor, informe sua senha")
    @SenhaForte
    private String senha;

    private Boolean rememberMe;

    // TODO: Implementar autenticação de dois fatores (2FA)
    // private String twoFactorCode;
}
