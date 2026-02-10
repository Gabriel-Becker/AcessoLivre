package com.acessolivre.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocalRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    private String nome;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(max = 300, message = "Descrição deve ter no máximo 300 caracteres")
    private String descricao;

    @NotNull(message = "ID da categoria é obrigatório")
    private Long idCategoria;

    @NotNull(message = "ID do tipo de acessibilidade é obrigatório")
    private Long idTipoAcessibilidade;

    @NotNull(message = "ID do usuário é obrigatório")
    private Long idUsuario;

    private Long idEndereco;

    @Valid
    private EnderecoRequestDTO endereco;
}