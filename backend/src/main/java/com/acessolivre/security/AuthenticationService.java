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

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final JwtService jwtService;
    private final TokenRevogadoRepository tokenRevogadoRepository;
    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;

    public String login(String cpf, String senha, Boolean rememberMe) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(cpf, senha)
        );

        String token = jwtService.gerarToken(authentication, rememberMe);

        // salva token atual no usuário
        Usuario usuario = usuarioRepository.findByCpf(cpf).orElse(null);
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
