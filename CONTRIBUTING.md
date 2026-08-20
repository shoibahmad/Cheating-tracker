# Contributing to SecureEval

Thank you for your interest in contributing to SecureEval! This guide will help you get started.

## Development Setup

### Prerequisites
- **Python 3.11+** with `pip`
- **Node.js 18+** with `npm`
- **Firebase Account** with Firestore and Authentication enabled
- **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shoibahmad/Cheating-tracker.git
   cd Cheating-tracker
   ```

2. **Backend setup:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys
   
   pip install -r requirements.txt
   pip install -r backend/requirements-dev.txt
   ```

3. **Frontend setup:**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your Firebase API key
   
   npm install
   cd ..
   ```

4. **Run the development servers:**
   ```bash
   # Terminal 1 — Backend
   python -m uvicorn backend.main:app --reload
   
   # Terminal 2 — Frontend
   cd frontend && npm run dev
   ```

### Using Docker Compose

```bash
docker compose up
```

This starts both backend (port 8000) and frontend (port 5173).

---

## Running Tests

### Backend Tests & Coverage Gate
```bash
# Run all tests with enforced 75% coverage gate
pytest backend/tests/ -v --cov=backend/app --cov-fail-under=75 --cov-report=term-missing

# Run a specific test file
pytest backend/tests/test_sessions.py -v
```

### Static Type Checking
```bash
# Typecheck backend modules with Mypy
mypy backend/app --config-file pyproject.toml
```

### Frontend Tests & Coverage Gate
```bash
cd frontend

# Run all tests with enforced 70% coverage gate
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Linting & Formatting
```bash
# Python (ruff linter and formatter)
ruff check backend/ --config pyproject.toml
ruff format backend/ --config pyproject.toml

# JavaScript/React (eslint)
cd frontend && npm run lint
```

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `refactor`: Code refactoring (no behavior change)
- `chore`: Build process, dependency updates, CI changes
- `style`: Code formatting (no logic change)

### Examples
```
feat(backend): add rate limiting to analyze_frame endpoint
test(frontend): add AdminDashboard component tests
fix(monitoring): handle edge case with zero-length base64 images
docs: update README with Docker Compose instructions
chore(deps): pin numpy to >=1.26.0,<3.0.0
```

---

## Pull Request Process & Branch Protection

1. **Branch Protection:** The `main` branch requires all CI workflow jobs to pass before merge:
   - `backend-test` (Ruff lint, Mypy typecheck, Pytest >= 75% coverage)
   - `frontend-test` (ESLint, Vitest >= 70% coverage, Vite production build)
   - `security-audit` (Gitleaks scan, pip-audit, npm audit)

2. **Branch from `main`** using the naming convention:
   - `feat/description` for features
   - `fix/description` for bug fixes
   - `test/description` for test additions

3. **Write tests** for any new functionality. PRs without tests for new code will not be merged.

4. **Keep commits small and focused** — One logical change per commit, paired with its tests.

5. **Update documentation** if your change affects the public API or setup process.

---

## Good First Issues for External Contributors

We actively welcome contributions from the community. If you're looking for an impactful first issue, here are curated areas:

- **E2E Testing:** Add Playwright / Cypress browser proctoring integration test flows.
- **WebSocket Gateway:** Add full-duplex WebSocket channel for sub-second proctoring telemetry.
- **Accessibility (a11y):** Audit ARIA attributes across student assessment forms and question editors.
- **Multi-Factor Auth:** Add WebAuthn / FIDO2 biometric authentication for exam entry.

---

## Code Style

### Python
- Follow PEP 8 (enforced by `ruff`)
- Max line length: 120 characters
- Use type hints for function signatures and verify with `mypy backend/app`
- Use structured logging (`from backend.app.logging_config import get_logger`)
- Never use `print()` for logging

### JavaScript/JSX
- Follow the ESLint configuration in `eslint.config.js`
- Use functional components with hooks
- Keep components focused (< 200 LOC)
- Use the centralized `examsService` API layer from `services/examsService.js`

---

## Security

Please review [SECURITY.md](SECURITY.md) before contributing. Key points:

- **Never** commit API keys, credentials, or secrets
- **Never** return raw exception details to clients (use `SecureEvalError` domain exceptions)
- **Always** validate user input via Pydantic models
- Report vulnerabilities privately (see [SECURITY.md](SECURITY.md) for contact)

