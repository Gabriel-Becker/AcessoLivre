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

@Slf4j
@Service
@RequiredArgsConstructor
public class RegistroUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioAutenticarRepository usuarioAutenticarRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Usuario registrarUsuario(String nome, String email, String cpf, String senha) {
        log.info("Registrando novo usuário: email={}", email);
        
        if (usuarioRepository.findByEmail(email).isPresent()) {
            log.warn("Email já cadastrado: {}", email);
            throw new IllegalArgumentException("Email já cadastrado");
        }
        
        if (usuarioRepository.existsByCpf(cpf)) {
            log.warn("CPF já cadastrado");
            throw new IllegalArgumentException("CPF já cadastrado");
        }
        
        Usuario usuario = Usuario.builder()
                .nome(nome)
                .email(email)
                .cpf(cpf)
                .role(com.acessolivre.enums.Role.ROLE_USER)
                .build();
        
        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        
        String senhaHash = passwordEncoder.encode(senha);
        UsuarioAutenticar ua = UsuarioAutenticar.builder()
                .usuario(usuarioSalvo)
                .senhaHash(senhaHash)
                .dataExpiracao(LocalDateTime.now().plusYears(1))
                .build();
        
        usuarioAutenticarRepository.save(ua);
        log.info("Usuário registrado: id={}", usuarioSalvo.getIdUsuario());
        
        return usuarioSalvo;
    }
}
