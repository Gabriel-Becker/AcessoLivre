package com.example.acessolivre.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAutenticarRequestDTO {

    @NotNull(message = "ID do usuário é obrigatório")
    private Long usuarioId;

    @NotBlank(message = "Hash da senha é obrigatório")
    @Size(max = 255, message = "Hash da senha deve ter no máximo 255 caracteres")
    private String senhaHash;

    @Size(max = 500, message = "Token JWT deve ter no máximo 500 caracteres")
    private String tokenJwt;

    @NotNull(message = "Data de expiração é obrigatória")
    private LocalDateTime dataExpiracao;
}
