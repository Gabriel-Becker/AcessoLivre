package com.example.acessolivre.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAutenticarRequestDTO {

    private Long usuarioId;
    private String senhaHash;
    private String tokenJwt;
    private LocalDateTime dataExpiracao;
}
