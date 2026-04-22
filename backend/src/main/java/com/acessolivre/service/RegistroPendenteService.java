package com.acessolivre.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.acessolivre.dto.response.UsuarioResponseDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.mapper.UsuarioMapper;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class RegistroPendenteService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioAutenticarRepository usuarioAutenticarRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponseDTO registrarUsuarioDireto(String nome, String email, String senha) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        boolean isPrimeiroUsuario = usuarioRepository.count() == 0;

        Usuario usuario = Usuario.builder()
            .nome(nome)
            .email(email)
            .role(isPrimeiroUsuario ? Role.ROLE_ADMIN : Role.ROLE_USER)
            .emailVerified(true)
            .twoFactorEnabled(false)
            .build();
        Usuario salvo = usuarioRepository.save(usuario);

        UsuarioAutenticar cred = UsuarioAutenticar.builder()
            .usuario(salvo)
            .senhaHash(passwordEncoder.encode(senha))
            .dataExpiracao(LocalDateTime.now().plusYears(1))
            .build();
        usuarioAutenticarRepository.save(cred);

        log.info("Usuário criado diretamente no cadastro: id={}, email={}", salvo.getIdUsuario(), email);
        return UsuarioMapper.toResponse(salvo);
    }

    @Transactional
    public String iniciarRegistro(String nome, String email, String senha) {
        throw new UnsupportedOperationException("Verificação de email por código não está implementada. Use registrarUsuarioDireto()");
    }

    @Transactional
    public UsuarioResponseDTO concluirRegistro(String email, String codigo) {
        throw new UnsupportedOperationException("Verificação de email por código não está implementada. Use registrarUsuarioDireto()");
    }

    @Transactional
    public String reenviarCodigo(String email) {
        throw new UnsupportedOperationException("Verificação de email por código não está implementada. Use registrarUsuarioDireto()");
    }
}
