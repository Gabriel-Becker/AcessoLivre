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
    private final EmailVerificationService emailVerificationService;

    @Transactional
    public Usuario registrarUsuario(String nome, String email, String senha) {
        log.info("Registrando novo usuário: email={}", email);
        
        if (usuarioRepository.findByEmail(email).isPresent()) {
            log.warn("Email já cadastrado: {}", email);
            throw new IllegalArgumentException("Email já cadastrado");
        }
        
        Usuario usuario = Usuario.builder()
                .nome(nome)
                .email(email)
                .role(com.acessolivre.enums.Role.ROLE_USER)
                .emailVerified(false)
                .build();
        
        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        
        String senhaHash = passwordEncoder.encode(senha);
        UsuarioAutenticar ua = UsuarioAutenticar.builder()
                .usuario(usuarioSalvo)
                .senhaHash(senhaHash)
                .dataExpiracao(LocalDateTime.now().plusYears(1))
                .build();
        
        usuarioAutenticarRepository.save(ua);
        
        // Gera e envia código de verificação de email
        emailVerificationService.gerarEEnviarCodigo(usuarioSalvo);
        
        log.info("Usuário registrado: id={}, código de verificação enviado", usuarioSalvo.getIdUsuario());
        
        return usuarioSalvo;
    }
}
