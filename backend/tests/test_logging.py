"""
Tests for structured logging configuration and JSON formatter.
"""

import json
import logging

from backend.app.logging_config import StructuredFormatter, configure_logging, get_logger


class TestStructuredLogging:
    """Tests for logging configuration and structured JSON output."""

    def test_structured_formatter_generates_valid_json(self):
        formatter = StructuredFormatter()
        record = logging.LogRecord(
            name="test_logger",
            level=logging.INFO,
            pathname=__file__,
            lineno=25,
            msg="User %s logged in from %s",
            args=("admin", "127.0.0.1"),
            exc_info=None,
        )

        formatted = formatter.format(record)
        parsed = json.loads(formatted)

        assert parsed["level"] == "INFO"
        assert parsed["logger"] == "test_logger"
        assert parsed["message"] == "User admin logged in from 127.0.0.1"
        assert "timestamp" in parsed
        assert parsed["line"] == 25

    def test_structured_formatter_with_exception(self):
        formatter = StructuredFormatter()
        try:
            raise ValueError("Test error for logging")
        except ValueError:
            import sys

            exc_info = sys.exc_info()

        record = logging.LogRecord(
            name="error_logger",
            level=logging.ERROR,
            pathname=__file__,
            lineno=45,
            msg="Exception caught",
            args=(),
            exc_info=exc_info,
        )

        formatted = formatter.format(record)
        parsed = json.loads(formatted)

        assert parsed["level"] == "ERROR"
        assert "exception" in parsed
        assert "ValueError: Test error for logging" in parsed["exception"]

    def test_configure_logging_text_and_json(self):
        configure_logging(level="DEBUG", structured=False)
        logger = get_logger("my_service")
        assert logger.name == "my_service"

        configure_logging(level="WARNING", structured=True)
        root = logging.getLogger()
        assert root.level == logging.WARNING
