package com.acessolivre.exception;

public class DenunciaException extends RuntimeException {

    public DenunciaException(String message) {
        super(message);
    }

    public DenunciaException(String message, Throwable cause) {
        super(message, cause);
    }
}