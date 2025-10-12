package com.example.acessolivre.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {

    private Long idUsuario;
    private String nome;
    private String email;
    private String cpf;
    private String role;
    private LocalDateTime dataCadastro;
    private String imagemPerfil;
}
