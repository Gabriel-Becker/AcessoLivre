package com.acessolivre.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceções relacionadas a autenticação e autorização.
 */
public class AuthenticationException extends RuntimeException {
    
    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public static class TokenInvalidoException extends AuthenticationException {
        public TokenInvalidoException() {
            super("Token inválido ou expirado");
        }
        
        public TokenInvalidoException(String mensagem) {
            super(mensagem);
        }
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public static class TokenExpiradoException extends AuthenticationException {
        public TokenExpiradoException() {
            super("Token expirado. Faça login novamente");
        }
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public static class TokenRevogadoException extends AuthenticationException {
        public TokenRevogadoException() {
            super("Sua sessão foi encerrada. Faça login novamente");
        }
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public static class CredenciaisInvalidasException extends AuthenticationException {
        public CredenciaisInvalidasException() {
            super("Email ou senha inválidos");
        }
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class AcessoNegadoException extends AuthenticationException {
        public AcessoNegadoException() {
            super("Acesso negado");
        }
        
        public AcessoNegadoException(String mensagem) {
            super(mensagem);
        }
    }
}
