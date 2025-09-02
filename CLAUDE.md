# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Iris is a waste classification AI application built as a monorepo with multiple products and services. The architecture follows a seven-environment development model: pkg, cli, ide, container, k8s, cld (cloud), and xpl (crossplane).

### Core Products
- **Iris Web**: Main PWA for waste classification (`guis/web`) - Nuxt.js application
- **Shelfie**: Book management app (`guis/shelfie`) - Vue.js with Firebase
- **Butler**: WhatsApp bot with MCP integration (`services/butler`)
- **MCP-Dev**: Model Context Protocol development servers (`services/mcp-dev`)

### Key Services
- **Tracker**: Main Kotlin/Micronaut service handling AI classification (`services/tracker`)
- **Chatbot**: Python FastAPI service for conversational features (`services/chatbot`)
- **Shelfie Backend**: Go service with gRPC API (`services/shelfie`)

### Shared Libraries
- **xproto**: Protocol Buffers definitions for cross-service communication (`libraries/xproto`)
- **pbtables**: Database schema and models (`libraries/pbtables`)
- **logs**: Centralized logging utilities (`libraries/logs`)

## Development Commands

### Environment Setup
Use `just` as the command runner for most development tasks. Install with `./bootstrap`.

### Root Level (Multi-project)
```bash
# Build all projects
pnpm build
# or
./gradlew build

# Run tests across all projects
pnpm test
./gradlew test

# Integration tests
pnpm test:int
./gradlew integrationTest

# Development mode (starts all services)
pnpm dev
```

### Frontend Development (guis/web, guis/shelfie)
```bash
cd guis/web  # or guis/shelfie
pnpm dev           # Development server
pnpm build         # Production build
pnpm test          # Unit tests
pnpm test:int      # Integration tests
pnpm test:e2e      # E2E tests with Playwright
pnpm lint          # ESLint
pnpm assemble      # Type checking
```

### Backend Development (services/tracker)
```bash
cd services/tracker
./gradlew run      # Run service
./gradlew dev      # Development mode with hot reload
./gradlew test     # Unit tests
./gradlew integrationTest  # Integration tests with Testcontainers
```

### Container Environment
```bash
# In any directory with compose.yaml
just develop       # Start with hot reload
just integrate     # Run integration tests
```

### Kubernetes/Preview Environment
```bash
# Requires kind cluster: kind create cluster -n iris
just preview       # Full stack deployment via Skaffold
just verify        # E2E tests against preview
```

### Cloud Deployment
```bash
just stage         # Deploy to staging (skaffold run -p staging)
just publish       # Deploy to production (manual approval required)
```

## Development Workflow

### Multi-language Build System
- **Root**: Gradle composite build + pnpm workspaces + Turbo
- **JVM projects**: Use Gradle with custom conventions from `plugins/jvm`
- **Node.js projects**: Use pnpm with Turbo for task orchestration
- **Infrastructure**: Crossplane for GCP resources, Skaffold for K8s deployment

### Testing Strategy
- **Unit tests**: Deterministic, mocked dependencies, fast feedback
- **Integration tests**: Testcontainers for real databases, isolated per test
- **E2E tests**: Playwright against preview environment
- **Load/screenshot tests**: Part of `just verify`

### Service Communication
- **Internal**: gRPC via protobuf definitions in `libraries/xproto`
- **External**: REST APIs, Firebase for authentication
- **Database**: PostgreSQL with CDC for real-time updates via Electric

### AI/ML Integration
The tracker service integrates with multiple AI providers:
- **Google Gemini**: Primary vision and classification model
- **OpenAI**: Alternative classification provider
- **TensorFlow.js**: Client-side image processing in web app
- **Ollama**: Local development alternative

### Infrastructure as Code
- **Local**: Docker Compose for service dependencies
- **Preview**: Kind cluster with Skaffold
- **Production**: GCP via Crossplane operators
- **Secrets**: SOPS-encrypted YAML files

## Common Patterns

### Database Migrations
- **Tracker**: Flyway migrations in `src/main/resources/db/`
- **Shelfie**: Atlas migrations in `migrations/`
- **Frontend**: Firebase schema managed through console

### Configuration Management
- **Micronaut**: YAML profiles (`application-{env}.yml`)
- **Nuxt**: Environment-specific `.env.{env}` files
- **Docker**: Compose overrides for different environments

### Monitoring and Observability
- **Logging**: Structured JSON via Pino (frontend) and Logback (backend)
- **Metrics**: Micronaut Control Panel for JVM services
- **Tracing**: Integration with Google Cloud operations

## Environment-Specific Notes

### Development (Local)
- Frontend connects to production backends by default
- Use Chrome CORS extension for local development
- Testcontainers handle service dependencies automatically

### Preview (K8s)
- Isolated deployment with mocked external dependencies
- No outbound internet except for vendored resources
- Shared services within cluster

### Production (GCP)
- Crossplane manages infrastructure
- Cloud Run for stateless services
- Cloud SQL for databases
- Firebase for authentication and real-time features