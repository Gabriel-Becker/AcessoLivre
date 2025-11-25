package com.acessolivre.util;

import java.util.regex.Pattern;

public class PasswordValidator {
    
    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");

    public static boolean isStrong(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            return false;
        }

        return UPPERCASE_PATTERN.matcher(password).find() &&
               LOWERCASE_PATTERN.matcher(password).find() &&
               DIGIT_PATTERN.matcher(password).find() &&
               SPECIAL_CHAR_PATTERN.matcher(password).find();
    }

    public static boolean hasMinLength(String password) {
        return password != null && password.length() >= MIN_LENGTH;
    }

    public static boolean hasUppercase(String password) {
        return password != null && UPPERCASE_PATTERN.matcher(password).find();
    }

    public static boolean hasLowercase(String password) {
        return password != null && LOWERCASE_PATTERN.matcher(password).find();
    }

    public static boolean hasDigit(String password) {
        return password != null && DIGIT_PATTERN.matcher(password).find();
    }

    public static boolean hasSpecialChar(String password) {
        return password != null && SPECIAL_CHAR_PATTERN.matcher(password).find();
    }

    public static String getStrengthMessage(String password) {
        if (password == null || password.isEmpty()) {
            return "Senha é obrigatória";
        }
        
        if (!hasMinLength(password)) {
            return "Senha deve ter no mínimo " + MIN_LENGTH + " caracteres";
        }
        
        if (!hasUppercase(password)) {
            return "Senha deve conter ao menos uma letra maiúscula";
        }
        
        if (!hasLowercase(password)) {
            return "Senha deve conter ao menos uma letra minúscula";
        }
        
        if (!hasDigit(password)) {
            return "Senha deve conter ao menos um número";
        }
        
        if (!hasSpecialChar(password)) {
            return "Senha deve conter ao menos um caractere especial";
        }
        
        return null;
    }
}
