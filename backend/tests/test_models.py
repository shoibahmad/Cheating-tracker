"""
Tests for SQLModel and database schema models.
"""

from backend.app.models import Exam, ExamSession, MonitoringLog, Question, Student


class TestModels:
    """Tests for SQLModel entity definitions."""

    def test_student_model_instantiation(self):
        student = Student(
            full_name="Jane Doe",
            email="jane@example.com",
            password="hashed_password",
            role="student",
            institution="Oxford",
            course="Physics",
            class_name="2025",
        )
        assert student.full_name == "Jane Doe"
        assert student.email == "jane@example.com"
        assert student.role == "student"

    def test_exam_and_question_models(self):
        exam = Exam(
            title="Calculus I",
            subject="Mathematics",
            created_at="2026-01-01T00:00:00",
            created_by="prof@oxford.edu",
            status="published",
        )
        assert exam.title == "Calculus I"
        assert exam.status == "published"

        question = Question(
            text="Compute derivative of x^2", options='["2x", "x", "x^3", "2"]', correct_answer=0, exam_id=1
        )
        assert question.correct_answer == 0
        assert question.exam_id == 1

    def test_exam_session_and_monitoring_log(self):
        session = ExamSession(
            student_id="student_123",
            student_name="Jane Doe",
            exam_id="exam_456",
            exam_title="Calculus I",
            status="Active",
            trust_score=100,
            created_at="2026-01-01T00:00:00",
        )
        assert session.trust_score == 100
        assert session.status == "Active"

        log = MonitoringLog(session_id=1, message="No face detected", timestamp="2026-01-01T00:05:00")
        assert log.session_id == 1
        assert "face" in log.message
