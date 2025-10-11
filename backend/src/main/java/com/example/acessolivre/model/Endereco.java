package com.example.acessolivre.model;

import jakarta.persistence.*;
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

    private String cep;

    private String logradouro;

    private String numero;

    private String complemento;

    private String bairro;

    private String cidade;

    private String estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idusuario", referencedColumnName = "idusuario")
    private Usuario usuario;
}
