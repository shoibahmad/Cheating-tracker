"""
Tests for session management endpoints.

Covers: create, get, list, submit, terminate, delete, logs, timing, messaging.
"""


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
        assert response.status_code == 422  # Validation error


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
        # Mark session as completed
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
        response = client.post("/api/sessions/nonexistent/submit", json={"answers": {"0": "1"}})
        assert response.status_code == 404

    def test_submit_already_completed(self, client_with_session, mock_db_with_session):
        session_ref = mock_db_with_session.collection("sessions").document("session-001")
        session_ref.update({"status": "Completed"})

        response = client_with_session.post("/api/sessions/session-001/submit", json={"answers": {"0": "1"}})
        assert response.status_code == 200
        assert response.json()["message"] == "Already submitted"


class TestTerminateExam:
    """Tests for POST /api/sessions/{session_id}/terminate"""

    def test_terminate_session(self, client_with_session):
        response = client_with_session.post("/api/sessions/session-001/terminate")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Exam terminated successfully"

    def test_terminate_nonexistent_session(self, client):
        response = client.post("/api/sessions/nonexistent/terminate")
        assert response.status_code == 404


class TestDeleteSession:
    """Tests for DELETE /api/sessions/{session_id}"""

    def test_delete_session(self, client_with_session):
        response = client_with_session.delete("/api/sessions/session-001")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Session deleted successfully"


class TestSessionLogs:
    """Tests for session logging endpoints."""

    def test_log_violation(self, client_with_session):
        response = client_with_session.post(
            "/api/sessions/session-001/log", json={"message": "Tab switch detected", "timestamp": "2026-01-01T00:05:00"}
        )
        assert response.status_code == 200
        assert response.json()["status"] == "Logged"

    def test_log_violation_reduces_trust(self, client_with_session, mock_db_with_session):
        # Log a medium-severity violation
        client_with_session.post(
            "/api/sessions/session-001/log", json={"message": "Tab switch detected", "timestamp": "2026-01-01T00:05:00"}
        )

        session_data = mock_db_with_session.collection("sessions").document("session-001")._data
        assert session_data["trust_score"] == 90  # 100 - 10 penalty

    def test_log_locked_violation_high_penalty(self, client_with_session, mock_db_with_session):
        client_with_session.post(
            "/api/sessions/session-001/log",
            json={"message": "Exam Locked - fullscreen exit", "timestamp": "2026-01-01T00:05:00"},
        )

        session_data = mock_db_with_session.collection("sessions").document("session-001")._data
        assert session_data["trust_score"] == 70  # 100 - 30 penalty

    def test_get_session_logs(self, client_with_session):
        response = client_with_session.get("/api/sessions/session-001/logs")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


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
            "/api/sessions/session-001/log-timing", json={"index": 0, "duration_ms": 45000}
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
        # Send a message first
        client_with_session.post("/api/sessions/session-001/message", json={"message": "Please focus on the exam"})

        # Mark as read
        response = client_with_session.post("/api/sessions/session-001/message/read")
        assert response.status_code == 200
        assert response.json()["status"] == "Marked as read"

        # Verify in mock DB
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
