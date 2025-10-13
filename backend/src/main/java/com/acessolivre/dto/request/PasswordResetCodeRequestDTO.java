package com.acessolivre.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetCodeRequestDTO {

    @NotBlank(message = "Código é obrigatório")
    @Size(max = 150, message = "Código deve ter no máximo 150 caracteres")
    private String code;

    @NotBlank(message = "CPF é obrigatório")
    @Size(max = 14, message = "CPF deve ter no máximo 14 caracteres")
    private String cpf;

    @NotNull(message = "Data de criação é obrigatória")
    @PastOrPresent(message = "Data de criação deve ser no passado ou presente")
    private LocalDateTime createdAt;

    @NotNull(message = "Data de expiração é obrigatória")
    @Future(message = "Data de expiração deve ser no futuro")
    private LocalDateTime expiresAt;

    @NotNull(message = "Status de uso é obrigatório")
    private Boolean used;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long usuarioId;
}
