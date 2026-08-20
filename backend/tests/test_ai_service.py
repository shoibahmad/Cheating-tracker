"""
Tests for AI service module.

Covers: exam extraction, evaluation, report generation,
semantic consistency, question generation, and JSON parsing.
"""

import json
from unittest.mock import MagicMock, patch

import pytest

from backend.app.ai_service import (
    _parse_ai_json,
    _safe_get_response_text,
    check_semantic_consistency,
    evaluate_exam_submission,
    extract_exam_and_insights,
    generate_exam_report,
    generate_questions_from_content,
)


class TestParseAiJson:
    """Tests for the _parse_ai_json helper."""

    def test_parse_plain_json(self):
        result = _parse_ai_json('{"key": "value"}')
        assert result == {"key": "value"}

    def test_parse_json_with_code_fence(self):
        text = '```json\n{"key": "value"}\n```'
        result = _parse_ai_json(text)
        assert result == {"key": "value"}

    def test_parse_json_with_generic_fence(self):
        text = '```\n{"key": "value"}\n```'
        result = _parse_ai_json(text)
        assert result == {"key": "value"}

    def test_parse_json_with_whitespace(self):
        text = '  \n  {"key": "value"}  \n  '
        result = _parse_ai_json(text)
        assert result == {"key": "value"}

    def test_parse_invalid_json_raises(self):
        with pytest.raises(json.JSONDecodeError):
            _parse_ai_json("not json at all")

    def test_parse_nested_json(self):
        text = '```json\n{"questions": [{"id": 1, "text": "Q1"}]}\n```'
        result = _parse_ai_json(text)
        assert len(result["questions"]) == 1


class TestSafeGetResponseText:
    """Tests for the _safe_get_response_text helper."""

    def test_normal_response(self):
        mock_response = MagicMock()
        mock_response.text = "Hello World"
        assert _safe_get_response_text(mock_response) == "Hello World"

    def test_response_with_error(self):
        mock_response = MagicMock()
        mock_response.text = property(lambda self: (_ for _ in ()).throw(Exception("blocked")))
        type(mock_response).text = property(lambda self: (_ for _ in ()).throw(Exception("blocked")))
        result = _safe_get_response_text(mock_response)
        assert result is None


class TestEvaluateExamSubmission:
    """Tests for the evaluate_exam_submission function."""

    def test_mcq_correct_answer(self):
        questions = [{"id": 0, "text": "What is 2+2?", "type": "mcq", "correct_answer": 1}]
        answers = {"0": "1"}

        result = evaluate_exam_submission(questions, answers)
        assert result["score"] == 1.0
        assert result["total_questions"] == 1
        assert result["feedback"]["0"]["correct"] is True

    def test_mcq_incorrect_answer(self):
        questions = [{"id": 0, "text": "What is 2+2?", "type": "mcq", "correct_answer": 1}]
        answers = {"0": "3"}

        result = evaluate_exam_submission(questions, answers)
        assert result["score"] == 0.0
        assert result["feedback"]["0"]["correct"] is False

    def test_mcq_no_answer(self):
        questions = [{"id": 0, "text": "What is 2+2?", "type": "mcq", "correct_answer": 1}]
        answers = {}

        result = evaluate_exam_submission(questions, answers)
        assert result["score"] == 0.0

    def test_mixed_mcq_grading(self):
        questions = [
            {"id": 0, "text": "Q1", "type": "mcq", "correct_answer": 0},
            {"id": 1, "text": "Q2", "type": "mcq", "correct_answer": 2},
            {"id": 2, "text": "Q3", "type": "mcq", "correct_answer": 1},
        ]
        answers = {"0": "0", "1": "2", "2": "3"}

        result = evaluate_exam_submission(questions, answers)
        assert result["score"] == 2.0  # Q1 and Q2 correct
        assert result["total_questions"] == 3

    def test_empty_questions(self):
        result = evaluate_exam_submission([], {})
        assert result["score"] == 0
        assert result["total_questions"] == 0

    @patch("backend.app.ai_service.genai")
    def test_descriptive_with_ai_grading(self, mock_genai):
        mock_response = MagicMock()
        mock_response.text = json.dumps({"results": [{"id": "0", "score": 0.8, "remarks": "Good answer"}]})
        mock_model = MagicMock()
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        questions = [{"id": 0, "text": "Explain OOP", "type": "descriptive"}]
        answers = {"0": "Object-oriented programming is a paradigm..."}

        result = evaluate_exam_submission(questions, answers)
        assert result["score"] == 0.8
        assert result["feedback"]["0"]["remarks"] == "Good answer"


class TestExtractExamAndInsights:
    """Tests for the extract_exam_and_insights function."""

    @patch("backend.app.ai_service.genai")
    def test_successful_extraction(self, mock_genai):
        mock_response = MagicMock()
        mock_response.text = json.dumps({"questions": [{"text": "Q1", "type": "mcq"}], "insights": "Easy exam"})
        mock_model = MagicMock()
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        result = extract_exam_and_insights(b"fake-image-bytes", "image/png")
        assert "questions" in result
        assert len(result["questions"]) == 1

    @patch("backend.app.ai_service.genai")
    def test_extraction_with_invalid_json(self, mock_genai):
        mock_response = MagicMock()
        mock_response.text = "This is not JSON"
        mock_model = MagicMock()
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        result = extract_exam_and_insights(b"fake-image-bytes", "image/png")
        assert "error" in result

    @patch("backend.app.ai_service.API_KEY", None)
    def test_extraction_without_api_key(self):
        with pytest.raises(Exception, match="GEMINI_API_KEY not configured"):
            extract_exam_and_insights(b"fake-image", "image/png")


class TestGenerateExamReport:
    """Tests for the generate_exam_report function."""

    @patch("backend.app.ai_service.genai")
    def test_successful_report(self, mock_genai):
        mock_response = MagicMock()
        mock_response.text = json.dumps(
            {"trust_score": 75, "summary": "Minor violations detected.", "suspicious_moments": ["Tab switch at 5:00"]}
        )
        mock_model = MagicMock()
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        result = generate_exam_report(
            [{"message": "Tab switch", "timestamp": "2026-01-01T00:05:00"}], score=8, total_questions=10
        )
        assert result["trust_score"] == 75
        assert "suspicious_moments" in result

    @patch("backend.app.ai_service.API_KEY", None)
    def test_report_without_api_key(self):
        result = generate_exam_report([], 0, 0)
        assert result["summary"] == "AI analysis unavailable."

    @patch("backend.app.ai_service.genai")
    def test_report_truncates_long_logs(self, mock_genai):
        mock_response = MagicMock()
        mock_response.text = json.dumps({"trust_score": 50, "summary": "Many violations.", "suspicious_moments": []})
        mock_model = MagicMock()
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        long_logs = [{"message": f"Log {i}", "timestamp": f"2026-01-01T00:{i:02d}:00"} for i in range(100)]
        result = generate_exam_report(long_logs, 5, 10)
        assert "trust_score" in result


class TestCheckSemanticConsistency:
    """Tests for the check_semantic_consistency function."""

    def test_empty_answers(self):
        result = check_semantic_consistency([])
        assert result["suspicion_score"] == 0

    @patch("backend.app.ai_service.API_KEY", None)
    def test_without_api_key(self):
        result = check_semantic_consistency(["Some answer"])
        assert result["suspicion_score"] == 0


class TestGenerateQuestionsFromContent:
    """Tests for the generate_questions_from_content function."""

    @patch("backend.app.ai_service.API_KEY", None)
    def test_without_api_key(self):
        result = generate_questions_from_content("Some content")
        assert result == {"questions": []}

    @patch("backend.app.ai_service.genai")
    def test_successful_generation(self, mock_genai):
        mock_response = MagicMock()
        mock_response.text = json.dumps(
            {
                "title": "Generated Exam",
                "questions": [
                    {"text": "Q1", "type": "mcq", "options": ["A", "B", "C", "D"], "correct_answer": 0, "marks": 1}
                ],
            }
        )
        mock_model = MagicMock()
        mock_model.generate_content.return_value = mock_response
        mock_genai.GenerativeModel.return_value = mock_model

        result = generate_questions_from_content("Python is a programming language...")
        assert "questions" in result
        assert len(result["questions"]) >= 1
