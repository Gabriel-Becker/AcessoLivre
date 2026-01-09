package com.acessolivre.service;

import com.acessolivre.dto.request.AdminBootstrapRequestDTO;
import com.acessolivre.dto.response.UsuarioAdminResponseDTO;
import com.acessolivre.enums.Role;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioAutenticarRepository usuarioAutenticarRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Value("${admin.bootstrap.secret:}")
    private String bootstrapSecret;

    @Transactional
    public UsuarioAdminResponseDTO criarAdminSeInexistente(String secretFornecido, AdminBootstrapRequestDTO dto) {
        log.info("Tentativa de bootstrap ADMIN");
        
        if (usuarioRepository.existsByRole(Role.ROLE_ADMIN)) {
            log.warn("Já existe administrador cadastrado");
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um administrador cadastrado");
        }
        
        String interno = bootstrapSecret != null ? bootstrapSecret.trim() : null;
        String recebido = secretFornecido != null ? secretFornecido.trim() : null;

        if (interno == null || interno.isBlank()) {
            log.error("Segredo de bootstrap não configurado");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Segredo de bootstrap não configurado");
        }
        
        if (recebido == null || !recebido.equals(interno)) {
            log.warn("Bootstrap rejeitado: segredo inválido");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Segredo inválido ou ausente");
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .role(Role.ROLE_ADMIN)
                .build();
        usuario = usuarioRepository.save(usuario);

        UsuarioAutenticar ua = UsuarioAutenticar.builder()
                .usuario(usuario)
                .senhaHash(passwordEncoder.encode(dto.getSenha()))
                .dataExpiracao(LocalDateTime.now().plusYears(1))
                .build();
        usuarioAutenticarRepository.save(ua);

        log.info("Bootstrap ADMIN realizado: id={}", usuario.getIdUsuario());

        return UsuarioAdminResponseDTO.builder()
                .idUsuario(usuario.getIdUsuario())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .role(usuario.getRole() != null ? usuario.getRole().name() : null)
                .dataCadastro(usuario.getDataCadastro() != null ? usuario.getDataCadastro().toString() : null)
                .build();
    }
}