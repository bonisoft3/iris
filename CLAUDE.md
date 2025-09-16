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

### Seven Environment Model
Iris follows a seven-environment development model: pkg, cli, ide, container, k8s, cld (cloud), and xpl (crossplane).

## Context-Dependent Commands

The core development commands adapt their behavior based on the current directory's technology stack. This unified interface works through configuration files in each service/GUI directory.

### Prerequisites

Before using the context-dependent commands, ensure your environment is properly set up:

1. **Check Environment Status**: Run `just doctor` to see which environment components are available:
   - **pkg**: Package manager (pkgx/scoop) 
   - **cli**: CLI tools (cue, aider)
   - **ide**: IDE integration (vtr - vscode-task-runner)
   - **cnt**: Container tools (docker)
   - **k8s**: Kubernetes tools (kind, skaffold)
   - **cld**: Cloud tools (gcloud)
   - **xpl**: Crossplane

2. **Install Missing Tools**: Some tools need manual installation:
   ```bash
   # Install vscode-task-runner for build/test commands
   pipx install vscode-task-runner
   
   # Other tools are installed via just setup in relevant directories
   ```

### `just setup` - Install Development Dependencies
**Context-dependent dependency installation based on `.pkgx.yaml`**

- **guis/web**: Installs `nodejs.org@22.14.0 pnpm.io@9.15.2`
- **services/shelfie**: Installs `buf@1.32.1 go@1.22 github.com/gotestyourself/gotestsum@1.12.0`  
- **services/tracker**: Installs `openjdk.org@21.0.3.6`

The command reads each directory's `.pkgx.yaml` file and:
- **Linux/Mac**: Uses `pkgx` to install dependencies
- **Windows**: Uses `scoop` with platform-specific package names
- **Recursive**: Calls local `.sayt.nu` files if present

### `just build` - Compile Code
**Delegates to VS Code tasks via vscode-task-runner (vtr)**

- **guis/web**: `pnpm turbo --filter ./guis/web assemble` (TypeScript compilation)
- **services/tracker**: `./gradlew assemble` (Kotlin/Java compilation)  
- **services/shelfie**: `go build -o app` with dependencies on `sqlc-generate` and `buf-generate`

**Requirements**: 
- `vtr` (vscode-task-runner) must be installed: `pipx install vscode-task-runner`
- Language-specific compilers (Node.js, Java, Go) must be available

Implementation: Reads `.vscode/tasks.json` in current directory for build configuration.

### `just test` - Run Unit Tests
**Language-appropriate testing via VS Code tasks**

- **guis/web**: `pnpm turbo --filter ./guis/web test` (Vitest unit tests)
- **services/tracker**: `./gradlew test` (JUnit/Kotest)
- **services/shelfie**: Go test suite with `gotestsum` formatting

**Requirements**: Same as `just build` - requires `vtr` and language-specific toolchains.

Implementation: Reads `.vscode/tasks.json` for test configuration specific to each tech stack.

### `just integrate` - Integration Testing
**Docker Compose integration testing in containers**

- **All services**: Builds Docker image with `target: integrate`
- **guis/web**: Runs containerized frontend integration tests
- **services/tracker**: Runs integration tests with testcontainers
- Uses service-specific `compose.yaml` with secrets and host networking

Implementation: `docker compose run --build integrate` using local compose configuration.

### Context-Switching Mechanism

The unified interface works through:

1. **`.pkgx.yaml`** - Environment-specific dependencies per directory
2. **`.vscode/tasks.json`** - Build/test commands for each technology stack
3. **`compose.yaml`** - Containerized development and integration environments
4. **`plugins/sayt/sayt.nu`** - Central orchestrator reading context from current directory

This creates a consistent developer experience where the same commands (`just setup/build/test/integrate`) work across Node.js, Kotlin, Go, and Python services by adapting to the local technology context.

### Troubleshooting

**Common Issues:**

1. **"command not found: vtr"**
   - Solution: `pipx install vscode-task-runner`

2. **Missing language compilers (go, java, node)**
   - Solution: Run `just setup` in the relevant directory to install via pkgx
   - Or install manually using your system package manager

3. **Docker commands fail**
   - Solution: Ensure Docker daemon is running and user has permissions

4. **"cli" environment shows ✗ in `just doctor`**
   - Missing tools like `cue` and `aider` - install as needed for advanced workflows

**Verification:**
- Run `just doctor` after setup to confirm environment readiness
- Each ✓ indicates that environment tier is ready for development

### Container Environment (Most Isolated)
```bash
# In any directory with compose.yaml
just develop       # Start with hot reload and debugging
just integrate     # Run integration tests with Testcontainers
```

### CLI Environment
```bash
just setup         # Install development tools for current service
just vet           # Verify environment and generated code
```

### IDE Environment
```bash
just build         # Compile code (delegates to .vscode/tasks.json)
just test          # Run unit tests (delegates to .vscode/tasks.json)
```

### Kubernetes/Preview Environment
```bash
# Requires kind cluster: kind create cluster -n iris
just preview       # Full stack deployment via Skaffold
just verify        # E2E tests against preview
```

### Cloud Environment
```bash
just stage         # Deploy to staging (skaffold run -p staging)
just publish       # Deploy to production (manual approval required)
```

### Frontend Development (guis/web, guis/shelfie)
```bash
cd guis/web  # or guis/shelfie
just dev           # Development server
just build         # Production build
just test          # Unit tests
just test:int      # Integration tests
just test:e2e      # E2E tests with Playwright
just lint          # ESLint
just type-check    # Type checking
```

### Backend Development (services/tracker)
```bash
cd services/tracker
just run           # Run service
just test          # Unit tests
just test:int      # Integration tests with Testcontainers
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

### Container Environment (Most Isolated)
- Everything happens within containers
- Avoids "works on my machine" problems
- Uses testcontainers for service dependencies
- Integration tests run in parallel with no shared resources

### CLI Environment
- Uses pkgx.sh (Linux/Mac) or scoop.sh (Windows)
- Installs development tools globally
- Leverages cuelang for code validation
- Provides copy-and-paste support across YAML configurations

### IDE Environment
- VS Code as first-class editor with .vscode configurations
- Uses vscode-test-runner (vtr) for common actions
- Delegates to .vscode/tasks.json for build and test tasks
- Unit tests are deterministic with mocked dependencies

### Preview Environment (K8s)
- Isolated deployment with mocked external dependencies
- No outbound internet except for vendored resources
- Shared services within cluster
- Code is fully optimized
- Uses kind cluster: `kind create cluster -n iris`

### Staging Environment (Cloud)
- Shared, long-lived deployment targeted by CI/CD
- Built hermetically by CI/CD pipeline
- Pushed to GCP by Skaffold
- Follows master branch on every commit

### Production Environment (Cloud)
- Manually approved from staging
- Modified configuration from staging
- Crossplane manages infrastructure
- Cloud Run for stateless services
- Cloud SQL for databases
- Firebase for authentication and real-time features
