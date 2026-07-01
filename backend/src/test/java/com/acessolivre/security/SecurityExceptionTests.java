package com.acessolivre.security;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SecurityExceptionTests {

    @Test
    void testEmailNotVerifiedException() {
        ExcecaoEmailNaoVerificado ex = new ExcecaoEmailNaoVerificado("Email não verificado");
        assertEquals("Email não verificado", ex.getMessage());
    }

    @Test
    void testInvalidTwoFactorCodeException() {
        ExcecaoCodigoAutenticacaoInvalido ex = new ExcecaoCodigoAutenticacaoInvalido("Código 2FA inválido");
        assertEquals("Código 2FA inválido", ex.getMessage());
    }

    @Test
    void testTwoFactorRequiredException() {
        ExcecaoDoisFatoresObrigatorio ex = new ExcecaoDoisFatoresObrigatorio("Autenticação de dois fatores requerida");
        assertEquals("Autenticação de dois fatores requerida", ex.getMessage());
    }
}
