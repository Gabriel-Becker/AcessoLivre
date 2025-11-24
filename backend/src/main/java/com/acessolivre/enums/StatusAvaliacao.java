package com.acessolivre.enums;

public enum StatusAvaliacao {
    PENDENTE("Pendente de moderação"),
    APROVADA("Aprovada"),
    REJEITADA("Rejeitada");

    private final String descricao;

    StatusAvaliacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
