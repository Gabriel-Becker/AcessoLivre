FROM node:20-alpine

# Instalar expo-cli globalmente
RUN npm install -g @expo/cli

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

# Expor as portas do Metro bundler e Expo
EXPOSE 8081 19000 19001 19002

# Comando para iniciar o Expo
CMD ["npm", "start", "--", "--reset-cache"]
