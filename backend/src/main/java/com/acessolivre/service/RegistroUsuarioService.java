package com.acessolivre.service;

import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Serviço dedicado ao fluxo de registro de usuário (isolado para contornar problema de compilação em UsuarioService).
 * Responsável por criar Usuario e seu respectivo UsuarioAutenticar com senha hash.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegistroUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioAutenticarRepository usuarioAutenticarRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Usuario registrarUsuario(String nome, String email, String cpf, String senha) {
        log.info("[RegistroUsuarioService] Registrando novo usuário: {}", email);
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        if (usuarioRepository.existsByCpf(cpf)) {
            throw new IllegalArgumentException("CPF já cadastrado");
        }
    Usuario usuario = Usuario.builder().nome(nome).email(email).cpf(cpf).role(com.acessolivre.enums.Role.ROLE_USER).build();
        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        String senhaHash = passwordEncoder.encode(senha);
        UsuarioAutenticar ua = UsuarioAutenticar.builder()
                .usuario(usuarioSalvo)
                .senhaHash(senhaHash)
                .dataExpiracao(LocalDateTime.now().plusYears(1))
                .build();
        usuarioAutenticarRepository.save(ua);
        return usuarioSalvo;
    }
}
