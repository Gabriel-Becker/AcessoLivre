package com.acessolivre.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceções relacionadas a operações de locais acessíveis.
 */
public class LocalException extends RuntimeException {
    
    public LocalException(String message) {
        super(message);
    }

    public LocalException(String message, Throwable cause) {
        super(message, cause);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class LocalNaoEncontradoException extends LocalException {
        public LocalNaoEncontradoException() {
            super("Local não encontrado");
        }
        
        public LocalNaoEncontradoException(Long id) {
            super("Local não encontrado com ID: " + id);
        }
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class LocalAcessoNegadoException extends LocalException {
        public LocalAcessoNegadoException() {
            super("Você não tem permissão para modificar este local");
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class CategoriaInvalidaException extends LocalException {
        public CategoriaInvalidaException() {
            super("Categoria inválida");
        }
        
        public CategoriaInvalidaException(String mensagem) {
            super(mensagem);
        }
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public static class TipoAcessibilidadeInvalidoException extends LocalException {
        public TipoAcessibilidadeInvalidoException() {
            super("Tipo de acessibilidade inválido");
        }
    }
}
