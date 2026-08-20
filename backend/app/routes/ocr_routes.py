"""
OCR and document processing routes.

Handles file upload, AI-powered exam extraction from images/PDFs.
"""

from fastapi import APIRouter, File, UploadFile

from backend.app.ai_service import extract_exam_and_insights
from backend.app.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter()

# Maximum upload file size (20 MB)
MAX_UPLOAD_SIZE = 20 * 1024 * 1024

# Allowed MIME types for exam paper uploads
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
}


@router.post(
    "/ocr/upload",
    tags=["OCR Service"],
    summary="Upload Exam Paper",
    description="Uploads an image or PDF exam paper, extracts text via AI, and returns structured questions.",
)
async def upload_file(file: UploadFile = File(...)):
    try:
        # Validate file type
        if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
            logger.warning("Rejected upload with unsupported MIME type: %s", file.content_type)
            return {
                "status": "error",
                "message": f"Unsupported file type: {file.content_type}. "
                f"Supported types: {', '.join(sorted(ALLOWED_MIME_TYPES))}",
            }

        contents = await file.read()

        # Validate file size
        if len(contents) > MAX_UPLOAD_SIZE:
            logger.warning("Rejected upload exceeding size limit: %d bytes", len(contents))
            return {
                "status": "error",
                "message": f"File too large ({len(contents)} bytes). Maximum size: {MAX_UPLOAD_SIZE} bytes.",
            }

        # Use Gemini AI for extraction
        result = extract_exam_and_insights(contents, file.content_type or "image/png")

        if "error" in result:
            return {"status": "error", "message": result["error"]}

        logger.info("Successfully extracted %d questions from %s", len(result.get("questions", [])), file.filename)

        return {
            "status": "success",
            "filename": file.filename,
            "text": "Extracted via Gemini",
            "questions": result.get("questions", []),
            "insights": result.get("insights", ""),
        }

    except Exception as e:
        logger.error("Error processing uploaded file %s: %s", file.filename, e, exc_info=True)
        return {"status": "error", "message": "Failed to process uploaded file"}
