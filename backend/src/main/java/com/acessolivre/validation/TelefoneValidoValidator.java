package com.acessolivre.validation;

import com.acessolivre.util.ValidadorTelefone;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TelefoneValidoValidator implements ConstraintValidator<TelefoneValido, String> {

    @Override
    public boolean isValid(String telefone, ConstraintValidatorContext context) {
        if (telefone == null || telefone.trim().isEmpty()) {
            return true;
        }
        return ValidadorTelefone.ehValido(telefone);
    }
}
