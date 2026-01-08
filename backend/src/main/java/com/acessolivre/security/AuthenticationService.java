package com.acessolivre.security;

import com.acessolivre.model.TokenRevogado;
import com.acessolivre.model.Usuario;
import com.acessolivre.repository.TokenRevogadoRepository;
import com.acessolivre.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Serviço de autenticação responsável por login e logout.
 * 
 * TODO: Implementar autenticação de dois fatores (2FA)
 * - Adicionar método para validar código 2FA
 * - Adicionar método para gerar secret 2FA
 * - Adicionar método para gerar códigos de recuperação
 * - Modificar método login para suportar 2FA
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final JwtService jwtService;
    private final TokenRevogadoRepository tokenRevogadoRepository;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;

    public String login(String email, String senha, Boolean rememberMe) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, senha)
        );

        String token = jwtService.gerarToken(authentication, rememberMe);

        // salva token atual no usuário
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario != null) {
            usuario.setTokenAtual(token);
            usuarioRepository.save(usuario);
        }

        return token;
    }

    public void logout(String token, Long userId) {
        if (token == null || token.isBlank()) return;
        TokenRevogado tr = TokenRevogado.builder()
                .token(token)
                .dataRevogacao(LocalDateTime.now())
                .usuario(usuarioRepository.findById(userId).orElse(null))
                .build();
        tokenRevogadoRepository.save(tr);
    }

    public boolean isTokenRevoked(String token) {
        return jwtService.isTokenRevogado(token);
    }
}
