package com.acessolivre.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAutenticarResponseDTO {

    private Long idUsuarioAutenticar;
    private Long usuarioId;
    private String tokenJwt;
    private LocalDateTime dataExpiracao;
}
