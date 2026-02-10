package com.acessolivre.security;

import com.acessolivre.model.Usuario;
import com.acessolivre.repository.TokenRevogadoRepository;
import com.acessolivre.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.stream.Collectors;

@Service
@Slf4j
public class JwtService {

    private final JwtEncoder encoder;
    private final JwtDecoder jwtDecoder;
    private final TokenRevogadoRepository tokenRevogadoRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${jwt.token.expiration.default:720}")
    private long defaultTokenExpirationMinutes;

    @Value("${jwt.token.expiration.remember-me:43200}")
    private long rememberMeTokenExpirationMinutes;

    public JwtService(JwtEncoder encoder, JwtDecoder jwtDecoder, TokenRevogadoRepository tokenRevogadoRepository, UsuarioRepository usuarioRepository) {
        this.encoder = encoder;
        this.jwtDecoder = jwtDecoder;
        this.tokenRevogadoRepository = tokenRevogadoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public String gerarToken(Authentication authentication) {
        return gerarToken(authentication, false);
    }

    public String gerarToken(Authentication authentication, Boolean rememberMe) {
        Instant now = ZonedDateTime.now(ZoneId.of("America/Sao_Paulo")).toInstant();
        long expiry = (rememberMe != null && rememberMe) ? rememberMeTokenExpirationMinutes * 60 : defaultTokenExpirationMinutes * 60;

        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));

        String email = authentication.getName();
        Long userId = null;
        try {
            Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
            if (usuario != null) userId = usuario.getIdUsuario();
        } catch (Exception ignored) {}

        JwtClaimsSet.Builder claimsBuilder = JwtClaimsSet.builder()
                .issuer("acessolivre")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiry))
                .subject(authentication.getName())
                .claim("scope", scope);

        if (userId != null) claimsBuilder.claim("userId", userId);

        return encoder.encode(JwtEncoderParameters.from(claimsBuilder.build())).getTokenValue();
    }

    public Long obterIdUsuarioDoToken(String token) {
        Jwt jwt = jwtDecoder.decode(token);
        return jwt.getClaim("userId");
    }

    public boolean isTokenRevogado(String token) {
        return tokenRevogadoRepository.existsByToken(token);
    }

    // Compatibility helper: extract username (subject) from token
    public String extrairNomeUsuario(String token) {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            return jwt.getSubject();
        } catch (Exception e) {
            log.warn("Falha ao decodificar JWT para extrair usuario: {}", e.getClass().getSimpleName());
            return null;
        }
    }

    // Compatibility helper: validate token against a UserDetails
    public boolean isTokenValid(String token, UserDetails userDetails) {
        if (token == null || userDetails == null) return false;
        String username = extrairNomeUsuario(token);
        if (username == null || !username.equals(userDetails.getUsername())) {
            log.warn("JWT com usuario divergente. esperado={}, obtido={}", userDetails.getUsername(), username);
            return false;
        }
        try {
            Jwt jwt = jwtDecoder.decode(token);
            Instant exp = jwt.getExpiresAt();
            if (exp == null) {
                log.warn("JWT sem expiracao (exp)");
                return false;
            }
            if (exp.isBefore(Instant.now())) {
                log.warn("JWT expirado em {}", exp);
                return false;
            }
        } catch (Exception e) {
            log.warn("Falha ao validar JWT: {}", e.getClass().getSimpleName());
            return false;
        }
        if (isTokenRevogado(token)) {
            log.warn("JWT revogado");
            return false;
        }
        return true;
    }
}

