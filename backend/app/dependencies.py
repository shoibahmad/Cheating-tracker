"""
FastAPI dependency injection module.

Provides injectable dependencies for Firestore, AI services, and Firebase Auth,
enabling testability without live service connections.
"""

from backend.app.firebase_setup import get_db
from backend.app.logging_config import get_logger

logger = get_logger(__name__)


def get_firestore_db():
    """
    FastAPI dependency that provides a Firestore client.

    Can be overridden in tests via app.dependency_overrides to provide
    a mock/fake Firestore client without live Firebase credentials.
    """
    db = get_db()
    if not db:
        logger.error("Failed to obtain Firestore client")
    return db


def get_ai_model():
    """
    FastAPI dependency that provides a configured Gemini AI model name.

    Can be overridden in tests to return a mock model or different model name.
    """
    return "gemini-2.5-flash"
