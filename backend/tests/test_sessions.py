"""
Tests for session management endpoints.

Covers: create, get, list, submit, terminate, delete, logs, timing, messaging,
and report generation.
"""

from unittest.mock import patch


class TestCreateSession:
    """Tests for POST /api/sessions"""

    def test_create_session_success(self, client):
        response = client.post(
            "/api/sessions",
            json={
                "studentId": "student-001",
                "student_name": "Test Student",
                "examId": "exam-001",
                "examTitle": "Midterm Exam",
                "exam_type": "University",
                "duration_minutes": 60,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert data["session_id"].startswith("auto_")

    def test_create_session_default_duration(self, client):
        response = client.post(
            "/api/sessions",
            json={
                "studentId": "student-002",
                "student_name": "Another Student",
                "examId": "exam-002",
                "examTitle": "Quiz",
                "exam_type": "Quiz",
            },
        )
        assert response.status_code == 200

    def test_create_session_missing_required_fields(self, client):
        response = client.post("/api/sessions", json={"studentId": "student-001"})
        assert response.status_code == 422


class TestGetSession:
    """Tests for GET /api/sessions/{session_id}"""

    def test_get_active_session(self, client_with_session):
        response = client_with_session.get("/api/sessions/session-001")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "session-001"
        assert data["status"] == "Active"
        assert data["student_name"] == "Test Student"
        assert data["trust_score"] == 100

    def test_get_nonexistent_session(self, client):
        response = client.get("/api/sessions/nonexistent-id")
        assert response.status_code == 404

    def test_get_completed_session_returns_minimal_data(self, client_with_session, mock_db_with_session):
        session_ref = mock_db_with_session.collection("sessions").document("session-001")
        session_ref.update({"status": "Completed", "score": 85})

        response = client_with_session.get("/api/sessions/session-001")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Completed"
        assert data["score"] == 85

    def test_get_terminated_session(self, client_with_session, mock_db_with_session):
        session_ref = mock_db_with_session.collection("sessions").document("session-001")
        session_ref.update({"status": "Terminated", "termination_reason": "Multiple faces detected"})

        response = client_with_session.get("/api/sessions/session-001")
        data = response.json()
        assert data["status"] == "Terminated"
        assert data["termination_reason"] == "Multiple faces detected"


class TestGetActiveSessions:
    """Tests for GET /api/sessions"""

    def test_list_active_sessions_empty(self, client):
        response = client.get("/api/sessions")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_active_sessions_with_data(self, client_with_session):
        response = client_with_session.get("/api/sessions")
        assert response.status_code == 200
        sessions = response.json()
        assert len(sessions) >= 1


class TestSubmitExam:
    """Tests for POST /api/sessions/{session_id}/submit"""

    def test_submit_nonexistent_session(self, client):
        response = client.post(
            "/api/sessions/nonexistent/submit",
            json={"answers": {"q1": "0"}},
        )
        assert response.status_code == 404

    def test_submit_already_completed(self, client_with_session, mock_db_with_session):
        session_ref = mock_db_with_session.collection("sessions").document("session-001")
        session_ref.update({"status": "Completed"})

        response = client_with_session.post(
            "/api/sessions/session-001/submit",
            json={"answers": {"q1": "0"}},
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Already submitted"

    def test_submit_successful_mcq_grading(self, client, mock_db):
        mock_db.collection("exams").document("exam-mcq").set({
            "title": "MCQ Test",
            "questions": [
                {"id": 0, "text": "2+2?", "type": "mcq", "options": ["3", "4", "5"], "correct_answer": 1}
            ]
        })
        mock_db.collection("sessions").document("sess-mcq").set({
            "status": "Active",
            "exam_id": "exam-mcq",
            "student_id": "stud_1",
            "trust_score": 100,
        })

        response = client.post(
            "/api/sessions/sess-mcq/submit",
            json={"answers": {"0": "1"}}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Exam submitted successfully"
        assert data["score"] == 1.0


class TestTerminateExam:
    """Tests for POST /api/sessions/{session_id}/terminate"""

    def test_terminate_session(self, client_with_session):
        response = client_with_session.post(
            "/api/sessions/session-001/terminate",
            params={"reason": "Proctor manual termination"},
        )
        assert response.status_code == 200
        assert "terminated successfully" in response.json()["message"]

    def test_terminate_nonexistent_session(self, client):
        response = client.post(
            "/api/sessions/nonexistent/terminate",
            params={"reason": "Test"},
        )
        assert response.status_code == 404


class TestDeleteSession:
    """Tests for DELETE /api/sessions/{session_id}"""

    def test_delete_session(self, client_with_session):
        response = client_with_session.delete("/api/sessions/session-001")
        assert response.status_code == 200
        assert "deleted successfully" in response.json()["message"]


class TestSessionLogs:
    """Tests for violation logging endpoints."""

    def test_log_violation(self, client_with_session):
        response = client_with_session.post(
            "/api/sessions/session-001/log",
            json={"message": "Looked away from screen", "timestamp": "2026-01-01T00:01:00"},
        )
        assert response.status_code == 200

    def test_log_violation_reduces_trust(self, client_with_session, mock_db_with_session):
        client_with_session.post(
            "/api/sessions/session-001/log",
            json={"message": "Looking away", "timestamp": "2026-01-01T00:01:00"},
        )
        session_data = mock_db_with_session.collection("sessions").document("session-001")._data
        assert session_data["trust_score"] < 100

    def test_log_locked_violation_high_penalty(self, client_with_session, mock_db_with_session):
        client_with_session.post(
            "/api/sessions/session-001/log",
            json={"message": "Locked window violation", "timestamp": "2026-01-01T00:01:00"},
        )
        session_data = mock_db_with_session.collection("sessions").document("session-001")._data
        assert session_data["trust_score"] <= 70

    def test_get_session_logs(self, client_with_session):
        client_with_session.post(
            "/api/sessions/session-001/log",
            json={"message": "Log 1", "timestamp": "2026-01-01T00:01:00"},
        )
        response = client_with_session.get("/api/sessions/session-001/logs")
        assert response.status_code == 200
        assert len(response.json()) >= 1


class TestSessionStatus:
    """Tests for GET /api/sessions/{session_id}/status"""

    def test_get_status(self, client_with_session):
        response = client_with_session.get("/api/sessions/session-001/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Active"
        assert data["trust_score"] == 100

    def test_get_status_nonexistent(self, client):
        response = client.get("/api/sessions/nonexistent/status")
        assert response.status_code == 404


class TestQuestionTiming:
    """Tests for POST /api/sessions/{session_id}/log-timing"""

    def test_log_timing(self, client_with_session):
        response = client_with_session.post(
            "/api/sessions/session-001/log-timing",
            json={"index": 0, "duration_ms": 45000},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "saved"


class TestMessaging:
    """Tests for session messaging endpoints."""

    def test_send_message(self, client_with_session):
        response = client_with_session.post(
            "/api/sessions/session-001/message", json={"message": "Please focus on the exam"}
        )
        assert response.status_code == 200
        assert response.json()["status"] == "Message Sent"

    def test_mark_message_read(self, client_with_session, mock_db_with_session):
        client_with_session.post("/api/sessions/session-001/message", json={"message": "Please focus on the exam"})

        response = client_with_session.post("/api/sessions/session-001/message/read")
        assert response.status_code == 200
        assert response.json()["status"] == "Marked as read"

        session_data = mock_db_with_session.collection("sessions").document("session-001")._data
        assert session_data["is_message_read"] is True


class TestBulkCreateSessions:
    """Tests for POST /api/sessions/bulk"""

    def test_bulk_create(self, client_with_students):
        response = client_with_students.post(
            "/api/sessions/bulk",
            json={
                "studentIds": ["student-1", "student-2"],
                "examId": "exam-001",
                "examTitle": "Final Exam",
                "exam_type": "University",
                "duration_minutes": 90,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "sessions" in data
        assert len(data["sessions"]) == 2


class TestGenerateReport:
    """Tests for POST /api/sessions/{session_id}/generate-report"""

    def test_generate_report_nonexistent(self, client):
        response = client.post("/api/sessions/nonexistent/generate-report")
        assert response.status_code == 404

    @patch("backend.app.ai_service.generate_exam_report")
    def test_generate_report_successful(self, mock_gen_report, client, mock_db):
        mock_gen_report.return_value = {
            "summary": "Completed without violations.",
            "trust_score": 98,
            "suspicious_moments": []
        }

        mock_db.collection("sessions").document("sess_rep_1").set({
            "status": "Completed",
            "score": 10,
            "total": 10,
            "trust_score": 98
        })

        response = client.post("/api/sessions/sess_rep_1/generate-report")
        assert response.status_code == 200
        data = response.json()
        assert data["trust_score"] == 98
