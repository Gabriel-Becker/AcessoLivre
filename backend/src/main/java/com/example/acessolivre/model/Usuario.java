package com.example.acessolivre.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "usuario")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idusuario")
    private Integer idUsuario;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @Email(message = "Email deve ter formato válido")
    @NotBlank(message = "Email é obrigatório")
    @Column(unique = true)
    private String email;

    @Column(name = "imagem_perfil")
    private String imagemPerfil;

    @NotBlank(message = "Role é obrigatório")
    private String role;

    @Column(name = "token_atual")
    private String tokenAtual;

    @NotBlank(message = "CPF é obrigatório")
    private String cpf;

    @CreationTimestamp
    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    // Relacionamentos
    // @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private UsuarioAutenticar usuarioAutenticar;

    // @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<Avaliacao> avaliacoes;

    // @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<Local> locais;

    // @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<TwoFactorRecoveryCode> twoFactorRecoveryCodes;

    // @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<PasswordResetCode> passwordResetCodes;

    // @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // private List<TokenRevogado> tokensRevogados;
}
