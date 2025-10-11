package com.example.acessolivre.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAutenticarResponseDTO {

    private Long idUsuarioAutenticar;
    private Long usuarioId;
    private String tokenJwt;
    private LocalDateTime dataExpiracao;
}
