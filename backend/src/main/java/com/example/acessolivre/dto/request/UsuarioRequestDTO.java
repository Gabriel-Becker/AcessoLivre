package com.example.acessolivre.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRequestDTO {

    private String nome;
    private String email;
    private String cpf;
    private String role;
    private String imagemPerfil;
}
