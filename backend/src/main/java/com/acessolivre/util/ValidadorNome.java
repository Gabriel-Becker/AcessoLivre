package com.acessolivre.util;

import java.util.Locale;

public class ValidadorNome {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    public static String normalizar(String nome) {
        if (nome == null) {
            return null;
        }

        String nomeNormalizado = nome.trim().replaceAll("\\s+", " ");
        if (nomeNormalizado.isEmpty()) {
            return nomeNormalizado;
        }

        String[] palavras = nomeNormalizado.split(" ");
        StringBuilder resultado = new StringBuilder();

        for (int i = 0; i < palavras.length; i++) {
            if (i > 0) {
                resultado.append(' ');
            }
            resultado.append(capitalizarPalavra(palavras[i]));
        }

        return resultado.toString();
    }

    private static String capitalizarPalavra(String palavra) {
        if (palavra == null || palavra.isEmpty()) {
            return "";
        }

        if (palavra.length() == 1) {
            return palavra.toUpperCase(PT_BR);
        }

        return palavra.substring(0, 1).toUpperCase(PT_BR)
            + palavra.substring(1).toLowerCase(PT_BR);
    }
}