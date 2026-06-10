package com.acessolivre.dto.request;

import com.acessolivre.enums.TipoDenuncia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DenunciaRequestDTO {

    @NotNull(message = "Tipo da denúncia é obrigatório")
    private TipoDenuncia tipo;

    @NotNull(message = "ID do alvo é obrigatório")
    private Long targetId;

    @Size(max = 255, message = "Nome do alvo deve ter no máximo 255 caracteres")
    private String targetName;

    @NotBlank(message = "Motivo é obrigatório")
    @Size(max = 50, message = "Motivo deve ter no máximo 50 caracteres")
    private String motivo;

    @Size(max = 100, message = "Label do motivo deve ter no máximo 100 caracteres")
    private String motivoLabel;

    @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
    private String descricao;
}