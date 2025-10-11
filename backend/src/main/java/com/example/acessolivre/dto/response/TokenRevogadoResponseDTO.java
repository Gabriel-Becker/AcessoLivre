package com.example.acessolivre.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenRevogadoResponseDTO {

    private Long id;
    private LocalDateTime dataRevogacao;
    private String token;
    private Long usuarioId;
}
