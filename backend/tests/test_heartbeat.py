"""
Unit tests for the live session heartbeat and latency drift endpoint.
"""


class TestSessionHeartbeat:
    """Tests for POST /api/sessions/{session_id}/heartbeat."""

    def test_heartbeat_active_session_focused(self, client, mock_db):
        mock_db.collection("sessions").document("sess_hb1").set({
            "student_id": "stud_1",
            "status": "Active",
            "trust_score": 100,
        })

        response = client.post(
            "/api/sessions/sess_hb1/heartbeat",
            json={
                "client_timestamp": 1700000000.0,
                "tab_focused": True,
                "battery_level": 0.85,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "server_timestamp" in data
        assert "drift_ms" in data

    def test_heartbeat_tab_unfocused_logs_event(self, client, mock_db):
        mock_db.collection("sessions").document("sess_hb2").set({
            "student_id": "stud_2",
            "status": "Active",
            "trust_score": 90,
        })

        response = client.post(
            "/api/sessions/sess_hb2/heartbeat",
            json={
                "client_timestamp": 1700000000.0,
                "tab_focused": False,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"

    def test_heartbeat_nonexistent_session_returns_404(self, client):
        response = client.post(
            "/api/sessions/sess_missing/heartbeat",
            json={
                "client_timestamp": 1700000000.0,
                "tab_focused": True,
            }
        )
        assert response.status_code == 404
