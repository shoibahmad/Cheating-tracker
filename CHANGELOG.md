# Changelog

All notable changes to SecureEval are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.5.0] - 2026-08-20

### Added
- **Health & Readiness Probes**: `GET /health` and `GET /api/health` providing uptime, service state, and database connectivity checks.
- **Frontend Modularity**:
  - `useExamSession` custom hook extracting state, polling, timer countdown, and submission logic.
  - `ExamTimer` component with visual threshold styling (< 5 min warning, < 1 min critical).
  - `QuestionRenderer` component supporting both MCQ option selection and descriptive essay input.
  - `ProctoringMonitor` component managing video stream rendering and trust score overlays.
  - `DashboardCharts` and `SessionHistoryTable` extracted from `AdminDashboard`.
  - `dashboardStats.js` pure calculation utilities.
- **Test Infrastructure**:
  - 85+ backend unit and integration tests across session management, admin, AI grading, OCR, monitoring, database, auth, and health.
  - 25+ frontend Vitest + React Testing Library tests for pages, hooks, utilities, and components.
  - Hard coverage floor enforcement (`--cov-fail-under=60` in pytest and Vitest coverage gates).
- **Reproducible Dependency Management**:
  - Committed `requirements-lock.txt` and `backend/requirements-lock.txt` with exact version pinning (`==`).
  - Automated weekly Dependabot configuration for pip, npm, and GitHub Actions.
- **Security Hardening**:
  - Dedicated `SECURITY.md` detailing 5 core threat vectors and mitigation policies.
  - Gated CI security audit workflows (`pip-audit` and `npm audit` without failure suppression).
  - Global exception handling and sanitized 500 error responses.
  - Root `.env.example`, `backend/.env.example`, and `frontend/.env.example`.
- **Infrastructure & Onboarding**:
  - Full-stack `docker-compose.yml` for 1-command startup.
  - `CONTRIBUTING.md` guide adhering to Conventional Commits.

### Changed
- Refactored monolithic 889-line `routers.py` into modular route handlers (`session_routes`, `admin_routes`, `monitoring_routes`, `ocr_routes`, `health_routes`).
- Replaced all `print()` statements across backend with structured JSON logging (`logging_config.py`).
- Reduced `StudentExamPage.jsx` from 1035 LOC to 379 LOC.
- Reduced `AdminDashboard.jsx` from 637 LOC to 226 LOC.
