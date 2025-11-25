package com.acessolivre.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DataPassadaValidator.class)
@Documented
public @interface DataPassada {
    String message() default "Data deve estar no passado";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
