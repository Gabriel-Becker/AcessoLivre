package com.example.acessolivre.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorRecoveryCodeRequestDTO {

    private String code;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean used;
    private Long idUsuario;
}
