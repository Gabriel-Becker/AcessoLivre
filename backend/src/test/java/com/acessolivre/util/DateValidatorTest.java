package com.acessolivre.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class DateValidatorTest {

    @Test
    void isPast_deveRetornarTrue_paraDataNoPassado() {
        assertTrue(ValidadorData.ehPassado(LocalDate.now().minusDays(1)));
    }

    @Test
    void isFuture_deveRetornarTrue_paraDataNoFuturo() {
        assertTrue(ValidadorData.ehFuturo(LocalDate.now().plusDays(1)));
    }

    @Test
    void isMinAge_deveRetornarTrue_quandoAtingeIdadeMinima() {
        assertTrue(ValidadorData.ehIdadeMinima(LocalDate.now().minusYears(18), 18));
    }

    @Test
    void isMinAge_deveRetornarFalse_quandoNaoAtingeIdadeMinima() {
        assertFalse(ValidadorData.ehIdadeMinima(LocalDate.now().minusYears(17), 18));
    }

    @Test
    void calculateAge_deveCalcularIdadeEsperada() {
        assertEquals(20, ValidadorData.calcularIdade(LocalDate.now().minusYears(20)));
    }
}
