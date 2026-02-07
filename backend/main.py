from dotenv import load_dotenv
import os

# Load environment variables from the same directory as main.py
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import router as api_router
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(
    title="SecureEval Tracking System API",
    description="Backend for the SecureEval platform",
    version="1.0.0"
)

# CORS config
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*"
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

# Catch-all route to serve index.html for SPA (React Router)
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # Check if the path is a file (e.g. favicon.ico, manifest.json) in root of dist
    file_path = f"frontend/dist/{full_path}"
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Otherwise, return index.html for client-side routing
    return FileResponse("frontend/dist/index.html")

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
