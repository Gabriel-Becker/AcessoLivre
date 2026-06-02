package com.acessolivre.security;

import com.acessolivre.model.Usuario;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;

import java.text.ParseException;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    @Mock
    private JwtEncoder jwtEncoder;

    @Mock
    private JwtDecoder jwtDecoder;

    private RSAKey rsaKey;

    @BeforeEach
    void setUp() throws JOSEException {
        MockitoAnnotations.openMocks(this);
        rsaKey = new RSAKeyGenerator(2048).keyID("test-key").generate();
        jwtService = new JwtService(jwtEncoder, jwtDecoder);
    }

    @Test
    void generateToken_deveGerarTokenComClaimsCorretas() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("user@example.com");
        Collection<? extends GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
        when(authentication.getAuthorities()).thenAnswer(invocation -> authorities);

        String tokenValue = "mocked-jwt-token";
        Jwt jwt = Jwt.withTokenValue(tokenValue)
                .header("alg", "RS256")
                .claim("sub", "user@example.com")
                .claim("scope", "ROLE_USER")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();

        when(jwtEncoder.encode(org.mockito.ArgumentMatchers.any())).thenReturn(jwt);

        String token = jwtService.generateToken(authentication);

        assertNotNull(token);
        assertEquals(tokenValue, token);
    }
    
}
