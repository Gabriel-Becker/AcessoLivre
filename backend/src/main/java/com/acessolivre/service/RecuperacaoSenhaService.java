package com.acessolivre.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.acessolivre.exception.ExcecaoRecuperacaoSenha;
import com.acessolivre.model.CodigoRecuperacaoSenha;
import com.acessolivre.model.Usuario;
import com.acessolivre.model.UsuarioAutenticar;
import com.acessolivre.repository.CodigoRecuperacaoSenhaRepository;
import com.acessolivre.repository.UsuarioAutenticarRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.util.ValidadorSenha;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecuperacaoSenhaService {

    private static final int MAX_TENTATIVAS_JANELA = 3;
    private static final int MINUTOS_JANELA = 15;
    private static final int MINUTOS_EXPIRACAO = 15;
    private static final String MENSAGEM_RETORNO_NEUTRA = "Se o email existir, você receberá um código de recuperação";

    private final CodigoRecuperacaoSenhaRepository passwordResetCodeRepository;
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

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new com.acessolivre.exception.UsuarioException.UsuarioInativoException();
        }

        LocalDateTime janelaInicio = LocalDateTime.now().minusMinutes(MINUTOS_JANELA);
        long tentativasRecentes = passwordResetCodeRepository
            .countByUsuario_IdUsuarioAndCreatedAtAfter(usuario.getIdUsuario(), janelaInicio);

        if (tentativasRecentes >= MAX_TENTATIVAS_JANELA) {
            throw new ExcecaoRecuperacaoSenha("Muitas tentativas. Tente novamente em 15 minutos");
        }

        passwordResetCodeRepository.markAllAsUsedByUsuarioId(usuario.getIdUsuario());

        String codigo = gerarCodigoSeisDigitos();
        LocalDateTime agora = LocalDateTime.now();
        CodigoRecuperacaoSenha resetCode = new CodigoRecuperacaoSenha(
            null,
            codigo,
            agora,
            agora.plusMinutes(MINUTOS_EXPIRACAO),
            false,
            usuario
        );

        passwordResetCodeRepository.save(resetCode);

        try {
            emailService.enviarCodigoRecuperacaoSenha(usuario.getEmail(), usuario.getNome(), codigo);
        } catch (Exception e) {
            throw new ExcecaoRecuperacaoSenha.EnvioEmailException(e);
        }

        return MENSAGEM_RETORNO_NEUTRA;
    }

    @Transactional
    public String redefinirSenhaComValidacao(String email, String code, String newPassword) {
        String emailLimpo = normalizarEmail(email);
        String codeLimpo = code == null ? "" : code.trim();

        validarFormatoCodigo(codeLimpo);

        if (!ValidadorSenha.ehForte(newPassword)) {
            throw new ExcecaoRecuperacaoSenha(ValidadorSenha.obterMensagemForca(newPassword));
        }

        Usuario usuario = usuarioRepository.findByEmail(emailLimpo)
            .orElseThrow(() -> new ExcecaoRecuperacaoSenha("Usuário não encontrado"));

        CodigoRecuperacaoSenha resetCode = passwordResetCodeRepository
            .findByCodeAndUsuario_IdUsuarioAndUsedFalseAndExpiresAtAfter(codeLimpo, usuario.getIdUsuario(), LocalDateTime.now())
            .orElseGet(() -> {
                CodigoRecuperacaoSenha codigoExistente = passwordResetCodeRepository
                    .findByCodeAndUsuario_IdUsuario(codeLimpo, usuario.getIdUsuario())
                    .orElseThrow(ExcecaoRecuperacaoSenha.CodigoInvalidoException::new);

                if (Boolean.TRUE.equals(codigoExistente.getUsed())) {
                    throw new ExcecaoRecuperacaoSenha.CodigoJaUtilizadoException();
                }

                if (codigoExistente.getExpiresAt().isBefore(LocalDateTime.now())) {
                    throw new ExcecaoRecuperacaoSenha.CodigoExpiradoException();
                }

                throw new ExcecaoRecuperacaoSenha.CodigoInvalidoException();
            });

        UsuarioAutenticar usuarioAutenticar = usuarioAutenticarRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
            .orElseThrow(() -> new ExcecaoRecuperacaoSenha("Credenciais não encontradas"));

        usuarioAutenticar.setSenhaHash(passwordEncoder.encode(newPassword));
        usuarioAutenticar.setDataExpiracao(LocalDateTime.now().plusYears(1));
        usuarioAutenticarRepository.save(usuarioAutenticar);

        resetCode.setUsed(true);
        passwordResetCodeRepository.save(resetCode);

        try {
            emailService.enviarConfirmacaoRecuperacaoSenha(usuario.getEmail(), usuario.getNome());
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
            throw new ExcecaoRecuperacaoSenha.CodigoInvalidoException();
        }
    }

}