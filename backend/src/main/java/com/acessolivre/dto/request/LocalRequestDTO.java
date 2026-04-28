package com.acessolivre.dto.request;

import com.acessolivre.enums.Categoria;
import com.acessolivre.enums.StatusLocal;
import com.acessolivre.enums.TipoAcessibilidade;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    private String nome;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 350, message = "Descrição deve ter no máximo 350 caracteres")
    private String descricao;
    
    @Size(max = 120, message = "Nome da imagem deve ter no máximo 120 caracteres")
    private String imagem;

    @NotNull(message = "Categoria é obrigatória")
    private Categoria categoria;

    @NotNull(message = "Tipos de acessibilidade são obrigatórios")
    @Size(min = 1, message = "Pelo menos um tipo de acessibilidade deve ser informado")
    private Set<TipoAcessibilidade> tiposAcessibilidade;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long idUsuario;

    private Long idEndereco;
    
    private Long idLocalPrincipal;
    
    private StatusLocal status;

    @Valid
    private EnderecoRequestDTO endereco;
}