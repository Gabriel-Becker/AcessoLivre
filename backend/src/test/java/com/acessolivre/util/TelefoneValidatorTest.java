package com.acessolivre.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TelefoneValidatorTest {

    private final TelefoneValidator validator = new TelefoneValidator();

    @Test
    void isValid_deveRetornarTrue_paraTelefoneValido() {
        assertTrue(validator.isValid("(11) 98765-4321", null));
        assertTrue(validator.isValid("(11) 1234-5678", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraTelefoneInvalido() {
        assertFalse(validator.isValid("11987654321", null));
        assertFalse(validator.isValid("(11)98765-4321", null));
        assertFalse(validator.isValid("11 98765-4321", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraTelefoneNulo() {
        assertFalse(validator.isValid(null, null));
    }

    @Test
    void isValid_deveRetornarFalse_paraTelefoneVazio() {
        assertFalse(validator.isValid("", null));
    }
}
