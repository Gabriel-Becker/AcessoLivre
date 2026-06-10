package com.acessolivre.enums;

public enum StatusDenuncia {
    PENDING("Pendente"),
    REVIEWED("Em análise"),
    RESOLVED("Resolvido"),
    REJECTED("Rejeitado");

    private final String descricao;

    StatusDenuncia(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}