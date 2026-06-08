# AcessoLivre

> **A plataforma que mapeia, avalia e promove locais acessíveis em sua cidade!**

---

## Sobre o AcessoLivre
O **AcessoLivre** é um ecossistema digital (backend + mobile) dedicado a promover a inclusão e a acessibilidade urbana. Aqui, cidadãos podem descobrir, avaliar e compartilhar informações sobre a acessibilidade de locais, ajudando a construir uma comunidade mais consciente e uma cidade mais preparada para todos.

---

## 👤 Para Usuários
- **Descubra locais acessíveis:** Encontre locais através de uma busca detalhada com filtros por cidade, nome e critérios de acessibilidade.
- **Avalie a acessibilidade:** Após visitar um local, contribua com sua avaliação detalhada sobre os critérios de acessibilidade disponíveis.
- **Compartilhe sua experiência:** Adicione novos locais ao mapa e ajude a comunidade a crescer.
- **Acompanhe seu histórico:** Veja todos os locais que você avaliou e suas contribuições.

---

## 🧑‍💻 Para Desenvolvedores e Administradores
- **API Robusta:** Um backend completo para gerenciar locais, usuários, avaliações e imagens.
- **Segurança:** Autenticação baseada em JWT para proteger rotas e dados dos usuários.
- **Gerenciamento de Conteúdo:** Painel administrativo para moderar usuários, locais e avaliações.
- **Portfólio de Acessibilidade:** Cada local possui uma página com detalhes, fotos e notas de avaliação.

---

## 🌟 Funcionalidades Principais
- **Cadastro e autenticação de usuários** com JWT.
- **Mapeamento e cadastro de locais** com informações de endereço e categorias.
- **Sistema de avaliação** com critérios específicos de acessibilidade.
- **Upload de fotos** para ilustrar a acessibilidade dos locais.
- **Busca inteligente:** Encontre locais por nome, cidade ou filtros de acessibilidade.
- **Segurança:** Autenticação em dois fatores (2FA) e recuperação de senha.
- **Painel administrativo** para gestão completa do sistema.

---

## 💡 Nossa Missão
Conectar pessoas a locais acessíveis, tornando a vida urbana mais inclusiva e transparente. Queremos valorizar estabelecimentos que se preocupam com a acessibilidade e dar voz à comunidade para que compartilhem suas experiências, construindo juntos um mapa da inclusão.

---

## 🚀 Junte-se à comunidade AcessoLivre!
Se você busca locais acessíveis ou quer ajudar a mapear sua cidade, o AcessoLivre é para você. Venha fazer parte desta rede que valoriza a inclusão e a mobilidade para todos!

---

**AcessoLivre** — Construindo um mapa da acessibilidade, juntos! 🎉

## Tecnologias utilizadas

### Backend
- Java 17
- Spring Boot 3
- Spring Security (JWT)
- Spring Data JPA / Hibernate
- PostgreSQL
- Docker / Docker Compose
- Swagger (OpenAPI)
- Testes com JUnit e JaCoCo

### Frontend
- React Native
- Expo
- React Navigation
- Axios
- Context API para gerenciamento de estado

## Como rodar o projeto

### Pré-requisitos
- Java 17+
- Node.js 18+
- PostgreSQL
- Docker

### Backend
1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/AcessoLivre.git
   cd AcessoLivre/backend
   ```
2. Configure as variáveis de ambiente para o banco de dados (verifique `application.properties`).
3. Rode o backend com Docker Compose (recomendado):
   ```bash
   docker-compose -f dev.docker-compose.yml up --build
   ```
   Ou, para rodar localmente:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend
1. No diretório raiz:
   ```bash
   cd ../frontend
   npm install
   ```
2. Inicie o app com Expo:
   ```bash
   npx expo start
   ```

## Contribuição
1. Faça um fork do projeto.
2. Crie uma branch para sua feature: `git checkout -b minha-feature`
3. Faça o commit de suas alterações: `git commit -m 'feat: Minha nova feature'`
4. Faça o push para o seu fork: `git push origin minha-feature`
5. Abra um Pull Request.
---

**AcessoLivre** — Construindo um mapa da acessibilidade, juntos!

