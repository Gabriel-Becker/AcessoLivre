package com.acessolivre.security;

public class ExcecaoCodigoAutenticacaoInvalido extends RuntimeException {
    public ExcecaoCodigoAutenticacaoInvalido(String message) {
        super(message);
    }
}
