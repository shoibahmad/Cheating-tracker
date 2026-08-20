"""
Tests for OCR upload endpoint.

Covers: file upload, type validation, size validation, error handling.
"""

import io
from unittest.mock import patch


class TestOcrUpload:
    """Tests for POST /api/ocr/upload"""

    @patch("backend.app.routes.ocr_routes.extract_exam_and_insights")
    def test_upload_image_success(self, mock_extract, client):
        mock_extract.return_value = {
            "questions": [
                {
                    "text": "What is Python?",
                    "type": "mcq",
                    "options": ["Language", "Snake", "Framework", "Database"],
                    "correctAnswer": "a",
                    "marks": 1,
                }
            ],
            "insights": "A basic CS quiz.",
        }

        # Create a minimal JPEG-like file
        fake_image = io.BytesIO(b"\xff\xd8\xff\xe0" + b"\x00" * 100)

        response = client.post("/api/ocr/upload", files={"file": ("test_exam.jpg", fake_image, "image/jpeg")})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert len(data["questions"]) == 1

    @patch("backend.app.routes.ocr_routes.extract_exam_and_insights")
    def test_upload_pdf_success(self, mock_extract, client):
        mock_extract.return_value = {"questions": [{"text": "Q1", "type": "descriptive"}], "insights": "Short quiz"}

        fake_pdf = io.BytesIO(b"%PDF-1.4" + b"\x00" * 100)

        response = client.post("/api/ocr/upload", files={"file": ("exam.pdf", fake_pdf, "application/pdf")})
        assert response.status_code == 200
        assert response.json()["status"] == "success"

    @patch("backend.app.routes.ocr_routes.extract_exam_and_insights")
    def test_upload_returns_ai_error(self, mock_extract, client):
        mock_extract.return_value = {"error": "AI Service unavailable", "questions": []}

        fake_image = io.BytesIO(b"\xff\xd8\xff\xe0" + b"\x00" * 100)

        response = client.post("/api/ocr/upload", files={"file": ("test.jpg", fake_image, "image/jpeg")})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"

    def test_upload_no_file(self, client):
        response = client.post("/api/ocr/upload")
        assert response.status_code == 422  # Missing required file

    @patch("backend.app.routes.ocr_routes.extract_exam_and_insights")
    def test_upload_unsupported_file_type(self, mock_extract, client):
        fake_file = io.BytesIO(b"not a real file")

        response = client.post("/api/ocr/upload", files={"file": ("test.exe", fake_file, "application/x-executable")})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"
        assert "Unsupported file type" in data["message"]
