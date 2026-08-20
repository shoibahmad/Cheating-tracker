"""
Tests for domain exception hierarchy and global error handlers.

Covers: SessionNotFoundError, ExamAlreadySubmittedError, FirestoreUnavailableError,
AIServiceError, and InvalidPayloadError.
"""

from backend.app.dependencies import get_firestore_db
from backend.app.errors import (
    AIServiceError,
    ExamAlreadySubmittedError,
    FirestoreUnavailableError,
    InvalidPayloadError,
    SecureEvalError,
    SessionNotFoundError,
)
from backend.main import app


class TestDomainExceptionClasses:
    """Unit tests verifying exception instantiation and attributes."""

    def test_session_not_found_error_attributes(self):
        err = SessionNotFoundError("sess_xyz")
        assert err.status_code == 404
        assert err.error_code == "SESSION_NOT_FOUND"
        assert "sess_xyz" in err.message
        assert err.details["session_id"] == "sess_xyz"

    def test_exam_already_submitted_error_attributes(self):
        err = ExamAlreadySubmittedError("sess_123")
        assert err.status_code == 400
        assert err.error_code == "EXAM_ALREADY_SUBMITTED"
        assert err.details["session_id"] == "sess_123"

    def test_firestore_unavailable_error_attributes(self):
        err = FirestoreUnavailableError("exam submission")
        assert err.status_code == 503
        assert err.error_code == "FIRESTORE_UNAVAILABLE"
        assert "exam submission" in err.message

    def test_ai_service_error_attributes(self):
        err = AIServiceError("Gemini quota exceeded", {"model": "gemini-1.5-pro"})
        assert err.status_code == 502
        assert err.error_code == "AI_SERVICE_ERROR"
        assert err.details["model"] == "gemini-1.5-pro"

    def test_invalid_payload_error_attributes(self):
        err = InvalidPayloadError("Empty answers dictionary", {"field": "answers"})
        assert err.status_code == 422
        assert err.error_code == "INVALID_PAYLOAD"
        assert err.details["field"] == "answers"

    def test_base_secure_eval_error_defaults(self):
        err = SecureEvalError("Unknown internal failure")
        assert err.status_code == 500
        assert err.error_code == "INTERNAL_SERVER_ERROR"
        assert err.details == {}


class TestGlobalExceptionHandlerIntegration:
    """Integration tests verifying HTTP endpoints return structured JSON for domain errors."""

    def test_session_not_found_returns_404_json(self, client):
        response = client.get("/api/sessions/nonexistent-session-id-999")
        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "SESSION_NOT_FOUND"
        assert "nonexistent-session-id-999" in data["message"]

    def test_database_unavailable_returns_503_json(self, client):
        # Override dependency to simulate unavailable database
        app.dependency_overrides[get_firestore_db] = lambda: None
        try:
            response = client.get("/api/sessions/session-001")
            assert response.status_code == 503
            data = response.json()
            assert data["error"] == "FIRESTORE_UNAVAILABLE"
        finally:
            app.dependency_overrides.pop(get_firestore_db, None)
