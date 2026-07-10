package com.acessolivre.security;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.acessolivre.exception.UsuarioException;
import com.acessolivre.model.TokenRevogado;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.TokenRevogadoRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.service.DoisFatoresService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServicoAutenticacao {

    private final ServicoJwt jwtService;
    private final TokenRevogadoRepository tokenRevogadoRepository;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final ServicoTentativasLogin loginAttemptService;
    private final DoisFatoresService twoFactorService;

    private String normalizarEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    public String login(String email, String senha, Boolean rememberMe, String twoFactorCode) {
        String emailNormalizado = normalizarEmail(email);
        try {
            Usuario usuario = usuarioRepository.findByEmailIgnoreCase(emailNormalizado).orElse(null);

            if (usuario != null && !Boolean.TRUE.equals(usuario.getAtivo())) {
                throw new UsuarioException.UsuarioInativoException();
            }

            if (loginAttemptService.estaBloqueado(emailNormalizado)) {
                LocalDateTime bloqueioExpira = loginAttemptService.obterExpiracaoBloqueio(emailNormalizado);
                throw new RuntimeException(
                    String.format("Conta temporariamente bloqueada. Tente novamente após %s", bloqueioExpira)
                );
            }

            if (usuario == null) {
                throw new RuntimeException("Credenciais inválidas");
            }
            
            if (!usuario.getEmailVerified()) {
                throw new ExcecaoEmailNaoVerificado("Email não verificado. Verifique seu email antes de fazer login.");
            }
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(emailNormalizado, senha)
            );

            if (twoFactorService.duasFatoresAtivadosPorEmail(emailNormalizado)) {
                if (twoFactorCode == null) {
                    throw new ExcecaoDoisFatoresObrigatorio("Código de autenticação obrigatório");
                }

                boolean codigoValido = twoFactorService.validarCodigoAutenticador(emailNormalizado, twoFactorCode);
                if (!codigoValido) {
                    throw new ExcecaoCodigoAutenticacaoInvalido("Código de autenticação inválido");
                }
            }

            String token = jwtService.gerarToken(authentication, rememberMe);
            usuario.setTokenAtual(token);
            usuarioRepository.save(usuario);
            loginAttemptService.loginSucesso(emailNormalizado);
            return token;
        } catch (ExcecaoDoisFatoresObrigatorio | ExcecaoEmailNaoVerificado e) {
            throw e;
        } catch (Exception e) {
            loginAttemptService.loginFalhou(emailNormalizado);
            throw e;
        }
    }

    public void logout(String token, Long userId) {
        if (token == null || token.isBlank()) return;
        if (tokenRevogadoRepository.existsByToken(token)) {
            return;
        }

        try {
            Usuario usuario = null;

            if (userId != null) {
                usuario = usuarioRepository.findById(userId).orElse(null);
            }

            if (usuario == null) {
                String email = jwtService.extrairNomeUsuario(token);
                if (email != null) {
                    usuario = usuarioRepository.findByEmailIgnoreCase(email).orElse(null);
                }
            }

            if (usuario == null) {
                throw new IllegalArgumentException("Usuário do token não encontrado para revogação");
            }

            TokenRevogado tr = TokenRevogado.builder()
                .token(token)
                .dataRevogacao(LocalDateTime.now())
                .expiracao(jwtService.obterExpiracaoToken(token))
                .usuario(usuario)
                .build();

            tokenRevogadoRepository.save(tr);

            usuario.setTokenAtual(null);
            usuarioRepository.save(usuario);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao revogar token", e);
        }
    }

    public boolean tokenEhRevogado(String token) {
        return jwtService.tokenEhRevogado(token);
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        
        if (jwtService.tokenEhRevogado(token)) {
            return false;
        }
        
        try {
            String username = jwtService.extrairNomeUsuario(token);
            if (username == null) {
                return false;
            }
            
            Usuario usuario = usuarioRepository.findByEmailIgnoreCaseAndAtivoTrue(username).orElse(null);
            if (usuario == null || !Boolean.TRUE.equals(usuario.getAtivo())) {
                return false;
            }
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String reautenticar(Long userId, Boolean rememberMe) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new UsuarioException.UsuarioInativoException();
        }
        
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            usuario.getEmail(),
            null,
            List.of(() -> usuario.getRole().name())
        );
        
        String token = jwtService.gerarToken(authentication, rememberMe != null && rememberMe);
        usuario.setTokenAtual(token);
        usuarioRepository.save(usuario);
        return token;
    }
}
