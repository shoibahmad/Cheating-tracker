"""
Centralized logging configuration for the SecureEval backend.

Usage:
    from backend.app.logging_config import get_logger
    logger = get_logger(__name__)
"""

import json
import logging
import sys
from datetime import UTC, datetime


class StructuredFormatter(logging.Formatter):
    """JSON-structured log formatter for production observability."""

    def format(self, record):
        log_entry = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def configure_logging(level: str = "INFO", structured: bool = False):
    """
    Configure application-wide logging.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL).
        structured: If True, use JSON-structured format. Otherwise, use human-readable format.
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Remove existing handlers to avoid duplicates
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)

    if structured:
        handler.setFormatter(StructuredFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )

    root_logger.addHandler(handler)

    # Suppress noisy third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("google").setLevel(logging.WARNING)
    logging.getLogger("grpc").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a named logger instance."""
    return logging.getLogger(name)
