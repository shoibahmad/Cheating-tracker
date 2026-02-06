from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import router as api_router
from backend.app.database import create_db_and_tables

app = FastAPI(
    title="SecureEval Tracking System API",
    description="Backend for the SecureEval platform",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

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

# Serve React static assets
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# mount assets - checks if directory exists to avoid errors during development if dist is missing
if os.path.exists("frontend/dist/assets"):
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
