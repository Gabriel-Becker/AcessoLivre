package com.acessolivre.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequestDTO {
    @NotBlank(message = "Por favor, informe seu e-mail")
    @Email(message = "E-mail inválido")
    private String email;

    @NotBlank(message = "Por favor, informe sua senha")
    private String senha;

    private Boolean rememberMe;
    
    private String twoFactorCode;
}
