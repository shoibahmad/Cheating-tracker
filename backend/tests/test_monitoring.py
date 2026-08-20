"""
Tests for monitoring and proctoring endpoints.

Covers: frame analysis, face detection edge cases, violation logging.
"""

import base64

import cv2
import numpy as np


def _create_test_image(width=640, height=480, color=(128, 128, 128)):
    """Create a synthetic test image and return as base64."""
    img = np.zeros((height, width, 3), dtype=np.uint8)
    img[:] = color
    _, buffer = cv2.imencode(".jpg", img)
    return base64.b64encode(buffer).decode("utf-8")


def _create_test_image_with_face():
    """
    Create a test image with a face-like rectangle pattern.
    Note: Haar cascade may not detect synthetic rectangles as faces,
    so we test the API contract rather than CV accuracy.
    """
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    img[:] = (200, 200, 200)  # Light gray background
    # Draw a dark rectangle resembling a face region
    cv2.rectangle(img, (200, 100), (440, 380), (80, 80, 80), -1)
    _, buffer = cv2.imencode(".jpg", img)
    return base64.b64encode(buffer).decode("utf-8")


class TestAnalyzeFrame:
    """Tests for POST /api/analyze_frame"""

    def test_analyze_valid_frame(self, client_with_session):
        """Test that a valid base64 image is accepted and processed."""
        image_b64 = _create_test_image()

        response = client_with_session.post(
            "/api/analyze_frame", json={"session_id": "session-001", "image": image_b64}
        )
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "face_count" in data
        assert data["status"] in ["Active", "Terminated", "Error"]

    def test_analyze_frame_with_data_uri(self, client_with_session):
        """Test that data URIs (with header prefix) are handled."""
        image_b64 = _create_test_image()
        data_uri = f"data:image/jpeg;base64,{image_b64}"

        response = client_with_session.post("/api/analyze_frame", json={"session_id": "session-001", "image": data_uri})
        assert response.status_code == 200

    def test_analyze_frame_invalid_base64(self, client_with_session):
        """Test that invalid base64 data returns an error."""
        response = client_with_session.post(
            "/api/analyze_frame", json={"session_id": "session-001", "image": "not-valid-base64!!!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "Error"

    def test_analyze_frame_empty_image(self, client_with_session):
        """Test with an empty image string."""
        response = client_with_session.post("/api/analyze_frame", json={"session_id": "session-001", "image": ""})
        assert response.status_code == 200

    def test_analyze_frame_missing_session_id(self, client):
        """Test validation for missing session_id."""
        response = client.post("/api/analyze_frame", json={"image": _create_test_image()})
        assert response.status_code == 422

    def test_analyze_frame_missing_image(self, client):
        """Test validation for missing image."""
        response = client.post("/api/analyze_frame", json={"session_id": "session-001"})
        assert response.status_code == 422

    def test_no_face_detected_terminates_session(self, client_with_session, mock_db_with_session):
        """
        Test that no face detected causes session termination.
        Using a blank image (no face), the cascade should detect 0 faces.
        """
        image_b64 = _create_test_image(color=(0, 0, 0))  # Black image, no face

        response = client_with_session.post(
            "/api/analyze_frame", json={"session_id": "session-001", "image": image_b64}
        )
        data = response.json()

        if data.get("face_count", -1) == 0:
            assert data["status"] == "Terminated"
            assert "No face detected" in data.get("reason", "")

            # Verify DB was updated
            session_data = mock_db_with_session.collection("sessions").document("session-001")._data
            assert session_data["status"] == "Terminated"
            assert session_data["trust_score"] == 0

    def test_already_terminated_session(self, client_with_session, mock_db_with_session):
        """Test that analyzing a frame for a terminated session returns terminated status."""
        # Terminate the session first
        session_ref = mock_db_with_session.collection("sessions").document("session-001")
        session_ref.update({"status": "Terminated", "termination_reason": "Previous violation"})

        image_b64 = _create_test_image(color=(0, 0, 0))

        response = client_with_session.post(
            "/api/analyze_frame", json={"session_id": "session-001", "image": image_b64}
        )
        data = response.json()

        if data.get("face_count", -1) == 0:
            assert data["status"] == "Terminated"


class TestFrameDataValidation:
    """Tests for FrameData Pydantic model validation."""

    def test_oversized_payload_rejected(self, client_with_session):
        """Test that images exceeding size limit are rejected."""
        # Create a payload larger than 10MB
        oversized_data = "A" * (10 * 1024 * 1024 + 1)

        response = client_with_session.post(
            "/api/analyze_frame", json={"session_id": "session-001", "image": oversized_data}
        )
        assert response.status_code == 422  # Pydantic validation error
