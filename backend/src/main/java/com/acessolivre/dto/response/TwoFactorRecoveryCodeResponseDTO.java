package com.acessolivre.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorRecoveryCodeResponseDTO {

    private Long id;
    private String codigo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataExpiracao;
    private Boolean utilizado;
    private Long usuarioId;
}
