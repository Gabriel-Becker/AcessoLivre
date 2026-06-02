package com.acessolivre.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DateValidatorTest {

    private final DateValidator validator = new DateValidator();

    @Test
    void isValid_deveRetornarTrue_paraDataValida() {
        assertTrue(validator.isValid("10/10/2000", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraDataInvalida() {
        assertFalse(validator.isValid("32/10/2000", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraFormatoInvalido() {
        assertFalse(validator.isValid("10-10-2000", null));
    }

    @Test
    void isValid_deveRetornarFalse_paraDataNula() {
        assertFalse(validator.isValid(null, null));
    }

    @Test
    void isValid_deveRetornarFalse_paraDataVazia() {
        assertFalse(validator.isValid("", null));
    }
}
