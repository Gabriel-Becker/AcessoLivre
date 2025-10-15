# Build stage
FROM eclipse-temurin:17-jdk-focal as builder
WORKDIR /app

# Instala dependências e copia arquivos
COPY . .
RUN apt-get update && apt-get install -y maven openssl

# Gera chaves RSA durante o build
RUN mkdir -p src/main/resources && \
    openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out src/main/resources/app.key && \
    openssl rsa -pubout -in src/main/resources/app.key -out src/main/resources/app.pub && \
    chmod 600 src/main/resources/app.key && \
    chmod 644 src/main/resources/app.pub

# Build da aplicação
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-focal
WORKDIR /app

# Copia o JAR
COPY --from=builder /app/target/*.jar app.jar

# Configurações de segurança
RUN chown -R 1000:1000 /app

# Porta e usuário não-root
USER 1000
EXPOSE 8080

# Comando de execução
ENTRYPOINT ["java", "-jar", "app.jar"]