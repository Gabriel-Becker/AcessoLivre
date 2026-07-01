package com.acessolivre.util;

import java.util.regex.Pattern;

public class ValidadorEmail {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );

    public static boolean ehValido(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        
        email = email.trim().toLowerCase();
        
        if (email.length() > 254) {
            return false;
        }
        
        return EMAIL_PATTERN.matcher(email).matches();
    }

    public static String normalizar(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }
}
