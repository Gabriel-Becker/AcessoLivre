package com.acessolivre.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorRecoveryCodeResponseDTO {

    private Long id;
    private String code;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean used;
    private Long usuarioId;
}
