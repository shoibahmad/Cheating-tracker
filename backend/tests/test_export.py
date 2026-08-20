"""
Tests for exam session data export endpoint.

Covers: CSV format with header formatting, JSON structure, empty sessions handling.
"""


class TestSessionExport:
    """Tests for GET /api/admin/exams/export."""

    def test_export_sessions_as_json(self, client, mock_db):
        mock_db.collection("sessions").document("s1").set(
            {
                "student_name": "Alice",
                "student_id": "stud_1",
                "exam_title": "Math 101",
                "status": "Completed",
                "trust_score": 98,
                "score": 9,
                "percentage": 90,
                "created_at": "2026-02-01T10:00:00",
            }
        )

        response = client.get("/api/admin/exams/export?format=json")
        assert response.status_code == 200
        data = response.json()
        assert "sessions" in data
        assert data["total_count"] >= 1
        assert data["sessions"][0]["student_name"] == "Alice"

    def test_export_sessions_as_csv(self, client, mock_db):
        mock_db.collection("sessions").document("s2").set(
            {
                "student_name": "Bob",
                "student_id": "stud_2",
                "exam_title": "Chemistry",
                "status": "Active",
                "trust_score": 85,
                "score": 0,
                "percentage": 0,
                "created_at": "2026-02-02T10:00:00",
            }
        )

        response = client.get("/api/admin/exams/export?format=csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        content = response.text
        assert "Session ID,Student ID,Student Name,Exam Title" in content
        assert "Bob" in content
        assert "Chemistry" in content

    def test_export_empty_sessions(self, client):
        response = client.get("/api/admin/exams/export?format=json")
        assert response.status_code == 200
        assert response.json()["total_count"] == 0
