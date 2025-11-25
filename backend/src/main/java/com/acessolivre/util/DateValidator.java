package com.acessolivre.util;

import java.time.LocalDate;
import java.time.Period;

public class DateValidator {
    
    public static boolean isPast(LocalDate date) {
        if (date == null) {
            return false;
        }
        return date.isBefore(LocalDate.now());
    }

    public static boolean isFuture(LocalDate date) {
        if (date == null) {
            return false;
        }
        return date.isAfter(LocalDate.now());
    }

    public static boolean isMinAge(LocalDate birthDate, int minAge) {
        if (birthDate == null) {
            return false;
        }
        
        LocalDate now = LocalDate.now();
        Period period = Period.between(birthDate, now);
        return period.getYears() >= minAge;
    }

    public static int calculateAge(LocalDate birthDate) {
        if (birthDate == null) {
            return 0;
        }
        
        LocalDate now = LocalDate.now();
        return Period.between(birthDate, now).getYears();
    }
}
