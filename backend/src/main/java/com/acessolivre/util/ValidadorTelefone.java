package com.acessolivre.util;

import java.util.regex.Pattern;

public class ValidadorTelefone {
    
    private static final Pattern TELEFONE_PATTERN = Pattern.compile(
        "^\\(?([0-9]{2})\\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$"
    );

    public static boolean ehValido(String telefone) {
        if (telefone == null || telefone.trim().isEmpty()) {
            return false;
        }
        
        String cleaned = limpar(telefone);
        
        if (cleaned.length() < 10 || cleaned.length() > 11) {
            return false;
        }
        
        return TELEFONE_PATTERN.matcher(telefone).matches();
    }

    public static String formatar(String telefone) {
        if (telefone == null || telefone.trim().isEmpty()) {
            return telefone;
        }
        
        String cleaned = limpar(telefone);
        
        if (cleaned.length() == 10) {
            return String.format("(%s) %s-%s",
                cleaned.substring(0, 2),
                cleaned.substring(2, 6),
                cleaned.substring(6)
            );
        } else if (cleaned.length() == 11) {
            return String.format("(%s) %s-%s",
                cleaned.substring(0, 2),
                cleaned.substring(2, 7),
                cleaned.substring(7)
            );
        }
        
        return telefone;
    }

    public static String limpar(String telefone) {
        if (telefone == null) {
            return null;
        }
        return telefone.replaceAll("[^0-9]", "");
    }
}
