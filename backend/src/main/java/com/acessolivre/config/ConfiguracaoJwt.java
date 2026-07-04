package com.acessolivre.config;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.io.InputStream;
import java.util.Objects;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/**
 * Configuração do JWT com chaves RSA para assinatura e verificação de tokens.
 */
@Configuration
@Slf4j
public class ConfiguracaoJwt {

    private static final String DEFAULT_PUBLIC_KEY_LOCATION = "classpath:app.pub";
    private static final String DEFAULT_PRIVATE_KEY_LOCATION = "classpath:app.key";

    private final ResourceLoader resourceLoader;
    private final Environment environment;

    private KeyPair testKeyPair;

    @Value("${jwt.public.key:}")
    private String jwtPublicKeyLocation;

    @Value("${jwt.private.key:}")
    private String jwtPrivateKeyLocation;

    public ConfiguracaoJwt(ResourceLoader resourceLoader, Environment environment) {
        this.resourceLoader = resourceLoader;
        this.environment = environment;
    }

    @Bean
    public JwtDecoder jwtDecoder() throws Exception {
        KeyPair keyPair = resolveKeyPair();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }

    @Bean
    public JwtEncoder jwtEncoder() throws Exception {
        KeyPair keyPair = resolveKeyPair();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        JWK jwk = new RSAKey.Builder(publicKey).privateKey(privateKey).build();
        JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
        return new NimbusJwtEncoder(jwks);
    }

    private KeyPair resolveKeyPair() throws Exception {
        String publicLocation = sanitizeLocation(jwtPublicKeyLocation, DEFAULT_PUBLIC_KEY_LOCATION);
        String privateLocation = sanitizeLocation(jwtPrivateKeyLocation, DEFAULT_PRIVATE_KEY_LOCATION);

        RSAPublicKey publicKey = tryLoadPublicKey(publicLocation);
        RSAPrivateKey privateKey = tryLoadPrivateKey(privateLocation);

        if (publicKey != null && privateKey != null) {
            return new KeyPair(publicKey, privateKey);
        }

        if (environment.acceptsProfiles(Profiles.of("test"))) {
            log.warn("Chaves JWT não encontradas no perfil de teste. Gerando par RSA efêmero para os testes.");
            return getOrCreateTestKeyPair();
        }

        throw new IllegalStateException(
            "Não foi possível carregar as chaves JWT. Configure 'jwt.public.key' e 'jwt.private.key' com recursos válidos."
        );
    }

    private synchronized KeyPair getOrCreateTestKeyPair() throws Exception {
        if (testKeyPair == null) {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048);
            testKeyPair = keyPairGenerator.generateKeyPair();
        }
        return testKeyPair;
    }

    private String sanitizeLocation(String configuredLocation, String defaultLocation) {
        if (configuredLocation == null || configuredLocation.isBlank()) {
            return defaultLocation;
        }
        return configuredLocation;
    }

    private RSAPublicKey tryLoadPublicKey(String location) {
        try {
            return loadPublicKeyFromResource(location);
        } catch (Exception ex) {
            log.warn("Falha ao carregar chave pública JWT em '{}': {}", location, ex.getMessage());
            return null;
        }
    }

    private RSAPrivateKey tryLoadPrivateKey(String location) {
        try {
            return loadPrivateKeyFromResource(location);
        } catch (Exception ex) {
            log.warn("Falha ao carregar chave privada JWT em '{}': {}", location, ex.getMessage());
            return null;
        }
    }

    private RSAPublicKey loadPublicKeyFromResource(String location) throws Exception {
        String safeLocation = Objects.requireNonNull(location, "Local da chave pública JWT não pode ser nulo");
        Resource r = resourceLoader.getResource(safeLocation);
        try (InputStream is = r.getInputStream()) {
            String pem = new String(is.readAllBytes()).replaceAll("-----BEGIN PUBLIC KEY-----", "")
                    .replaceAll("-----END PUBLIC KEY-----", "")
                    .replaceAll("\n", "").replaceAll("\r", "");
            byte[] decoded = Base64.getDecoder().decode(pem);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            return (RSAPublicKey) kf.generatePublic(spec);
        }
    }

    private RSAPrivateKey loadPrivateKeyFromResource(String location) throws Exception {
        String safeLocation = Objects.requireNonNull(location, "Local da chave privada JWT não pode ser nulo");
        Resource r = resourceLoader.getResource(safeLocation);
        try (InputStream is = r.getInputStream()) {
            String pem = new String(is.readAllBytes()).replaceAll("-----BEGIN PRIVATE KEY-----", "")
                    .replaceAll("-----END PRIVATE KEY-----", "")
                    .replaceAll("\n", "").replaceAll("\r", "");
            byte[] decoded = Base64.getDecoder().decode(pem);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(decoded);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            return (RSAPrivateKey) kf.generatePrivate(spec);
        }
    }
}