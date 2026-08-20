"""
Legacy router module — kept for backward compatibility.

All routes have been decomposed into focused modules under backend.app.routes/:
  - session_routes.py: Exam session lifecycle
  - admin_routes.py: Admin dashboard and student management
  - monitoring_routes.py: Webcam frame analysis and proctoring
  - ocr_routes.py: Document upload and AI extraction

This file re-exports the aggregated router from the routes package.
"""

from backend.app.routes import router

__all__ = ["router"]
