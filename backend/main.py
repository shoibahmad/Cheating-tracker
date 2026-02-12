from dotenv import load_dotenv
import os

# Load environment variables from the same directory as main.py
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import router as api_router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import time
import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SecureEval Tracking System API",
    description="Backend for the SecureEval platform. Provides OCR, Face Detection, and Monitoring services.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware for Logging Requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Log details
    logger.info(
        f"Method: {request.method} | Path: {request.url.path} | "
        f"Status: {response.status_code} | Duration: {process_time:.4f}s"
    )
    
    return response

# CORS config
# CORS config
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://your-production-domain.com" # Placeholder
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")



# Serve React static assets (JS, CSS, Images)
# Mount "assets" from the build folder
app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # Setup for serving the React app
    dist_dir = "frontend/dist"
    
    # 1. Api routes are handled before this catch-all because of definition order
    # (Include router is called first)
    
    # 2. Check if a static file exists (e.g. favicon.ico, logo.png)
    file_path = os.path.join(dist_dir, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # 3. Fallback to index.html for SPA routing
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"message": "Frontend build not found. Please run build script."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
