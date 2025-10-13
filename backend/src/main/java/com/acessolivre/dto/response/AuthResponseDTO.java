package com.acessolivre.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO de resposta do login contendo token e email do usuário.
 */
@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String email;
}
