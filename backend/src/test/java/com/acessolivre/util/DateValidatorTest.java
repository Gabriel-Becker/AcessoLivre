package com.acessolivre.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class DateValidatorTest {

    @Test
    void isPast_deveRetornarTrue_paraDataNoPassado() {
        assertTrue(DateValidator.isPast(LocalDate.now().minusDays(1)));
    }

    @Test
    void isFuture_deveRetornarTrue_paraDataNoFuturo() {
        assertTrue(DateValidator.isFuture(LocalDate.now().plusDays(1)));
    }

    @Test
    void isMinAge_deveRetornarTrue_quandoAtingeIdadeMinima() {
        assertTrue(DateValidator.isMinAge(LocalDate.now().minusYears(18), 18));
    }

    @Test
    void isMinAge_deveRetornarFalse_quandoNaoAtingeIdadeMinima() {
        assertFalse(DateValidator.isMinAge(LocalDate.now().minusYears(17), 18));
    }

    @Test
    void calculateAge_deveCalcularIdadeEsperada() {
        assertEquals(20, DateValidator.calculateAge(LocalDate.now().minusYears(20)));
    }
}
