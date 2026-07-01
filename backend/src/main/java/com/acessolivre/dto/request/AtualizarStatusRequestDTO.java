package com.acessolivre.dto.request;

import com.acessolivre.enums.StatusDenuncia;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarStatusRequestDTO {
    
    @NotNull(message = "Status é obrigatório")
    private StatusDenuncia status;
    
    private String observacoes;
}