package com.acessolivre.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 255)
    private String nome;

    @Email
    @NotBlank(message = "Email é obrigatório")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "CPF é obrigatório")
    @Size(max = 14)
    private String cpf;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, max = 100, message = "Senha deve ter entre 6 e 100 caracteres")
    private String senha;
}
