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
public class TwoFactorRecoveryCodeRequestDTO {

    @NotBlank(message = "Código é obrigatório")
    @Size(max = 150, message = "Código deve ter no máximo 150 caracteres")
    private String codigo;

    @NotNull(message = "Data de criação é obrigatória")
    @PastOrPresent(message = "Data de criação deve ser no passado ou presente")
    private LocalDateTime dataCriacao;

    @NotNull(message = "Data de expiração é obrigatória")
    @Future(message = "Data de expiração deve ser no futuro")
    private LocalDateTime dataExpiracao;

    @NotNull(message = "Status de uso é obrigatório")
    private Boolean utilizado;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long usuarioId;
}
