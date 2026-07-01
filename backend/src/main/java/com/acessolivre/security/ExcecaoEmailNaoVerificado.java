package com.acessolivre.security;

public class ExcecaoEmailNaoVerificado extends RuntimeException {
    public ExcecaoEmailNaoVerificado(String message) {
        super(message);
    }
}
