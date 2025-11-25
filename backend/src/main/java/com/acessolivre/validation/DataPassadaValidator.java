package com.acessolivre.validation;

import com.acessolivre.util.DateValidator;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;

public class DataPassadaValidator implements ConstraintValidator<DataPassada, LocalDate> {

    @Override
    public boolean isValid(LocalDate date, ConstraintValidatorContext context) {
        if (date == null) {
            return true;
        }
        return DateValidator.isPast(date);
    }
}
