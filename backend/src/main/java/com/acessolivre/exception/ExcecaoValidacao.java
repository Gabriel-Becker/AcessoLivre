package com.acessolivre.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceção base para erros de validação.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ExcecaoValidacao extends RuntimeException {
    
    public ExcecaoValidacao(String message) {
        super(message);
    }

    public ExcecaoValidacao(String message, Throwable cause) {
        super(message, cause);
    }

    public static class EmailObrigatorioException extends ExcecaoValidacao {
        public EmailObrigatorioException() {
            super("Email é obrigatório");
        }
    }

    public static class SenhaObrigatoriaException extends ExcecaoValidacao {
        public SenhaObrigatoriaException() {
            super("Senha é obrigatória");
        }
    }

    public static class NomeObrigatorioException extends ExcecaoValidacao {
        public NomeObrigatorioException() {
            super("Nome é obrigatório");
        }
    }

    public static class EmailInvalidoException extends ExcecaoValidacao {
        public EmailInvalidoException() {
            super("Email inválido");
        }
    }

    public static class SenhaFracaException extends ExcecaoValidacao {
        public SenhaFracaException(String mensagem) {
            super(mensagem);
        }
    }
}
