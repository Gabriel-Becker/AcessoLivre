package com.acessolivre.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.acessolivre.security.CustomUserDetailsService;
import com.acessolivre.security.JwtService;
import com.acessolivre.security.TokenResponseFilter;
import com.acessolivre.security.TokenRevogadoFilter;
import com.acessolivre.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

/**
 * Configuração de segurança moderna com Spring Security, JWT e CORS.
 */
@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    
    @Value("${cors.allowed.origins}")
    private String corsAllowedOrigins;

    @Bean
    public TokenRevogadoFilter tokenRevogadoFilter() {
        return new TokenRevogadoFilter(jwtService);
    }

    @Bean
    public TokenResponseFilter tokenResponseFilter() {
        return new TokenResponseFilter(jwtService, usuarioRepository);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/categorias", "/api/tipos-acessibilidade").permitAll()
                .requestMatchers("/api/enderecos/**").permitAll()
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/register/confirm",
                    "/api/auth/register/resend-code",
                    "/api/auth/login",
                    "/api/auth/validate",
                    "/api/auth/reset-password/**",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()
                .requestMatchers("/api/admin/bootstrap").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
            )
            .addFilterBefore(tokenRevogadoFilter(), UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(tokenResponseFilter(), TokenRevogadoFilter.class);

        return http.build();
    }

    /**
     * Configuração CORS para permitir chamadas de frontend.
     * Origens permitidas são configuradas via variável de ambiente CORS_ALLOWED_ORIGINS.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(corsAllowedOrigins.split(",")));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization", "New-Auth-Token"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Declara explicitamente o UserDetailsService para evitar ambiguidade.
     * Retorna o CustomUserDetailsService que usa email para autenticação.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return customUserDetailsService;
    }

    /**
     * Configura o AuthenticationManager com o UserDetailsService e PasswordEncoder corretos.
     */
    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(authProvider);
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Object scope = jwt.getClaim("scope");
            if (scope instanceof String scopeString) {
                return Arrays.stream(scopeString.split(" "))
                    .filter(s -> !s.isBlank())
                    .map(s -> (GrantedAuthority) new SimpleGrantedAuthority(s))
                    .toList();
            }
            if (scope instanceof Iterable<?> scopeList) {
                return StreamSupport.stream(scopeList.spliterator(), false)
                    .map(Object::toString)
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .map(s -> (GrantedAuthority) new SimpleGrantedAuthority(s))
                    .toList();
            }
            return List.of();
        });
        return converter;
    }
}
