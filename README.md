# AcessoLivre
Projeto de TCS Senac 2026

## Desenvolvimento com Docker (Ambiente Dev)

Para um ciclo rápido de desenvolvimento usamos `dev.dockerfile` + `dev.docker-compose.yml` com:
- Hot reload via Spring DevTools (reinicia ao salvar classes / recursos)
- Cache de dependências Maven (`~/.m2` montado como volume)
- Debug remoto (porta 8000) já habilitado
- LiveReload (porta 35729) caso esteja usando recursos estáticos Thymeleaf

### Subir ambiente
```powershell
docker compose -f backend/dev.docker-compose.yml up --build
```

### Fluxo
1. Primeiro build: baixa dependências (cacheado em `~/.m2`).
2. Editou código Java? DevTools reinicia automaticamente dentro do mesmo processo.
3. Precisa depurar? Conecte seu IDE ao endereço `localhost:8000` (JDWP).

### Variáveis (.env)
Certifique-se de ter `ADMIN_BOOTSTRAP_SECRET` e credenciais do Postgres. Exemplo completo em `.env.example`.

### Parar ambiente
```powershell
docker compose -f backend/dev.docker-compose.yml down
```

### Dicas de desempenho
- Evite limpar `~/.m2` frequentemente para manter cache.
- Se alterar apenas YAML ou arquivos estáticos, reinício é quase imediato.
- Para rebuild completo (raro): `mvn clean install` dentro do container.

