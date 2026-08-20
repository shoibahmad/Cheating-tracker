## Description
<!-- Provide a brief description of the changes introduced in this PR. -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] ♻️ Refactoring / Cleanliness (code structure improvements, no behavior change)
- [ ] 🧪 Tests (adding new tests or fixing existing tests)
- [ ] 🔒 Security hardening
- [ ] 📝 Documentation update

## Related Issues
<!-- Link related issues e.g. Closes #123, Fixes #456 -->

## Testing Checklist
- [ ] Automated unit/integration tests added or updated
- [ ] All backend tests pass (`pytest backend/tests/ -v --cov=backend/app --cov-fail-under=60`)
- [ ] All frontend tests pass (`npm test --prefix frontend`)
- [ ] Backend linter passed (`ruff check backend/`)
- [ ] Frontend linter passed (`npm run lint --prefix frontend`)
- [ ] Verified locally in isolated environment / Docker Compose

## Security Considerations
- [ ] No hardcoded secrets or credentials
- [ ] Input validation verified with Pydantic / schemas
- [ ] Error messages do not leak internal stack traces
