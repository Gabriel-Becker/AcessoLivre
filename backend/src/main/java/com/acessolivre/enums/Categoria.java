package com.acessolivre.enums;

public enum Categoria {

    COMERCIAL("Comercial"),
    PUBLICO("Publico"),
    SAUDE("Saude"),
    EDUCACAO("Educacao"),
    LAZER("Lazer"),
    TRANSPORTE("Transporte"),
    ALIMENTACAO("Alimentacao"),
    HOSPEDAGEM("Hospedagem"),
    SERVICOS("Servicos");

    private final String descricao;

    Categoria(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}