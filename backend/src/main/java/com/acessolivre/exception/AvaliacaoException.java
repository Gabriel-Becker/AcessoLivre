package com.acessolivre.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exceções relacionadas a operações de avaliações.
 */
public class AvaliacaoException extends RuntimeException {
    
    public AvaliacaoException(String message) {
        super(message);
    }

    public AvaliacaoException(String message, Throwable cause) {
        super(message, cause);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    public static class AvaliacaoNaoEncontradaException extends AvaliacaoException {
        public AvaliacaoNaoEncontradaException() {
            super("Avaliação não encontrada");
        }
        
        public AvaliacaoNaoEncontradaException(Long id) {
            super("Avaliação não encontrada com ID: " + id);
        }
    }

    @ResponseStatus(HttpStatus.CONFLICT)
    public static class AvaliacaoJaExisteException extends AvaliacaoException {
        public AvaliacaoJaExisteException() {
            super("Você já avaliou este local");
        }
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class AvaliacaoNaoPermitidaException extends AvaliacaoException {
        public AvaliacaoNaoPermitidaException() {
            super("Você não tem permissão para avaliar este local");
        }
        
        public AvaliacaoNaoPermitidaException(String mensagem) {
            super(mensagem);
        }
    }

    @ResponseStatus(HttpStatus.FORBIDDEN)
    public static class AvaliacaoAcessoNegadoException extends AvaliacaoException {
        public AvaliacaoAcessoNegadoException() {
            super("Você não tem permissão para modificar esta avaliação");
        }
    }
}
