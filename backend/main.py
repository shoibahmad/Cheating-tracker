import os

from dotenv import load_dotenv

# Load environment variables from the same directory as main.py
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

import time
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.app.logging_config import configure_logging, get_logger
from backend.app.routes import router as api_router

# Configure structured logging
configure_logging(level=os.getenv("LOG_LEVEL", "INFO"), structured=os.getenv("LOG_FORMAT", "text") == "json")
logger = get_logger(__name__)

app = FastAPI(
    title="SecureEval Tracking System API",
    description="Backend for the SecureEval platform. Provides OCR, Face Detection, and Monitoring services.",
    version="2.5.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# --- Global Exception Handler ---
# Catches unhandled exceptions and returns a sanitized response
# while logging the full stack trace internally.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception on %s %s: %s\n%s", request.method, request.url.path, str(exc), traceback.format_exc()
    )
    return JSONResponse(
        status_code=500, content={"detail": "An internal server error occurred. Please try again later."}
    )


# --- Middleware ---
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    logger.info(
        "Method: %s | Path: %s | Status: %d | Duration: %.4fs",
        request.method,
        request.url.path,
        response.status_code,
        process_time,
    )

    return response


# CORS config — restrict origins via environment variable for production
allowed_origins = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(api_router, prefix="/api")

# Root-level health probe
from backend.app.routes.health_routes import router as health_router

app.include_router(health_router)


# --- Static File Serving ---
# Serve React static assets (JS, CSS, Images) from the build folder
dist_dir = os.path.join("frontend", "dist")
assets_dir = os.path.join(dist_dir, "assets")

if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_react_app(full_path: str, request: Request):
    """Serve the React SPA — static files first, then fallback to index.html."""
    # Check if a static file exists
    file_path = os.path.join(dist_dir, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)

    # Fallback to index.html for SPA routing
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)

    return JSONResponse(status_code=404, content={"message": "Frontend build not found. Please run the build script."})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
