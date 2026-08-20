"""
Shared test fixtures for the SecureEval backend test suite.

Provides mock Firestore database, mock AI service, and a configured
FastAPI TestClient that requires zero network access.
"""

import os
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

# Set test environment variables before any app imports
os.environ["GEMINI_API_KEY"] = "test-api-key-not-real"
os.environ["FIREBASE_CREDENTIALS"] = ""
os.environ["LOG_LEVEL"] = "WARNING"


class MockDocumentSnapshot:
    """Simulates a Firestore document snapshot."""

    def __init__(self, doc_id, data=None, exists=True):
        self.id = doc_id
        self._data = data or {}
        self.exists = exists

    def to_dict(self):
        return self._data.copy()


class MockDocumentReference:
    """Simulates a Firestore document reference."""

    def __init__(self, doc_id, data=None, exists=True):
        self.id = doc_id
        self._data = data or {}
        self._exists = exists
        self._subcollections = {}

    def get(self):
        return MockDocumentSnapshot(self.id, self._data, self._exists)

    def set(self, data):
        self._data = data
        self._exists = True

    def update(self, data):
        self._data.update(data)

    def delete(self):
        self._exists = False
        self._data = {}

    def collection(self, name):
        if name not in self._subcollections:
            self._subcollections[name] = MockCollectionReference(name)
        return self._subcollections[name]


class MockCollectionReference:
    """Simulates a Firestore collection reference."""

    def __init__(self, name="test_collection"):
        self.name = name
        self._documents = {}
        self._auto_id_counter = 0

    def document(self, doc_id=None):
        if doc_id is None:
            self._auto_id_counter += 1
            doc_id = f"auto_{self._auto_id_counter}"

        if doc_id not in self._documents:
            self._documents[doc_id] = MockDocumentReference(doc_id, exists=False)
        return self._documents[doc_id]

    def add(self, data):
        self._auto_id_counter += 1
        doc_id = f"auto_{self._auto_id_counter}"
        doc_ref = MockDocumentReference(doc_id, data, exists=True)
        self._documents[doc_id] = doc_ref
        return None, doc_ref

    def where(self, field, op, value):
        """Simple mock filtering — returns self for chaining."""
        return self

    def order_by(self, field, direction=None):
        """Simple mock ordering — returns self for chaining."""
        return self

    def limit(self, count):
        """Simple mock limit — returns self for chaining."""
        return self

    def stream(self):
        """Yield all existing documents."""
        for doc_ref in self._documents.values():
            if doc_ref._exists:
                yield MockDocumentSnapshot(doc_ref.id, doc_ref._data)


class MockFirestoreDB:
    """Simulates a Firestore database client."""

    def __init__(self):
        self._collections = {}

    def collection(self, name):
        if name not in self._collections:
            self._collections[name] = MockCollectionReference(name)
        return self._collections[name]

    def batch(self):
        return MockBatch(self)


class MockBatch:
    """Simulates a Firestore batch write."""

    def __init__(self, db):
        self.db = db
        self._operations = []

    def set(self, doc_ref, data):
        self._operations.append(("set", doc_ref, data))

    def commit(self):
        for op, doc_ref, data in self._operations:
            if op == "set":
                doc_ref.set(data)
        self._operations.clear()


@pytest.fixture
def mock_db():
    """Provides a fresh mock Firestore database for each test."""
    return MockFirestoreDB()


@pytest.fixture
def mock_db_with_session(mock_db):
    """Provides a mock DB pre-populated with a test session."""
    session_data = {
        "studentId": "student-001",
        "student_id": "student-001",
        "student_name": "Test Student",
        "examId": "exam-001",
        "exam_id": "exam-001",
        "examTitle": "Test Exam",
        "exam_title": "Test Exam",
        "exam_type": "University",
        "duration_minutes": 30,
        "duration": 30,
        "status": "Active",
        "trust_score": 100,
        "cheat_score": 0,
        "questions_attempted": 0,
        "created_at": "2026-01-01T00:00:00",
        "termination_reason": None,
    }

    session_ref = mock_db.collection("sessions").document("session-001")
    session_ref.set(session_data)

    return mock_db


@pytest.fixture
def mock_db_with_exam(mock_db_with_session):
    """Provides a mock DB with both a session and its linked exam."""
    exam_data = {
        "title": "Test Exam",
        "subject": "Computer Science",
        "questions": [
            {
                "id": 0,
                "text": "What is Python?",
                "type": "mcq",
                "options": ["A language", "A snake", "A framework", "A database"],
                "correct_answer": 0,
                "marks": 1,
            },
            {"id": 1, "text": "Explain OOP.", "type": "descriptive", "marks": 5},
        ],
        "duration": 30,
        "total_marks": 6,
    }

    exam_ref = mock_db_with_session.collection("exams").document("exam-001")
    exam_ref.set(exam_data)

    return mock_db_with_session


@pytest.fixture
def mock_db_with_students(mock_db):
    """Provides a mock DB pre-populated with test students."""
    students = [
        {
            "full_name": "Alice Smith",
            "email": "alice@test.com",
            "role": "student",
            "institution": "MIT",
            "course": "CS",
            "class_name": "2024",
        },
        {
            "full_name": "Bob Jones",
            "email": "bob@test.com",
            "role": "student",
            "institution": "MIT",
            "course": "CS",
            "class_name": "2024",
        },
    ]

    for i, s in enumerate(students):
        doc_ref = mock_db.collection("users").document(f"student-{i + 1}")
        doc_ref.set(s)

    return mock_db


@pytest.fixture
def client(mock_db):
    """
    Provides a FastAPI TestClient with all external dependencies mocked.

    - Firestore is replaced with MockFirestoreDB
    - Firebase Admin SDK initialization is patched
    - AI service calls return predictable responses
    """
    # Patch firebase_admin before importing the app
    with (
        patch("backend.app.firebase_setup.firebase_admin"),
        patch("backend.app.firebase_setup.credentials"),
        patch("backend.app.firebase_setup.get_db", return_value=mock_db),
    ):
        from backend.app.dependencies import get_firestore_db
        from backend.main import app

        app.dependency_overrides[get_firestore_db] = lambda: mock_db

        with TestClient(app) as test_client:
            yield test_client

        app.dependency_overrides.clear()


@pytest.fixture
def client_with_session(mock_db_with_session):
    """TestClient with a pre-populated session."""
    with (
        patch("backend.app.firebase_setup.firebase_admin"),
        patch("backend.app.firebase_setup.credentials"),
        patch("backend.app.firebase_setup.get_db", return_value=mock_db_with_session),
    ):
        from backend.app.dependencies import get_firestore_db
        from backend.main import app

        app.dependency_overrides[get_firestore_db] = lambda: mock_db_with_session

        with TestClient(app) as test_client:
            yield test_client

        app.dependency_overrides.clear()


@pytest.fixture
def client_with_exam(mock_db_with_exam):
    """TestClient with pre-populated session and exam."""
    with (
        patch("backend.app.firebase_setup.firebase_admin"),
        patch("backend.app.firebase_setup.credentials"),
        patch("backend.app.firebase_setup.get_db", return_value=mock_db_with_exam),
    ):
        from backend.app.dependencies import get_firestore_db
        from backend.main import app

        app.dependency_overrides[get_firestore_db] = lambda: mock_db_with_exam

        with TestClient(app) as test_client:
            yield test_client

        app.dependency_overrides.clear()


@pytest.fixture
def client_with_students(mock_db_with_students):
    """TestClient with pre-populated students."""
    with (
        patch("backend.app.firebase_setup.firebase_admin"),
        patch("backend.app.firebase_setup.credentials"),
        patch("backend.app.firebase_setup.get_db", return_value=mock_db_with_students),
    ):
        from backend.app.dependencies import get_firestore_db
        from backend.main import app

        app.dependency_overrides[get_firestore_db] = lambda: mock_db_with_students

        with TestClient(app) as test_client:
            yield test_client

        app.dependency_overrides.clear()
