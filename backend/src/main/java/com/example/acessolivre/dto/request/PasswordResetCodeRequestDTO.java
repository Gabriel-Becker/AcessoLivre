package com.example.acessolivre.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetCodeRequestDTO {

    private String code;
    private String cpf;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean used;
    private Long idUsuario;
}
