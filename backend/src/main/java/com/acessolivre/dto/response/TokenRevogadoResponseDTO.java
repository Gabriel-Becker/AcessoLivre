package com.acessolivre.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenRevogadoResponseDTO {

    private Long id;
    private LocalDateTime dataRevogacao;
    private String token;
    private Long usuarioId;
}
