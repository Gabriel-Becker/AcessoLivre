package com.acessolivre.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceções relacionadas a recuperação de senha.
 */
public class PasswordResetException extends RuntimeException {
    
    public PasswordResetException(String message) {
        super(message);
    }

    public PasswordResetException(String message, Throwable cause) {
        super(message, cause);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class CodigoInvalidoException extends PasswordResetException {
        public CodigoInvalidoException() {
            super("Código de recuperação inválido ou expirado");
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class CodigoExpiradoException extends PasswordResetException {
        public CodigoExpiradoException() {
            super("Código de recuperação expirado. Solicite um novo código");
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class CodigoJaUtilizadoException extends PasswordResetException {
        public CodigoJaUtilizadoException() {
            super("Código de recuperação já foi utilizado");
        }
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public static class EnvioEmailException extends PasswordResetException {
        public EnvioEmailException() {
            super("Erro ao enviar email de recuperação. Tente novamente mais tarde");
        }
        
        public EnvioEmailException(Throwable cause) {
            super("Erro ao enviar email de recuperação", cause);
        }
    }
}
