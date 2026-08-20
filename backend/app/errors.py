"""
Custom domain exception hierarchy for SecureEval backend.

Provides structured, typed exceptions with HTTP status codes and machine-readable error codes.
"""

from typing import Any


class SecureEvalError(Exception):
    """Base application exception for SecureEval."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: str = "INTERNAL_SERVER_ERROR",
        details: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}


class SessionNotFoundError(SecureEvalError):
    """Raised when a requested proctoring session cannot be found."""

    def __init__(self, session_id: str):
        super().__init__(
            message=f"Session '{session_id}' not found.",
            status_code=404,
            error_code="SESSION_NOT_FOUND",
            details={"session_id": session_id},
        )


class ExamAlreadySubmittedError(SecureEvalError):
    """Raised when an attempt is made to mutate an already completed session."""

    def __init__(self, session_id: str):
        super().__init__(
            message=f"Session '{session_id}' has already been submitted and is immutable.",
            status_code=400,
            error_code="EXAM_ALREADY_SUBMITTED",
            details={"session_id": session_id},
        )


class FirestoreUnavailableError(SecureEvalError):
    """Raised when Firestore or the underlying database connection fails."""

    def __init__(self, operation: str = "database operation"):
        super().__init__(
            message=f"Database service unavailable during {operation}.",
            status_code=503,
            error_code="FIRESTORE_UNAVAILABLE",
            details={"operation": operation},
        )


class AIServiceError(SecureEvalError):
    """Raised when the generative AI grading or extraction pipeline fails."""

    def __init__(self, message: str = "AI service pipeline failed", details: dict[str, Any] | None = None):
        super().__init__(
            message=message,
            status_code=502,
            error_code="AI_SERVICE_ERROR",
            details=details or {},
        )


class InvalidPayloadError(SecureEvalError):
    """Raised when request payload violates domain constraints."""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(
            message=message,
            status_code=422,
            error_code="INVALID_PAYLOAD",
            details=details or {},
        )
