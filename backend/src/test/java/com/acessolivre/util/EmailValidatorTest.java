package com.acessolivre.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailValidatorTest {

    private final ValidadorEmail validator = new ValidadorEmail();

    @Test
    void isValid_deveRetornarTrue_paraEmailValido() {
        assertTrue(validator.ehValido("test@example.com"));
        assertTrue(validator.ehValido("test.name@example.co.uk"));
    }

    @Test
    void isValid_deveRetornarFalse_paraEmailInvalido() {
        assertFalse(validator.ehValido("test"));
        assertFalse(validator.ehValido("test@"));
        assertFalse(validator.ehValido("@example.com"));
        assertFalse(validator.ehValido("test@.com"));
    }

    @Test
    void isValid_deveRetornarFalse_paraEmailNulo() {
        assertFalse(validator.ehValido(null));
    }
}
