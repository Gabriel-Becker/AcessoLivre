# 🧭 Copilot Instructions — AcessoLivre Backend (Final Version)

## 📘 Project Overview
**AcessoLivre** is a collaborative digital platform designed to promote accessibility and inclusion by allowing users to register, evaluate, and locate accessible places in urban areas.  
It is developed as part of the **TCS Senac 2026** project and follows modern Java backend standards.

### 🧱 Technology Stack
- **Language:** Java 17  
- **Framework:** Spring Boot 3  
- **ORM / Database:** Spring Data JPA + Hibernate + PostgreSQL  
- **Build Tool:** Maven  
- **Security:** JWT Authentication + Revoked Tokens + Two-Factor Auth (2FA)  
- **Containerization:** Docker + Docker Compose  
- **Validation:** Jakarta Validation  
- **Documentation:** Swagger (SpringDoc OpenAPI)  
- **Logging:** SLF4J + Lombok (`@Slf4j`)  
- **IDE Recommended:** IntelliJ IDEA / VSCode / Cursor / Copilot  

---

## 🧩 System Architecture
The project uses a **Layered Modular Architecture**, dividing the code into clear and independent responsibilities.

### 📁 Folder Structure
com.acessolivre
├── controller → REST endpoints (no business logic)
├── service → Business logic, transactions, validations
├── repository → Spring Data JPA interfaces
├── model (entity) → Database entities with JPA annotations
├── dto
│ ├── request → Input DTOs (validated)
│ └── response → Output DTOs (safe to expose)
├── mapper → Entity <-> DTO conversion logic
├── config → Security, JWT, CORS, environment
├── exception → Custom exceptions and global error handler
└── util → Utility classes (e.g., time, encryption)

### ⚙️ Architectural Principles
- **Controller Layer:**  
  - Handles HTTP requests/responses.  
  - Annotated with `@RestController`.  
  - Delegates all logic to services.  
  - Returns only DTOs, never entities.  

- **Service Layer:**  
  - Contains all business logic.  
  - Annotated with `@Service` and `@Transactional`.  
  - Logs major operations (no sensitive data).  

- **Repository Layer:**  
  - Extends `JpaRepository`.  
  - Contains only data access logic.  

- **DTO Layer:**  
  - Defines separate models for input (`request`) and output (`response`).  
  - All input DTOs use validation annotations (`@NotBlank`, `@NotNull`, `@Email`, etc.).  

- **Mapper Layer:**  
  - Converts between entities and DTOs.  
  - Each domain has a dedicated Mapper (e.g., `UsuarioMapper`, `LocalMapper`).  

- **Exception Layer:**  
  - Global error handler (`@ControllerAdvice`) standardizes responses for validation and runtime errors.  

---

## 🔐 Authentication & Security (Bloco 1)

### Components
| Class | Responsibility |
|--------|----------------|
| `Usuario` | Core user entity with role, email, and encrypted password. |
| `TokenRevogado` | Stores revoked JWT tokens for logout and invalidation. |
| `PasswordResetCode` | Manages temporary reset codes with expiration. |
| `TwoFactorRecoveryCode` | Provides optional backup 2FA codes. |

### Services
- `UsuarioService`: registration, login, password reset, token revocation, 2FA validation.  
- `TokenRevogadoService`: manages revoked tokens and ensures they can’t be reused.  
- `PasswordResetCodeService`: generates and validates reset codes.  
- `TwoFactorRecoveryCodeService`: manages two-factor backup codes.

### Endpoints (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Creates new user |
| POST | `/login` | Authenticates user and returns JWT |
| POST | `/logout` | Revokes JWT |
| POST | `/reset-password` | Generates or validates password reset code |
| POST | `/2fa` | Validates 2FA code |

### Security Implementation
- JWT-based authentication using a secret stored in `.env`.  
- `JwtUtil` handles token creation/validation.  
- `JwtAuthenticationFilter` validates tokens on every request.  
- `SecurityConfig` defines public routes (`/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`) and secures all others.  

---

## 📍 Accessible Locations (Bloco 2)

### Purpose
Allows users to register, edit, and list accessible locations, linking them to accessibility types and categories.

### Main Entities
| Entity | Description |
|---------|-------------|
| `Local` | Represents a place registered by a user |
| `Endereco` | Address data for each location |
| `Categoria` | Category of the place (restaurant, park, etc.) |
| `TipoAcessibilidade` | Accessibility features (ramp, adapted bathroom, tactile floor, etc.) |
| `Imagem` | Optional images associated with the place |

### Core Features
- CRUD operations for locations.  
- Filtering by category, type, and location (city, state).  
- Association with the user who registered the place.  
- Input validation and DTO mapping.  
- Future integration with Google Maps API (latitude/longitude).  

### Endpoints (`/api/locais`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/locais` | List all accessible locations |
| GET | `/api/locais/{id}` | Retrieve a specific location |
| POST | `/api/locais` | Create a new location |
| PUT | `/api/locais/{id}` | Update a location |
| DELETE | `/api/locais/{id}` | Delete a location |

---

## 💬 Evaluations & Engagement (Bloco 3)

### Purpose
Enable users to rate and comment on accessibility aspects of locations.

### Entities
| Entity | Description |
|---------|-------------|
| `Avaliacao` | User rating for a place (visual, motor, auditory accessibility, etc.) |
| `Comentario` | Optional text feedback |
| `Usuario` | Links evaluation to a user |
| `Local` | Links evaluation to a place |

### Core Features
- One evaluation per user per location.  
- Calculation of average ratings per location.  
- Comment moderation and spam prevention.  
- DTOs for request and response with validation.  

### Endpoints (`/api/avaliacoes`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/avaliacoes` | List all evaluations |
| POST | `/api/avaliacoes` | Add new evaluation |
| GET | `/api/avaliacoes/local/{id}` | Get evaluations for a location |

---

## ⚙️ Administration & Monitoring (Bloco 4)

### Purpose
Administrative area for monitoring, moderation, and reports.

### Key Functions
- Manage user accounts and access levels.  
- Moderate reported comments or reviews.  
- Generate statistics by region and accessibility type.  
- Export reports (PDF, CSV).  

### Endpoints (`/api/admin`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/usuarios` | List all users |
| DELETE | `/api/admin/usuarios/{id}` | Remove user |
| GET | `/api/admin/relatorios` | Generate accessibility reports |

Only users with `Role.ADMIN` can access these endpoints.  
Use `@PreAuthorize("hasRole('ADMIN')")` for access control.

---

## 📦 Configuration & Environment

**Docker Compose:**  
Contains PostgreSQL service and the backend container.  
**.env file:**
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/acessolivre
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=senha
JWT_SECRET=chave-super-segura

**application.yml:**
```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
jwt:
  secret: ${JWT_SECRET}
server:
  port: 8080
🧾 Documentation
Swagger UI:
Accessible at /swagger-ui.html when springdoc-openapi-starter-webmvc-ui is included.

Error Response Standard:

{
  "status": 400,
  "mensagem": "Campo obrigatório ausente",
  "timestamp": "2025-10-12T18:00:00"
}
Logging Rules:

Use log.info for major actions (login, registration, reset).

Use log.error for exceptions.

Never log sensitive data (passwords, tokens, codes).

🧱 Coding & Style Guidelines
Naming: Classes → PascalCase; variables & methods → camelCase.

Package name: Always start with com.acessolivre.

IDs: Always Long with @GeneratedValue(strategy = GenerationType.IDENTITY).

Annotations: Use @Data, @Builder, @NoArgsConstructor, @AllArgsConstructor for models.

Transactions: Apply @Transactional on service methods that modify data.

Validation: Always use Jakarta annotations on DTOs.

Comments: Add brief Javadoc on public classes/methods describing their purpose.

🚀 Development Workflow
Task	Command
Build	./mvnw clean install
Run	./mvnw spring-boot:run
Lint	mvn spotless:apply (if configured)
Rebuild containers	docker compose up --build
Database init	init-scripts/

Tests will be implemented after backend completion, under src/test/java/com/acessolivre.

🧠 Copilot Behavioral Rules
When Copilot generates or edits code:

✅ Must:

Follow the layered architecture (Controller → Service → Repository).

Always use DTOs and Mappers.

Validate all inputs with Jakarta annotations.

Annotate all components properly (@Service, @RestController, @Repository).

Maintain package prefix com.acessolivre.

Use consistent log messages and exception types.

Apply security via JWT as already defined.

Document new endpoints in Swagger.

❌ Must Not:

Expose model entities directly in controllers.

Log passwords, tokens, or reset codes.

Create unrelated folders like example/ or sample/.

Generate frontend code in this repository.

Add test files until explicitly instructed.

🧭 Project Roadmap Summary
Phase	Description	Status
Bloco 1	Usuário e Autenticação	✅ Completed / Refining
Bloco 2	Locais Acessíveis	🔄 In progress
Bloco 3	Avaliações e Engajamento	⏳ Next
Bloco 4	Administração e Monitoramento	⏳ Planned
Frontend	React + React Native Integration	🕓 After backend complete
Integrations	Google Maps API, Notifications, Social Login	🕓 Future milestone

📅 Maintainer Note:
This file defines all rules, structure, and conventions for the AcessoLivre backend.
It must guide all code generated or modified by GitHub Copilot.
When frontend and integrations are added, this document will be expanded — backend structure should remain unchanged.