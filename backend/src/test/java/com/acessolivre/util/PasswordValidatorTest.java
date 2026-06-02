package com.acessolivre.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {

    private final PasswordValidator validator = new PasswordValidator();

    @Test
    void isValid_deveRetornarTrue_paraSenhaValida() {
        assertTrue(validator.isValid("Password123!", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraSenhaCurta() {
        assertFalse(validator.isValid("Pass1!", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraSenhaSemMaiuscula() {
        assertFalse(validator.isValid("password123!", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraSenhaSemMinuscula() {
        assertFalse(validator.isValid("PASSWORD123!", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraSenhaSemNumero() {
        assertFalse(validator.isValid("Password!", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraSenhaSemEspecial() {
        assertFalse(validator.isValid("Password123", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraSenhaNula() {
        assertFalse(validator.isValid(null, null));
    }
}
