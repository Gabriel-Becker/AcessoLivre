package com.acessolivre.dto.request;

import com.acessolivre.validation.SenhaForte;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlterarSenhaAdminRequestDTO {

    @NotBlank(message = "Nova senha é obrigatória")
    @SenhaForte
    private String novaSenha;
}
