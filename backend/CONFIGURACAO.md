# ⚙️ Guia de Configuração - AcessoLivre Backend

## 📋 Configuração de Variáveis de Ambiente

O backend do **AcessoLivre** utiliza variáveis de ambiente para todas as configurações, seguindo as melhores práticas do [12-Factor App](https://12factor.net/config).

### 🚀 Quick Start

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Edite o `.env` com suas configurações:**
   ```bash
   # No Windows (PowerShell)
   notepad .env
   
   # No Linux/Mac
   nano .env
   # ou
   vim .env
   ```

3. **Configure as variáveis obrigatórias:**
   - `SPRING_DATASOURCE_PASSWORD` - Senha do PostgreSQL
   - `MAIL_USERNAME` e `MAIL_PASSWORD` - Credenciais de email
   - `ADMIN_BOOTSTRAP_SECRET` - Segredo para criar primeiro admin

---

## 📁 Arquivos de Configuração

### Estrutura
```
backend/
├── .env.example          # Template com todas as variáveis
├── .env                  # Suas configurações (não commitado)
├── .env.dev              # Exemplo para desenvolvimento local
└── src/main/resources/
    ├── application.properties           # Configurações base
    ├── application-dev.properties       # Profile de desenvolvimento
    ├── application-test.properties      # Profile de testes
    └── application-prod.properties      # Profile de produção
```

### ⚠️ Importante
- **NUNCA** commite o arquivo `.env` com senhas reais
- Use `.env.example` como template
- O `.env` está no `.gitignore` por segurança

---

## 🔧 Variáveis de Ambiente

### 🖥️ Server Configuration
| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `SERVER_PORT` | Porta do servidor | `8080` | Sim |

### 🌐 CORS Configuration
| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `CORS_ALLOWED_ORIGINS` | Origins permitidas (separadas por vírgula) | `http://localhost:3000,http://localhost:4200` | Sim |

### 🗄️ Database Configuration
| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | URL do banco PostgreSQL | `jdbc:postgresql://localhost:5432/acessolivre` | Sim |
| `SPRING_DATASOURCE_DRIVER` | Driver JDBC | `org.postgresql.Driver` | Sim |
| `SPRING_DATASOURCE_USERNAME` | Usuário do banco | `postgres` | Sim |
| `SPRING_DATASOURCE_PASSWORD` | Senha do banco | `sua_senha` | Sim |
| `POSTGRES_DB` | Nome do banco (Docker) | `acessolivre` | Sim (Docker) |
| `POSTGRES_USER` | Usuário (Docker) | `postgres` | Sim (Docker) |
| `POSTGRES_PASSWORD` | Senha (Docker) | `postgres` | Sim (Docker) |

### 🔐 JWT Configuration
| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `JWT_PUBLIC_KEY` | Chave pública RSA | `classpath:app.pub` | Sim |
| `JWT_PRIVATE_KEY` | Chave privada RSA | `classpath:app.key` | Sim |
| `JWT_TOKEN_EXPIRATION_DEFAULT` | Expiração padrão (ms) | `3600000` (1h) | Sim |
| `JWT_TOKEN_EXPIRATION_REMEMBER_ME` | Expiração "lembrar-me" (ms) | `604800000` (7 dias) | Sim |

### 📧 Email Configuration
| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `MAIL_HOST` | Servidor SMTP | `smtp.gmail.com` | Sim |
| `MAIL_PORT` | Porta SMTP | `587` | Sim |
| `MAIL_USERNAME` | Email de envio | `seu_email@gmail.com` | Sim |
| `MAIL_PASSWORD` | Senha/App Password | `senha_de_app` | Sim |
| `MAIL_SMTP_AUTH` | Autenticação SMTP | `true` | Sim |
| `MAIL_SMTP_STARTTLS` | TLS habilitado | `true` | Sim |
| `MAIL_SMTP_SSL_TRUST` | Confiança SSL | `*` | Sim |

### 🔒 Admin Bootstrap
| Variável | Descrição | Exemplo | Obrigatória |
|----------|-----------|---------|-------------|
| `ADMIN_BOOTSTRAP_SECRET` | Segredo para criar primeiro admin | Gere com `openssl rand -base64 32` | Sim (primeira vez) |

### 📊 Logging Configuration
| Variável | Descrição | Valores | Padrão |
|----------|-----------|---------|--------|
| `LOG_LEVEL_ROOT` | Nível raiz | `TRACE, DEBUG, INFO, WARN, ERROR` | `INFO` |
| `LOG_LEVEL_SPRING` | Spring Framework | `TRACE, DEBUG, INFO, WARN, ERROR` | `INFO` |
| `LOG_LEVEL_HIBERNATE` | Hibernate | `TRACE, DEBUG, INFO, WARN, ERROR` | `WARN` |
| `LOG_LEVEL_APP` | Aplicação (com.acessolivre) | `TRACE, DEBUG, INFO, WARN, ERROR` | `DEBUG` |
| `LOG_LEVEL_SCHEDULER` | Schedulers | `TRACE, DEBUG, INFO, WARN, ERROR` | `INFO` |

### 🎭 Profiles
| Variável | Descrição | Valores | Padrão |
|----------|-----------|---------|--------|
| `SPRING_PROFILES_ACTIVE` | Profile ativo | `dev`, `test`, `prod` | `dev` |

---

## 🌍 Profiles Explicados

### 🔧 `dev` - Desenvolvimento
- Logs detalhados (DEBUG)
- SQL visível no console
- DevTools habilitado
- Hot reload ativado
- Thymeleaf sem cache

**Quando usar:** Desenvolvimento local, debugging

### 🧪 `test` - Testes
- Banco H2 em memória
- Logs reduzidos
- SQL desabilitado
- Email mock (não envia emails reais)
- DevTools desabilitado

**Quando usar:** Execução de testes automatizados

### 🚀 `prod` - Produção
- Logs apenas INFO/WARN/ERROR
- SQL desabilitado (performance + segurança)
- DDL-auto = `validate` (não altera banco)
- DevTools desabilitado
- Cache habilitado
- Compressão HTTP ativada

**Quando usar:** Ambiente de produção

---

## 🐳 Configuração Docker

### Desenvolvimento Local (dev.docker-compose.yml)
```bash
# 1. Configure o .env
cp .env.example .env

# 2. Edite o .env com:
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/acessolivre
POSTGRES_PASSWORD=postgres

# 3. Suba os containers
docker-compose -f dev.docker-compose.yml up --build
```

### Produção (prod.docker-compose.yml)
```bash
# 1. Use arquivo .env de produção
cp .env.example .env

# 2. Configure variáveis de produção
SPRING_PROFILES_ACTIVE=prod
JPA_DDL_AUTO=validate

# 3. Suba os containers
docker-compose -f prod.docker-compose.yml up -d
```

---

## 📧 Configurando Email (Gmail)

### Passo a Passo:
1. Acesse [Google Account Security](https://myaccount.google.com/security)
2. Ative **Verificação em duas etapas**
3. Vá em **Senhas de app**
4. Gere uma senha de app para "Mail"
5. Use essa senha no `.env`:
   ```bash
   MAIL_USERNAME=seu_email@gmail.com
   MAIL_PASSWORD=senha_de_app_gerada_aqui
   ```

---

## 🔑 Gerando Admin Bootstrap Secret

```bash
# Linux/Mac/Git Bash
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Coloque o resultado em:
```bash
ADMIN_BOOTSTRAP_SECRET=resultado_aqui
```

---

## ✅ Checklist de Configuração

Antes de rodar o backend, verifique:

- [ ] Arquivo `.env` criado e configurado
- [ ] Senha do PostgreSQL definida
- [ ] Credenciais de email configuradas
- [ ] Admin bootstrap secret gerado
- [ ] Profile correto definido (`dev`, `test`, ou `prod`)
- [ ] Porta 8080 disponível
- [ ] PostgreSQL rodando (se local) ou Docker funcionando

---

## 🆘 Problemas Comuns

### ❌ "Cannot load driver class: org.postgresql.Driver"
**Solução:** PostgreSQL não está rodando ou URL incorreta

### ❌ "Authentication failed for user"
**Solução:** Verifique `SPRING_DATASOURCE_PASSWORD` no `.env`

### ❌ "Port 8080 is already in use"
**Solução:** Mude `SERVER_PORT` no `.env` ou pare o processo usando a porta

### ❌ "Could not send email"
**Solução:** Verifique credenciais de email e senha de app

---

## 📚 Referências

- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [12-Factor App - Config](https://12factor.net/config)
- [PostgreSQL JDBC](https://jdbc.postgresql.org/)
- [Spring Profiles](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.profiles)

---

**Última atualização:** 24/11/2025  
**Projeto:** AcessoLivre - TCS Senac 2026
