-- Script de inicializacao do banco de dados AcessoLivre
-- Este script e executado apenas uma vez na criacao do container
-- O PostgreSQL cria o banco automaticamente via variavel POSTGRES_DB

-- Extensoes opcionais
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================
-- TABELAS DE REGISTRO PENDENTE
-- ===========================

-- Registros de usuário aguardando confirmação de email
CREATE TABLE IF NOT EXISTS pending_usuario_registro (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP NOT NULL
);

CREATE INDEX idx_pending_usuario_email ON pending_usuario_registro(email);
CREATE INDEX idx_pending_usuario_expiracao ON pending_usuario_registro(data_expiracao);

-- Códigos de verificação para confirmação de registro
CREATE TABLE IF NOT EXISTS codigo_verificacao_registro (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    codigo VARCHAR(6) NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP NOT NULL,
    data_uso TIMESTAMP
);

CREATE INDEX idx_codigo_verif_registro_email ON codigo_verificacao_registro(email);
CREATE INDEX idx_codigo_verif_registro_codigo ON codigo_verificacao_registro(codigo);
CREATE INDEX idx_codigo_verif_registro_expiracao ON codigo_verificacao_registro(data_expiracao);
