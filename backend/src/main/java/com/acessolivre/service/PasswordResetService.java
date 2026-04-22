package com.acessolivre.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.acessolivre.model.PasswordResetCode;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.exception.PasswordResetException;
import com.acessolivre.repository.PasswordResetCodeRepository;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.util.PasswordValidator;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private static final int MAX_TENTATIVAS_JANELA = 3;
    private static final int MINUTOS_JANELA = 15;
    private static final int MINUTOS_EXPIRACAO = 15;
    private static final String MENSAGEM_RETORNO_NEUTRA = "Se o email existir, você receberá um código de recuperação";

    private final PasswordResetCodeRepository passwordResetCodeRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioAutenticarRepository usuarioAutenticarRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public String gerarCodigoRecuperacaoComValidacao(String email) {
        String emailLimpo = normalizarEmail(email);

        Usuario usuario = usuarioRepository.findByEmail(emailLimpo).orElse(null);

        if (usuario == null) {
            // Resposta neutra para não permitir enumeração de contas.
            log.info("Solicitação de recuperação para email não encontrado");
            return MENSAGEM_RETORNO_NEUTRA;
        }

        LocalDateTime janelaInicio = LocalDateTime.now().minusMinutes(MINUTOS_JANELA);
        long tentativasRecentes = passwordResetCodeRepository
            .countByUsuario_IdUsuarioAndCreatedAtAfter(usuario.getIdUsuario(), janelaInicio);

        if (tentativasRecentes >= MAX_TENTATIVAS_JANELA) {
            throw new PasswordResetException("Muitas tentativas. Tente novamente em 15 minutos");
        }

        passwordResetCodeRepository.markAllAsUsedByUsuarioId(usuario.getIdUsuario());

        String codigo = gerarCodigoSeisDigitos();
        LocalDateTime agora = LocalDateTime.now();
        PasswordResetCode resetCode = new PasswordResetCode(
            null,
            codigo,
            agora,
            agora.plusMinutes(MINUTOS_EXPIRACAO),
            false,
            usuario
        );

        passwordResetCodeRepository.save(resetCode);

        try {
            emailService.sendPasswordResetCode(usuario.getEmail(), usuario.getNome(), codigo);
        } catch (Exception e) {
            throw new PasswordResetException.EnvioEmailException(e);
        }

        return MENSAGEM_RETORNO_NEUTRA;
    }

    @Transactional
    public String redefinirSenhaComValidacao(String email, String code, String newPassword) {
        String emailLimpo = normalizarEmail(email);
        String codeLimpo = code == null ? "" : code.trim();

        validarFormatoCodigo(codeLimpo);

        if (!PasswordValidator.isStrong(newPassword)) {
            throw new PasswordResetException(PasswordValidator.getStrengthMessage(newPassword));
        }

        Usuario usuario = usuarioRepository.findByEmail(emailLimpo)
            .orElseThrow(() -> new PasswordResetException("Usuário não encontrado"));

        PasswordResetCode resetCode = passwordResetCodeRepository
            .findByCodeAndUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(codeLimpo, usuario.getIdUsuario(), LocalDateTime.now())
            .orElseGet(() -> {
                PasswordResetCode codigoExistente = passwordResetCodeRepository
                    .findByCodeAndUsuario_IdUsuario(codeLimpo, usuario.getIdUsuario())
                    .orElseThrow(PasswordResetException.CodigoInvalidoException::new);

                if (Boolean.TRUE.equals(codigoExistente.getUsed())) {
                    throw new PasswordResetException.CodigoJaUtilizadoException();
                }

                if (codigoExistente.getExpiresAt().isBefore(LocalDateTime.now())) {
                    throw new PasswordResetException.CodigoExpiradoException();
                }

                throw new PasswordResetException.CodigoInvalidoException();
            });

        UsuarioAutenticar usuarioAutenticar = usuarioAutenticarRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
            .orElseThrow(() -> new PasswordResetException("Credenciais não encontradas"));

        usuarioAutenticar.setSenhaHash(passwordEncoder.encode(newPassword));
        usuarioAutenticar.setDataExpiracao(LocalDateTime.now().plusYears(1));
        usuarioAutenticarRepository.save(usuarioAutenticar);

        resetCode.setUsed(true);
        passwordResetCodeRepository.save(resetCode);

        try {
            emailService.sendPasswordResetConfirmation(usuario.getEmail(), usuario.getNome());
        } catch (Exception e) {
            log.warn("Falha ao enviar confirmação de reset para {}: {}", usuario.getEmail(), e.getMessage());
        }

        return "Senha redefinida com sucesso";
    }

    private String gerarCodigoSeisDigitos() {
        return String.format("%06d", random.nextInt(1_000_000));
    }

    private String normalizarEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private void validarFormatoCodigo(String code) {
        if (code.length() != 6 || !code.chars().allMatch(Character::isDigit)) {
            throw new PasswordResetException.CodigoInvalidoException();
        }
    }

}