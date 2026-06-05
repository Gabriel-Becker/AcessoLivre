package com.acessolivre.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.acessolivre.repository.UsuarioRepository;
import com.acessolivre.security.CustomUserDetailsService;
import com.acessolivre.security.JwtService;
import com.acessolivre.security.TokenResponseFilter;
import com.acessolivre.security.TokenRevogadoFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    
    @Value("${cors.allowed.origins:*}")
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
                .requestMatchers(
                    "/api/auth/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/uploads/**",
                    "/api/locais",
                    "/api/locais/**",
                    "/api/locais/buscar"
                ).permitAll()
                .requestMatchers(HttpMethod.GET,
                    "/api/avaliacoes",
                    "/api/avaliacoes/*",
                    "/api/avaliacoes/local/**"
                ).permitAll()
                .requestMatchers(HttpMethod.GET, "/api/denuncias").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/denuncias/estatisticas").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/denuncias/target").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/denuncias/check").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/denuncias/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/denuncias").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/denuncias/{id}/status").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/denuncias/status/massa").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/denuncias/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/denuncias/massa").hasRole("ADMIN")
                .requestMatchers("/api/denuncias/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        http.addFilterBefore(tokenRevogadoFilter(), UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(tokenResponseFilter(), TokenRevogadoFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("*"));
        configuration.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return customUserDetailsService;
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(daoAuthenticationProvider());
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthoritiesClaimName("scope");
        authoritiesConverter.setAuthorityPrefix("");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }
}
