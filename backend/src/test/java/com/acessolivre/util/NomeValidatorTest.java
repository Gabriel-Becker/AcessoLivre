package com.acessolivre.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class NomeValidatorTest {

    @Test
    void normalize_DeveRetornarNuloQuandoEntradaNula() {
        assertNull(NomeValidator.normalize(null));
    }

    @Test
    void normalize_DeveNormalizarEspacosECapitalizarTodasAsPalavras() {
        String nomeNormalizado = NomeValidator.normalize("  teste   um   local  ");

        assertEquals("Teste Um Local", nomeNormalizado);
    }

    @Test
    void normalize_DeveConverterPalavrasComCaixaMista() {
        String nomeNormalizado = NomeValidator.normalize("mArIa dA sIlVa");

        assertEquals("Maria Da Silva", nomeNormalizado);
    }
}
