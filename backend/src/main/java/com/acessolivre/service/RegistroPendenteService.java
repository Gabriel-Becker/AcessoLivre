package com.acessolivre.service;

import com.acessolivre.dto.response.UsuarioResponseDTO;
import com.acessolivre.mapper.UsuarioMapper;
import com.acessolivre.model.CodigoVerificacaoRegistro;
import com.acessolivre.model.PendingUsuarioRegistro;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.CodigoVerificacaoRegistroRepository;
import com.acessolivre.repository.PendingUsuarioRegistroRepository;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistroPendenteService {

    private static final int REGISTRO_EXPIRA_MINUTOS = 30;
    private static final int CODIGO_EXPIRA_MINUTOS = 15;

    private final UsuarioRepository usuarioRepository;
    private final PendingUsuarioRegistroRepository pendingUsuarioRegistroRepository;
    private final CodigoVerificacaoRegistroRepository codigoVerificacaoRegistroRepository;
    private final UsuarioAutenticarRepository usuarioAutenticarRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public String iniciarRegistro(String nome, String email, String senha) {
        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        pendingUsuarioRegistroRepository.deleteByEmail(email);
        codigoVerificacaoRegistroRepository.deleteByEmail(email);
        pendingUsuarioRegistroRepository.deleteByDataExpiracaoBefore(LocalDateTime.now());
        codigoVerificacaoRegistroRepository.deleteByDataExpiracaoBefore(LocalDateTime.now());

        PendingUsuarioRegistro pending = PendingUsuarioRegistro.builder()
            .nome(nome)
            .email(email)
            .senhaHash(passwordEncoder.encode(senha))
            .dataExpiracao(LocalDateTime.now().plusMinutes(REGISTRO_EXPIRA_MINUTOS))
            .build();
        pendingUsuarioRegistroRepository.save(pending);

        String codigo = emailService.gerarCodigoVerificacao();
        CodigoVerificacaoRegistro verif = CodigoVerificacaoRegistro.builder()
            .email(email)
            .codigo(codigo)
            .dataExpiracao(LocalDateTime.now().plusMinutes(CODIGO_EXPIRA_MINUTOS))
            .build();
        codigoVerificacaoRegistroRepository.save(verif);

        emailService.enviarCodigoVerificacao(email, codigo);
        log.info("Registro pendente criado para email={}, código enviado", email);

        return mascararEmail(email);
    }

    @Transactional
    public UsuarioResponseDTO concluirRegistro(String email, String codigo) {
        pendingUsuarioRegistroRepository.deleteByDataExpiracaoBefore(LocalDateTime.now());
        codigoVerificacaoRegistroRepository.deleteByDataExpiracaoBefore(LocalDateTime.now());

        PendingUsuarioRegistro pending = pendingUsuarioRegistroRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Solicitação de cadastro não encontrada ou expirada"));

        CodigoVerificacaoRegistro verif = codigoVerificacaoRegistroRepository
            .findByEmailAndCodigoAndUsadoFalseAndDataExpiracaoAfter(email, codigo, LocalDateTime.now())
            .orElseThrow(() -> new IllegalArgumentException("Código inválido ou expirado"));

        verif.setUsado(true);
        codigoVerificacaoRegistroRepository.save(verif);

        if (usuarioRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email já cadastrado");
        }

        Usuario usuario = Usuario.builder()
            .nome(pending.getNome())
            .email(email)
            .role(com.acessolivre.enums.Role.ROLE_USER)
            .emailVerified(true)
            .build();
        Usuario salvo = usuarioRepository.save(usuario);

        UsuarioAutenticar cred = UsuarioAutenticar.builder()
            .usuario(salvo)
            .senhaHash(pending.getSenhaHash())
            .dataExpiracao(LocalDateTime.now().plusYears(1))
            .build();
        usuarioAutenticarRepository.save(cred);

        pendingUsuarioRegistroRepository.deleteByEmail(email);
        codigoVerificacaoRegistroRepository.deleteByEmail(email);

        log.info("Usuário criado após confirmação de email: id={}, email={}", salvo.getIdUsuario(), email);
        return UsuarioMapper.toResponse(salvo);
    }

    @Transactional
    public String reenviarCodigo(String email) {
        pendingUsuarioRegistroRepository.deleteByDataExpiracaoBefore(LocalDateTime.now());
        codigoVerificacaoRegistroRepository.deleteByDataExpiracaoBefore(LocalDateTime.now());

        PendingUsuarioRegistro pending = pendingUsuarioRegistroRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException(
                "Nenhum registro pendente encontrado. Inicie o cadastro novamente."
            ));

        codigoVerificacaoRegistroRepository.deleteByEmail(email);
        codigoVerificacaoRegistroRepository.flush();

        String codigo = emailService.gerarCodigoVerificacao();
        CodigoVerificacaoRegistro verif = CodigoVerificacaoRegistro.builder()
            .email(email)
            .codigo(codigo)
            .dataExpiracao(LocalDateTime.now().plusMinutes(CODIGO_EXPIRA_MINUTOS))
            .build();
        codigoVerificacaoRegistroRepository.save(verif);

        emailService.enviarCodigoVerificacao(email, codigo);
        log.info("Código de registro reenviado para email={}", email);

        return mascararEmail(email);
    }

    public String mascararEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "email informado";
        }
        String[] partes = email.split("@", 2);
        String usuario = partes[0];
        String dominio = partes[1];
        String visivel = usuario.length() <= 2 ? usuario : usuario.substring(0, 2);
        return visivel + "***@" + dominio;
    }
}
