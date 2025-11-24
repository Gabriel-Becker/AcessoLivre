package com.acessolivre.enums;

public enum StatusLocal {
    ATIVO("Ativo"),
    INATIVO("Inativo"),
    EM_ANALISE("Em análise"),
    REPORTADO("Reportado");

    private final String descricao;

    StatusLocal(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
