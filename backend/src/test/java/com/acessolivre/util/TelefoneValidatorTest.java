package com.acessolivre.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TelefoneValidatorTest {

    @Test
    void isValid_deveRetornarTrue_paraTelefoneValido() {
        assertTrue(TelefoneValidator.isValid("(11) 98765-4321"));
        assertTrue(TelefoneValidator.isValid("(11) 1234-5678"));
    }

    @Test
    void isValid_deveRetornarFalse_paraTelefoneInvalido() {
        assertFalse(TelefoneValidator.isValid("abc"));
        assertFalse(TelefoneValidator.isValid("(1) 98765-4321"));
        assertFalse(TelefoneValidator.isValid("(11) 987-4321"));
    }

    @Test
    void isValid_deveRetornarFalse_paraTelefoneNulo() {
        assertFalse(TelefoneValidator.isValid(null));
    }

    @Test
    void isValid_deveRetornarFalse_paraTelefoneVazio() {
        assertFalse(TelefoneValidator.isValid(""));
    }
}
