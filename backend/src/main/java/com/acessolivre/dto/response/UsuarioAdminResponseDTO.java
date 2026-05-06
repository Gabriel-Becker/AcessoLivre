package com.acessolivre.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAdminResponseDTO {
    private Long idUsuario;
    private String nome;
    private String email;
    private String role;
    private Boolean ativo;
    private String dataCadastro;
}
