package com.acessolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "endereco")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Endereco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idendereco")
    private Long idEndereco;

    @NotBlank(message = "CEP é obrigatório")
    @Pattern(regexp = "^[0-9]{8}$", message = "CEP deve ter exatamente 8 dígitos")
    @Column(length = 8)
    private String cep;

    @NotBlank(message = "Logradouro é obrigatório")
    @Size(min = 3, max = 200, message = "Logradouro deve ter entre 3 e 200 caracteres")
    @Column(length = 200)
    private String logradouro;

    @NotBlank(message = "Número é obrigatório")
    @Size(min = 1, max = 10, message = "Número deve ter entre 1 e 10 caracteres")
    @Column(length = 10)
    private String numero;

    @Size(max = 100, message = "Complemento deve ter no máximo 100 caracteres")
    @Column(length = 100)
    private String complemento;

    @NotBlank(message = "Bairro é obrigatório")
    @Size(min = 3, max = 100, message = "Bairro deve ter entre 3 e 100 caracteres")
    @Column(length = 100)
    private String bairro;

    @NotBlank(message = "Cidade é obrigatória")
    @Size(min = 2, max = 100, message = "Cidade deve ter entre 2 e 100 caracteres")
    @Column(length = 100)
    private String cidade;

    @NotBlank(message = "Estado é obrigatório")
    @Pattern(regexp = "^[A-Z]{2}$", message = "Estado deve ter exatamente 2 letras maiúsculas")
    @Column(length = 2)
    private String estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario")
    @JsonIgnore
    private Usuario usuario;
}
