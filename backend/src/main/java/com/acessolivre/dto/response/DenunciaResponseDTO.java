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
public class DenunciaResponseDTO {
    private Long id;
    private TipoDenuncia tipo;
    private Long targetId;
    private String targetName;
    private String motivo;
    private String motivoLabel;
    private String descricao;
    private StatusDenuncia status;
    private UsuarioResumoDTO usuario;
    private String usuarioNome;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private LocalDateTime dataResolucao;
    private String resolvidoPor;
    private String observacoes;
}