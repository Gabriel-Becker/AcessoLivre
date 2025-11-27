package com.acessolivre.dto.request;

import com.acessolivre.validation.CpfValido;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 255, message = "Nome deve ter no máximo 255 caracteres")
    private String nome;

    @Email(message = "Email deve ter formato válido")
    @NotBlank(message = "Email é obrigatório")
    @Size(max = 255, message = "Email deve ter no máximo 255 caracteres")
    private String email;

    @NotBlank(message = "CPF é obrigatório")
    @Size(max = 14, message = "CPF deve ter no máximo 14 caracteres")
    @CpfValido
    private String cpf;

    @Size(max = 50, message = "Role deve ter no máximo 50 caracteres")
    private String role;

    @Size(max = 500, message = "URL da imagem deve ter no máximo 500 caracteres")
    private String imagemPerfil;
}
