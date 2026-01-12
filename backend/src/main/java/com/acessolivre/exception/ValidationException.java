package com.acessolivre.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção base para erros de validação.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ValidationException extends RuntimeException {
    
    public ValidationException(String message) {
        super(message);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }

    public static class EmailObrigatorioException extends ValidationException {
        public EmailObrigatorioException() {
            super("Email é obrigatório");
        }
    }

    public static class SenhaObrigatoriaException extends ValidationException {
        public SenhaObrigatoriaException() {
            super("Senha é obrigatória");
        }
    }

    public static class NomeObrigatorioException extends ValidationException {
        public NomeObrigatorioException() {
            super("Nome é obrigatório");
        }
    }

    public static class EmailInvalidoException extends ValidationException {
        public EmailInvalidoException() {
            super("Email inválido");
        }
    }

    public static class SenhaFracaException extends ValidationException {
        public SenhaFracaException(String mensagem) {
            super(mensagem);
        }
    }
}
