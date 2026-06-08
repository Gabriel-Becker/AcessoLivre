package com.acessolivre.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {

    @Test
    void isStrong_deveRetornarTrue_paraSenhaValida() {
        assertTrue(PasswordValidator.isStrong("Password123!"));
    }

    @Test
    void isStrong_deveRetornarFalse_paraSenhaCurta() {
        assertFalse(PasswordValidator.isStrong("Pass1!"));
    }

    @Test
    void isStrong_deveRetornarFalse_paraSenhaSemMaiuscula() {
        assertFalse(PasswordValidator.isStrong("password123!"));
    }

    @Test
    void isStrong_deveRetornarFalse_paraSenhaSemMinuscula() {
        assertFalse(PasswordValidator.isStrong("PASSWORD123!"));
    }

    @Test
    void isStrong_deveRetornarFalse_paraSenhaSemNumero() {
        assertFalse(PasswordValidator.isStrong("Password!"));
    }

    @Test
    void isStrong_deveRetornarFalse_paraSenhaSemEspecial() {
        assertFalse(PasswordValidator.isStrong("Password123"));
    }

    @Test
    void getStrengthMessage_deveRetornarMensagemQuandoSenhaNula() {
        assertEquals("Senha é obrigatória", PasswordValidator.getStrengthMessage(null));
    }
}
