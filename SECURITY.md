# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in SecureEval, please report it responsibly:

1. **DO NOT** open a public GitHub issue for security vulnerabilities.
2. Email your findings to: **security@secureeval.dev** (or open a private security advisory on GitHub).
3. Include a detailed description of the vulnerability, steps to reproduce, and potential impact.
4. You will receive acknowledgment within 48 hours.

We appreciate responsible disclosure and will credit reporters (with permission) in our release notes.

---

## Threat Model

SecureEval handles sensitive proctoring and assessment data. The following threat model documents known attack surfaces, mitigations in place, and areas requiring ongoing vigilance.

### 1. Attacker-Controlled Webcam Frames

| Threat | Risk | Mitigation |
|:-------|:-----|:-----------|
| Spoofed webcam feed (virtual camera) | High | Server-side face count verification via OpenCV Haar Cascades (defense-in-depth alongside client-side MediaPipe) |
| Oversized or malformed image payloads | Medium | Pydantic `field_validator` enforces max payload size (10 MB) on `FrameData.image`; `cv2.imdecode` validates image format |
| Denial of Service via rapid frame submission | Medium | Rate limiting recommended (not yet enforced — see Planned Mitigations) |

### 2. Student Request Forgery

| Threat | Risk | Mitigation |
|:-------|:-----|:-----------|
| Student modifies exam answers after submission | High | Server checks `status == 'Completed'` before processing; once submitted, session is immutable |
| Student submits answers for another student's session | High | Firestore security rules validate `resource.data.studentId == request.auth.uid` |
| Student accesses admin endpoints | High | Firebase Admin custom claims (`role: 'admin'`) enforced on admin routes; Firestore rules restrict collection access by role |

### 3. Admin Credential Compromise

| Threat | Risk | Mitigation |
|:-------|:-----|:-----------|
| Firebase Admin SDK credentials exposed | Critical | Credentials stored via environment variables (`.env`), never hardcoded; `.env` files are in `.gitignore` |
| Admin session hijack | Medium | Firebase Authentication handles session tokens with built-in expiration and refresh |

### 4. Data Privacy (PII / Proctoring Data)

| Threat | Risk | Mitigation |
|:-------|:-----|:-----------|
| Webcam images stored permanently | Low | Frames are analyzed in-memory and discarded; no persistent image storage |
| Student exam data accessible to unauthorized users | High | Firestore security rules restrict read/write by user role and ownership |
| Monitoring logs expose student behavior patterns | Medium | Logs stored in Firestore subcollections with session-level access control |

### 5. AI Service Abuse

| Threat | Risk | Mitigation |
|:-------|:-----|:-----------|
| Prompt injection via exam content | Medium | AI prompts use structured templates; student input is passed as data, not instructions |
| API key exposure | Critical | `GEMINI_API_KEY` loaded from environment, never committed to source; `pip-audit` and `npm audit` run in CI |

---

## Security Controls in Place

- ✅ **No hardcoded secrets** — All sensitive values loaded from environment variables
- ✅ **Firebase security rules** — Role-based access control on all Firestore collections
- ✅ **Input validation** — Pydantic models validate request payloads; image size limits enforced
- ✅ **Error sanitization** — Global exception handler returns generic error messages; full traces logged server-side only
- ✅ **Dependency auditing** — `pip-audit` and `npm audit` run in CI pipeline
- ✅ **Non-root Docker execution** — Dockerfile creates and runs as `appuser`
- ✅ **CORS configuration** — Configurable via `CORS_ORIGINS` environment variable

## Planned Mitigations

- ⬜ Rate limiting on `/api/analyze_frame` and `/api/sessions/*/submit`
- ⬜ Request-level authentication middleware for all admin API routes
- ⬜ Content Security Policy (CSP) headers
- ⬜ Automated secret scanning in CI (e.g., `gitleaks`)

---

## Supported Versions

| Version | Supported |
|:--------|:----------|
| 2.5.x   | ✅ Current |
| < 2.5   | ❌ No longer supported |
