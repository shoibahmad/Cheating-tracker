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

### Backend Tests
```bash
# Run all tests
pytest backend/tests/ -v

# Run with coverage
pytest backend/tests/ -v --cov=backend/app --cov-report=term-missing

# Run a specific test file
pytest backend/tests/test_sessions.py -v
```

### Frontend Tests
```bash
cd frontend

# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Linting
```bash
# Python (ruff)
pip install ruff
ruff check backend/

# JavaScript (eslint)
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

## Pull Request Process

1. **Branch from `main`** using the naming convention:
   - `feat/description` for features
   - `fix/description` for bug fixes
   - `test/description` for test additions

2. **Write tests** for any new functionality. PRs without tests for new code will not be merged.

3. **Ensure CI passes** — All lint, test, and audit checks must be green.

4. **Keep commits small and focused** — One logical change per commit, paired with its tests.

5. **Update documentation** if your change affects the public API or setup process.

---

## Code Style

### Python
- Follow PEP 8 (enforced by `ruff`)
- Max line length: 120 characters
- Use type hints for function signatures
- Use structured logging (`from backend.app.logging_config import get_logger`)
- Never use `print()` for logging

### JavaScript/JSX
- Follow the ESLint configuration in `eslint.config.js`
- Use functional components with hooks
- Keep components focused (< 300 LOC)
- Use the centralized `API_BASE_URL` from `config.js`

---

## Security

Please review [SECURITY.md](SECURITY.md) before contributing. Key points:

- **Never** commit API keys, credentials, or secrets
- **Never** return raw exception details to clients
- **Always** validate user input via Pydantic models
- Report vulnerabilities privately (see SECURITY.md for contact)
