package com.acessolivre.dto.request;

import com.acessolivre.validation.CpfValido;
import com.acessolivre.validation.SenhaForte;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequestDTO {
    @NotBlank(message = "Por favor, informe seu CPF")
    @CpfValido
    private String cpf;

    @NotBlank(message = "Por favor, informe sua senha")
    @SenhaForte
    private String senha;

    private Boolean rememberMe;

    private String twoFactorCode;
}
