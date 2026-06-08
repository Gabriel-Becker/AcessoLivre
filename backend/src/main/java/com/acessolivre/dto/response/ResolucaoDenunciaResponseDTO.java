package com.acessolivre.dto.response;

import com.acessolivre.enums.StatusDenuncia;
import com.acessolivre.enums.TipoDenuncia;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolucaoDenunciaResponseDTO {
    private Long denunciaId;
    private TipoDenuncia tipo;
    private Long targetId;
    private String targetName;
    private StatusDenuncia status;
    private String mensagem;
    private String conteudoRemovido;
    private LocalDateTime dataResolucao;
    private String resolvidoPor;
}