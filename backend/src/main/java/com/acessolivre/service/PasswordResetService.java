package com.acessolivre.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

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

    private final PasswordResetCodeRepository passwordResetCodeRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioAutenticarRepository usuarioAutenticarRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public String gerarCodigoRecuperacaoComValidacao(String email) {
        String emailLimpo = normalizarEmail(email);

        Usuario usuario = usuarioRepository.findByEmail(emailLimpo)
            .orElseThrow(() -> new PasswordResetException("Usuário não encontrado com o email informado"));

        LocalDateTime janelaInicio = LocalDateTime.now().minusMinutes(MINUTOS_JANELA);
        long tentativasRecentes = passwordResetCodeRepository
            .countByUsuario_IdUsuarioAndCreatedAtAfter(usuario.getIdUsuario(), janelaInicio);

        if (tentativasRecentes >= MAX_TENTATIVAS_JANELA) {
            throw new PasswordResetException("Muitas tentativas. Tente novamente em 15 minutos");
        }

        List<PasswordResetCode> codigosAtivos = passwordResetCodeRepository
            .findByUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(usuario.getIdUsuario(), LocalDateTime.now());
        for (PasswordResetCode codigoExistente : codigosAtivos) {
            codigoExistente.setUsed(true);
            passwordResetCodeRepository.save(codigoExistente);
        }

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

        return "Código de recuperação enviado para " + mascararEmail(usuario.getEmail());
    }

    @Transactional
    public String redefinirSenhaComValidacao(String email, String code, String newPassword) {
        String emailLimpo = normalizarEmail(email);
        String codeLimpo = code == null ? "" : code.trim();

        if (!PasswordValidator.isStrong(newPassword)) {
            throw new PasswordResetException(PasswordValidator.getStrengthMessage(newPassword));
        }

        Usuario usuario = usuarioRepository.findByEmail(emailLimpo)
            .orElseThrow(() -> new PasswordResetException("Usuário não encontrado"));

        PasswordResetCode resetCode = passwordResetCodeRepository
            .findByCodeAndUsuario_IdUsuario(codeLimpo, usuario.getIdUsuario())
            .orElseThrow(PasswordResetException.CodigoInvalidoException::new);

        if (Boolean.TRUE.equals(resetCode.getUsed())) {
            throw new PasswordResetException.CodigoJaUtilizadoException();
        }

        if (resetCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new PasswordResetException.CodigoExpiradoException();
        }

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

    private String mascararEmail(String email) {
        if (email == null || email.length() < 3) {
            return "***@***.***";
        }

        int atIndex = email.indexOf('@');
        if (atIndex == -1) {
            return "***@***.***";
        }

        String localPart = email.substring(0, atIndex);
        String domainPart = email.substring(atIndex);

        if (localPart.length() <= 2) {
            return "**" + localPart.charAt(localPart.length() - 1) + domainPart;
        }

        return localPart.substring(0, 2) + "***" + localPart.charAt(localPart.length() - 1) + domainPart;
    }
}