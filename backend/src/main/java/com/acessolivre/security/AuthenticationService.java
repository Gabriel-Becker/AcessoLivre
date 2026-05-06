package com.acessolivre.security;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.acessolivre.model.TokenRevogado;
import com.acessolivre.model.Usuario;
import com.acessolivre.exception.UsuarioException;
import com.acessolivre.repository.TokenRevogadoRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.service.TwoFactorService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final JwtService jwtService;
    private final TokenRevogadoRepository tokenRevogadoRepository;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final LoginAttemptService loginAttemptService;
    private final TwoFactorService twoFactorService;

    public String login(String email, String senha, Boolean rememberMe, String twoFactorCode) {
        if (loginAttemptService.estaBloqueado(email)) {
            LocalDateTime bloqueioExpira = loginAttemptService.getBloqueioExpiraEm(email);
            throw new RuntimeException(
                String.format("Conta temporariamente bloqueada. Tente novamente após %s", bloqueioExpira)
            );
        }

        try {
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

            if (!Boolean.TRUE.equals(usuario.getAtivo())) {
                throw new UsuarioException.UsuarioInativoException();
            }
            
            if (!usuario.getEmailVerified()) {
                throw new EmailNotVerifiedException("Email não verificado. Verifique seu email antes de fazer login.");
            }
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, senha)
            );

            if (twoFactorService.isTwoFactorEnabledByEmail(email)) {
                if (twoFactorCode == null) {
                    throw new TwoFactorRequiredException("Código de autenticação obrigatório");
                }

                boolean codigoValido = twoFactorService.validarCodigoAutenticador(email, twoFactorCode);
                if (!codigoValido) {
                    throw new InvalidTwoFactorCodeException("Código de autenticação inválido");
                }
            }

            String token = jwtService.gerarToken(authentication, rememberMe);
            usuario.setTokenAtual(token);
            usuarioRepository.save(usuario);
            loginAttemptService.loginSucesso(email);
            return token;
        } catch (TwoFactorRequiredException | EmailNotVerifiedException e) {
            throw e;
        } catch (Exception e) {
            loginAttemptService.loginFalhou(email);
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
                    usuario = usuarioRepository.findByEmail(email).orElse(null);
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

    public boolean isTokenRevoked(String token) {
        return jwtService.isTokenRevogado(token);
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        
        if (jwtService.isTokenRevogado(token)) {
            return false;
        }
        
        try {
            String username = jwtService.extrairNomeUsuario(token);
            if (username == null) {
                return false;
            }
            
            Usuario usuario = usuarioRepository.findByEmail(username).orElse(null);
            if (usuario == null || !Boolean.TRUE.equals(usuario.getAtivo())) {
                return false;
            }
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String reautenticar(Long userId) {
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
        
        String token = jwtService.gerarToken(authentication, false);
        usuario.setTokenAtual(token);
        usuarioRepository.save(usuario);
        return token;
    }
}
