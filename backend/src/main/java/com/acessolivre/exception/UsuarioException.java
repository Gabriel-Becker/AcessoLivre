package com.acessolivre.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceções relacionadas a operações de usuário.
 */
public class UsuarioException extends RuntimeException {
    
    public UsuarioException(String message) {
        super(message);
    }

    public UsuarioException(String message, Throwable cause) {
        super(message, cause);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class UsuarioNaoEncontradoException extends UsuarioException {
        public UsuarioNaoEncontradoException() {
            super("Usuário não encontrado");
        }
        
        public UsuarioNaoEncontradoException(String mensagem) {
            super(mensagem);
        }
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    public static class EmailJaExisteException extends UsuarioException {
        public EmailJaExisteException() {
            super("Email já cadastrado");
        }
        
        public EmailJaExisteException(String email) {
            super("Email já cadastrado: " + email);
        }
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class PermissaoNegadaException extends UsuarioException {
        public PermissaoNegadaException() {
            super("Você não tem permissão para realizar esta operação");
        }
        
        public PermissaoNegadaException(String mensagem) {
            super(mensagem);
        }
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class UsuarioInativoException extends UsuarioException {
        public UsuarioInativoException() {
            super("Usuário inativo. Entre em contato com o suporte.");
        }
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public static class AutenticacaoFalhouException extends UsuarioException {
        public AutenticacaoFalhouException() {
            super("Credenciais inválidas");
        }
        
        public AutenticacaoFalhouException(String mensagem) {
            super(mensagem);
        }
    }
}
