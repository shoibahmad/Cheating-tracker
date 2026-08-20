"""
Route package for the SecureEval API.

Aggregates all sub-routers into a single API router.
"""

from fastapi import APIRouter

from backend.app.routes.admin_routes import router as admin_router
from backend.app.routes.monitoring_routes import router as monitoring_router
from backend.app.routes.ocr_routes import router as ocr_router
from backend.app.routes.session_routes import router as session_router

router = APIRouter()

router.include_router(session_router)
router.include_router(admin_router)
router.include_router(monitoring_router)
router.include_router(ocr_router)
