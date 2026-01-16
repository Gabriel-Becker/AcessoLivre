package com.acessolivre.security;

import com.acessolivre.model.TokenRevogado;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.TokenRevogadoRepository;
import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.service.TwoFactorService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final JwtService jwtService;
    private final TokenRevogadoRepository tokenRevogadoRepository;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final LoginAttemptService loginAttemptService;
    private final TwoFactorService twoFactorService;

    public String login(String email, String senha, Boolean rememberMe, Integer twoFactorCode) {
        if (loginAttemptService.estaBloqueado(email)) {
            LocalDateTime bloqueioExpira = loginAttemptService.getBloqueioExpiraEm(email);
            throw new RuntimeException(
                String.format("Conta temporariamente bloqueada. Tente novamente após %s", bloqueioExpira)
            );
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, senha)
            );

            if (twoFactorService.isTwoFactorEnabledByEmail(email)) {
                if (twoFactorCode == null) {
                    throw new TwoFactorRequiredException("Código de autenticação de dois fatores é obrigatório");
                }
                
                boolean isCodeValid = twoFactorService.validateCodeByEmail(email, twoFactorCode);
                if (!isCodeValid) {
                    loginAttemptService.loginFalhou(email);
                    throw new InvalidTwoFactorCodeException("Código de autenticação de dois fatores inválido");
                }
            }

            String token = jwtService.gerarToken(authentication, rememberMe);
            loginAttemptService.loginSucesso(email);
            
            return token;
        } catch (TwoFactorRequiredException | InvalidTwoFactorCodeException e) {
            throw e;
        } catch (Exception e) {
            loginAttemptService.loginFalhou(email);
            throw e;
        }
    }

    public void logout(String token, Long userId) {
        if (token == null || token.isBlank()) return;
        
        try {
            TokenRevogado tr = TokenRevogado.builder()
                    .token(token)
                    .dataRevogacao(LocalDateTime.now())
                    .usuario(usuarioRepository.findById(userId).orElse(null))
                    .build();
            tokenRevogadoRepository.save(tr);
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
            if (usuario == null) {
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
        
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            usuario.getEmail(),
            null,
            List.of(() -> usuario.getRole().name())
        );
        
        return jwtService.gerarToken(authentication, false);
    }
}
