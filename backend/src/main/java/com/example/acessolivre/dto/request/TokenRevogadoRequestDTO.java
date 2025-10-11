package com.example.acessolivre.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenRevogadoRequestDTO {

    private LocalDateTime dataRevogacao;
    private String token;
    private Long idUsuario;
}
