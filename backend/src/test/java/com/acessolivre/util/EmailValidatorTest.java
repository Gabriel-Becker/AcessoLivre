package com.acessolivre.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailValidatorTest {

    private final EmailValidator validator = new EmailValidator();

    @Test
    void isValid_deveRetornarTrue_paraEmailValido() {
        assertTrue(validator.isValid("test@example.com", null));
        assertTrue(validator.isValid("test.name@example.co.uk", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraEmailInvalido() {
        assertFalse(validator.isValid("test", null));
        assertFalse(validator.isValid("test@", null));
        assertFalse(validator.isValid("@example.com", null));
        assertFalse(validator.isValid("test@.com", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraEmailNulo() {
        assertFalse(validator.isValid(null, null));
    }
}
