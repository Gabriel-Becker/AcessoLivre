package com.acessolivre.enums;

public enum Role {
    ROLE_USER("ROLE_USER", "Usuário"),
    ROLE_ADMIN("ROLE_ADMIN", "Administrador");

    private final String authority;
    private final String descricao;

    Role(String authority, String descricao) {
        this.authority = authority;
        this.descricao = descricao;
    }

    public String getAuthority() {
        return authority;
    }

    public String getDescricao() {
        return descricao;
    }

    public static Role fromString(String role) {
        for (Role r : Role.values()) {
            if (r.authority.equalsIgnoreCase(role)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Role inválida: " + role);
    }
}
