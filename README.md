# AcessoLivre
Projeto de TCS Senac 2026

## Sobre o Sistema

Sistema completo de mapeamento e avaliação de locais acessíveis em cidades, promovendo inclusão e acessibilidade urbana.

**Funcionalidades:**
- Cadastro e autenticação de usuários (JWT)
- Mapeamento de locais acessíveis com fotos
- Avaliação de níveis de acessibilidade
- Filtragem por tipos de acessibilidade (rampa, elevador, banheiro adaptado, etc.)
- Sistema de avaliações e comentários
- Tema de alto contraste para acessibilidade visual

**Tecnologias:**
- **Backend**: Java 17, Spring Boot 3, PostgreSQL, JWT
- **Frontend**: React Native, Expo, React Navigation
- **Infraestrutura**: Docker, Docker Compose

## Estrutura do Projeto

```
AcessoLivre/
├── backend/              # API Spring Boot + PostgreSQL
├── frontend/             # App React Native + Expo
└── .github/
    ├── copilot-instructions.md
    ├── Referencias/
    └── plano/           # Documentação e planejamento
```

## 🐳 Executar com Docker (RECOMENDADO)

**⚠️ PRIORIDADE: Use Docker para desenvolvimento**

### Backend (Ambiente Dev)
```powershell
cd backend
docker-compose -f dev.docker-compose.yml up --build
```

Recursos do ambiente dev:
- Hot reload via Spring DevTools
- Cache de dependências Maven (`~/.m2` montado como volume)
- Debug remoto (porta 8000)
- LiveReload (porta 35729)

### Frontend
```powershell
cd frontend
docker-compose up --build
```

Portas expostas:
- **8081**: Metro Bundler
- **19000-19002**: Expo DevTools

### Parar Containers
```powershell
# Backend
cd backend
docker-compose -f dev.docker-compose.yml down

# Frontend
cd frontend
docker-compose down
```

## Executar Localmente (Alternativa)

### Backend
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### Frontend
```powershell
cd frontend
npm install
npm start
```

## Configuração

### Backend (.env)
Certifique-se de configurar as variáveis de ambiente. Exemplo em `backend/.env.example`:
- `ADMIN_BOOTSTRAP_SECRET`
- Credenciais do PostgreSQL

### Frontend (.env)
Configure as URLs da API. Exemplo em `frontend/.env.example`:
- `WEB_API_URL=http://localhost:8080/api`
- `ANDROID_API_URL=http://10.0.2.2:8080/api`
- `IOS_API_URL=http://192.168.1.100:8080/api`

## Documentação

- 📖 [Plano de Desenvolvimento](.github/plano/PLANO_DESENVOLVIMENTO.md)
- 📊 [Status do Projeto](.github/plano/STATUS.md)
- 🐳 [Docker Frontend](frontend/DOCKER.md)
- 🔧 [Configuração Backend](backend/CONFIGURACAO.md)
- 📮 [Coleção Postman](backend/postman/)

## Fluxo de Desenvolvimento

1. **Subir ambiente Docker** (backend e frontend)
2. Editar código (hot reload automático)
3. Testar endpoints via Postman ou app
4. Debug remoto (porta 8000 para backend)
5. Commit com mensagens semânticas (`feat:`, `fix:`, etc.)

## Dicas

**Backend:**
- Cache Maven em `~/.m2` acelera rebuilds
- DevTools reinicia automaticamente ao salvar
- Debug: conecte IDE em `localhost:8000` (JDWP)

**Frontend:**
- Metro Bundler limpa cache: `npm start -- --reset-cache`
- Android emulador: use `10.0.2.2` para localhost
- iOS/físico: use IP real da máquina na rede local

