package com.acessolivre.enums;

public enum TipoAcessibilidade {
    RAMPA("Rampa de acesso"),
    ELEVADOR("Elevador acessível"),
    BANHEIRO_ADAPTADO("Banheiro adaptado"),
    PISO_TATIL("Piso tátil"),
    SINALIZACAO_BRAILLE("Sinalização em braille"),
    ESTACIONAMENTO("Estacionamento acessível"),
    ESPACO_AMPLO("Espaço amplo"),
    RECURSOS_AUDIOVISUAIS("Recursos audiovisuais"),
    ATENDIMENTO_ESPECIALIZADO("Atendimento especializado"),
    MOBILIARIO_ADAPTADO("Mobiliário adaptado");

    private final String descricao;

    TipoAcessibilidade(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}