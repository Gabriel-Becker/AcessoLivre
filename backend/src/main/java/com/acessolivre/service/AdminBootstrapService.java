package com.acessolivre.service;

import com.acessolivre.dto.request.AdminBootstrapRequestDTO;
import com.acessolivre.dto.response.UsuarioAdminResponseDTO;
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
import jakarta.annotation.PostConstruct;

/**
 * Serviço responsável pelo bootstrap do primeiro usuário ADMIN.
 * Protegido por um segredo definido via variável de ambiente ADMIN_BOOTSTRAP_SECRET.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrapService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioAutenticarRepository usuarioAutenticarRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Value("${admin.bootstrap.secret:}")
    private String bootstrapSecret;

    @PostConstruct
    void logBootstrapSecretInfo() {
        String interno = bootstrapSecret != null ? bootstrapSecret.trim() : null;
        log.info("[AdminBootstrap] Segredo configurado? {} length={} (não exibido)", interno != null && !interno.isBlank(), interno != null ? interno.length() : 0);
    }

    /**
     * Cria o usuário ADMIN se ainda não existir nenhum e se o segredo fornecido for válido.
     * @param secretFornecido segredo enviado na requisição
     * @param dto dados do administrador
     * @return DTO de resposta do usuário admin criado
     */
    @Transactional
    public UsuarioAdminResponseDTO criarAdminSeInexistente(String secretFornecido, AdminBootstrapRequestDTO dto) {
        if (usuarioRepository.existsByRole("ROLE_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um administrador cadastrado");
        }
        // Normalizamos ambos (trim) para evitar erros por espaços acidentais
        String interno = bootstrapSecret != null ? bootstrapSecret.trim() : null;
        String recebido = secretFornecido != null ? secretFornecido.trim() : null;

        if (interno == null || interno.isBlank()) {
            log.error("Segredo de bootstrap não configurado (ADMIN_BOOTSTRAP_SECRET)");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Segredo de bootstrap não configurado");
        }
        if (recebido == null || !recebido.equals(interno)) {
            log.warn("Tentativa de bootstrap ADMIN com segredo ausente ou incorreto. presente={} lengthRecebido={} lengthInterno={}",
                    recebido != null, recebido != null ? recebido.length() : 0, interno.length());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Segredo inválido ou ausente");
        }

        // Sanitiza CPF removendo caracteres não numéricos
        String cpfLimpo = dto.getCpf().replaceAll("[^0-9]", "");
        if (usuarioRepository.existsByCpf(cpfLimpo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");
        }

        Usuario usuario = Usuario.builder()
                .nome(dto.getNome())
                .email(dto.getEmail())
                .cpf(cpfLimpo)
                .role("ROLE_ADMIN")
                .build();
        usuario = usuarioRepository.save(usuario);

    UsuarioAutenticar ua = UsuarioAutenticar.builder()
        .usuario(usuario)
        .senhaHash(passwordEncoder.encode(dto.getSenha()))
        .dataExpiracao(LocalDateTime.now().plusYears(1))
        .build();
        usuarioAutenticarRepository.save(ua);

        log.info("Bootstrap de usuário ADMIN realizado: id={} email={}", usuario.getIdUsuario(), usuario.getEmail());

        return UsuarioAdminResponseDTO.builder()
                .idUsuario(usuario.getIdUsuario())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .cpf(usuario.getCpf())
                .role(usuario.getRole())
                .dataCadastro(usuario.getDataCadastro() != null ? usuario.getDataCadastro().toString() : null)
                .build();
    }
}