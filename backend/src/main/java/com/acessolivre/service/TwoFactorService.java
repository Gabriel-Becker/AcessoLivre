package com.acessolivre.service;

import com.acessolivre.model.CodigoTwoFactorEmail;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.CodigoTwoFactorEmailRepository;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TwoFactorService {

    private static final int CODE_EXPIRATION_MINUTES = 15;

    private final UsuarioRepository usuarioRepository;
    private final CodigoTwoFactorEmailRepository codigoTwoFactorEmailRepository;
    private final EmailService emailService;

    public boolean isTwoFactorEnabledByEmail(String email) {
        return usuarioRepository.findByEmail(email)
            .map(Usuario::getTwoFactorEnabled)
            .orElse(false);
    }

    @Transactional
    public DesafioLogin criarDesafioLogin(String email, boolean rememberMe) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        codigoTwoFactorEmailRepository.deleteByUsuario(usuario);

        String codigo = emailService.gerarCodigoVerificacao();
        CodigoTwoFactorEmail registro = CodigoTwoFactorEmail.builder()
            .usuario(usuario)
            .codigo(codigo)
            .dataExpiracao(LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES))
            .rememberMe(Boolean.TRUE.equals(rememberMe))
            .build();
        codigoTwoFactorEmailRepository.save(registro);

        emailService.enviarCodigoVerificacao(usuario.getEmail(), codigo);
        log.info("Código 2FA por email enviado para userId={}", usuario.getIdUsuario());

        return new DesafioLogin(mascararEmail(usuario.getEmail()));
    }

    @Transactional
    public ValidacaoLogin validarCodigoLogin(String email, String codigo) {
        Usuario usuario = usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        codigoTwoFactorEmailRepository.deleteByDataExpiracaoBefore(LocalDateTime.now());

        Optional<CodigoTwoFactorEmail> registroOpt = codigoTwoFactorEmailRepository
            .findFirstByUsuarioAndCodigoAndUsadoFalseAndDataExpiracaoAfter(usuario, codigo, LocalDateTime.now());

        if (registroOpt.isEmpty()) {
            throw new RuntimeException("Código inválido ou expirado");
        }

        CodigoTwoFactorEmail registro = registroOpt.get();
        registro.setUsado(true);
        codigoTwoFactorEmailRepository.save(registro);
        codigoTwoFactorEmailRepository.deleteByUsuario(usuario);

        return new ValidacaoLogin(usuario, registro.getRememberMe());
    }

    @Transactional
    public void habilitar(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuario.setTwoFactorEnabled(true);
        usuario.setTwoFactorSecret(null);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void desabilitar(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        usuario.setTwoFactorEnabled(false);
        usuario.setTwoFactorSecret(null);
        usuarioRepository.save(usuario);
        codigoTwoFactorEmailRepository.deleteByUsuario(usuario);
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

    public record DesafioLogin(String emailMascarado) { }

    public record ValidacaoLogin(Usuario usuario, boolean rememberMe) { }
}
