package com.acessolivre.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private UsuarioResponseDTO usuario;
    @Builder.Default
    private Boolean twoFactorRequired = false;
    private String emailDestino;
}
