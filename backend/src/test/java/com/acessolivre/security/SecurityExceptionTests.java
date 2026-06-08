package com.acessolivre.security;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SecurityExceptionTests {

    @Test
    void testEmailNotVerifiedException() {
        EmailNotVerifiedException ex = new EmailNotVerifiedException("Email não verificado");
        assertEquals("Email não verificado", ex.getMessage());
    }

    @Test
    void testInvalidTwoFactorCodeException() {
        InvalidTwoFactorCodeException ex = new InvalidTwoFactorCodeException("Código 2FA inválido");
        assertEquals("Código 2FA inválido", ex.getMessage());
    }

    @Test
    void testTwoFactorRequiredException() {
        TwoFactorRequiredException ex = new TwoFactorRequiredException("Autenticação de dois fatores requerida");
        assertEquals("Autenticação de dois fatores requerida", ex.getMessage());
    }
}
