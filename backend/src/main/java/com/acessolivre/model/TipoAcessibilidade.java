package com.acessolivre.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tipo_acessibilidade")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TipoAcessibilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idtipo_acessibilidade")
    private Long idTipoAcessibilidade;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    private String nome;

    @Size(max = 200, message = "Descrição deve ter no máximo 200 caracteres")
    private String descricao;

    @Column(name = "icone_url")
    @Size(max = 255, message = "URL do ícone deve ter no máximo 255 caracteres")
    private String iconeUrl;
}