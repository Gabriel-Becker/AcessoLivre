package com.example.acessolivre.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {

    private Integer idUsuario;
    private String nome;
    private String email;
    private String cpf;
    private String role;
    private LocalDateTime dataCadastro;
    private String imagemPerfil;
}
