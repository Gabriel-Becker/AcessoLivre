package com.acessolivre.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TelefoneValidatorTest {

    @Test
    void isValid_deveRetornarTrue_paraTelefoneValido() {
        assertTrue(ValidadorTelefone.ehValido("(11) 98765-4321"));
        assertTrue(ValidadorTelefone.ehValido("(11) 1234-5678"));
    }

    @Test
    void isValid_deveRetornarFalse_paraTelefoneInvalido() {
        assertFalse(ValidadorTelefone.ehValido("abc"));
        assertFalse(ValidadorTelefone.ehValido("(1) 98765-4321"));
        assertFalse(ValidadorTelefone.ehValido("(11) 987-4321"));
    }

    @Test
    void isValid_deveRetornarFalse_paraTelefoneNulo() {
        assertFalse(ValidadorTelefone.ehValido(null));
    }

    @Test
    void isValid_deveRetornarFalse_paraTelefoneVazio() {
        assertFalse(ValidadorTelefone.ehValido(""));
    }
}
