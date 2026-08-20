"""
Health and readiness check endpoints.

Provides service health, uptime, version information, and database
connectivity checks for container orchestrators (e.g. Kubernetes, Docker).
"""

import time
from datetime import UTC, datetime

from fastapi import APIRouter, Depends

from backend.app.dependencies import get_firestore_db
from backend.app.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter()

START_TIME = time.time()
VERSION = "2.5.0"


@router.get("/health", tags=["Health"])
@router.get("/api/health", tags=["Health"])
def health_check(db=Depends(get_firestore_db)):
    """
    Health and readiness probe.

    Returns:
        JSON object containing service status, version, uptime, and database connectivity.
    """
    uptime_seconds = round(time.time() - START_TIME, 2)
    db_status = "connected" if db is not None else "disconnected"

    status = "ok" if db_status == "connected" else "degraded"

    return {
        "status": status,
        "version": VERSION,
        "uptime_seconds": uptime_seconds,
        "timestamp": datetime.now(UTC).isoformat(),
        "services": {"database": db_status, "api": "healthy"},
    }
