package com.acessolivre.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class EmailValidatorTest {

    private final EmailValidator validator = new EmailValidator();

    @Test
    void isValid_deveRetornarTrue_paraEmailValido() {
        assertTrue(validator.isValid("test@example.com"));
        assertTrue(validator.isValid("test.name@example.co.uk"));
    }

    @Test
    void isValid_deveRetornarFalse_paraEmailInvalido() {
        assertFalse(validator.isValid("test"));
        assertFalse(validator.isValid("test@"));
        assertFalse(validator.isValid("@example.com"));
        assertFalse(validator.isValid("test@.com"));
    }

    @Test
    void isValid_deveRetornarFalse_paraEmailNulo() {
        assertFalse(validator.isValid(null));
    }
}
