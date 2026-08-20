"""
Tests for local SQLite database engine and session generator.
"""

from sqlmodel import Session, SQLModel, create_engine, select

from backend.app.database import get_session
from backend.app.models import Student


class TestDatabase:
    """Tests for SQLite database initialization and sessions."""

    def test_create_tables_and_insert(self):
        # Create an in-memory SQLite engine for pure isolation
        test_engine = create_engine("sqlite:///:memory:")
        SQLModel.metadata.create_all(test_engine)

        with Session(test_engine) as session:
            student = Student(
                full_name="Local DB Student",
                email="local@test.com",
                password="hashed",
                role="student",
                course="Computer Science",
                class_name="2025"
            )
            session.add(student)
            session.commit()
            session.refresh(student)

            assert student.id is not None

            # Query back
            retrieved = session.exec(
                select(Student).where(Student.email == "local@test.com")
            ).first()
            assert retrieved is not None
            assert retrieved.full_name == "Local DB Student"
            assert retrieved.course == "Computer Science"

    def test_get_session_generator(self):
        generator = get_session()
        session = next(generator)
        assert isinstance(session, Session)
