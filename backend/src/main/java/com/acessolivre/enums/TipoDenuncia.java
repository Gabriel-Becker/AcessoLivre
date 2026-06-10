package com.acessolivre.enums;

public enum TipoDenuncia {
    LOCAL("Local"),
    COMENTARIO("Comentário"),
    AVALIACAO("Avaliação"),
    USUARIO("Usuário");

    private final String descricao;

    TipoDenuncia(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}