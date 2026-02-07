from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
import cv2
import numpy as np
import base64
from backend.app.ai_service import extract_exam_and_insights

router = APIRouter()

# --- OCR Routes ---
@router.post("/ocr/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # Use Gemini AI for extraction
        result = extract_exam_and_insights(contents, file.content_type)
        
        if "error" in result:
             return {"status": "error", "message": result["error"]}
             
        # Normalize response to match frontend expectation
        # Frontend expects: { "text": "...", "questions": [...] }
        # Gemini returns: { "questions": [...], "insights": "..." }
        
        # We can construct a "text" representation or just return what we have
        # The frontend likely uses 'questions' array directly if available.
        
        return {
            "status": "success", 
            "filename": file.filename, 
            "text": "Extracted via Tesseract", # Placeholder as we have structured data
            "questions": result.get("questions", []),
            "insights": result.get("insights", "")
        }

    except Exception as e:
        print(f"Error processing file: {e}")
        return {"status": "error", "message": str(e)}

# --- Monitor Routes ---
# Ensure haarcascade is available. If not, this might fail on startup, but standard cv2 usually has it.
try:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
except Exception:
    face_cascade = None
    print("Warning: Haarcascade not found")

class FrameData(BaseModel):
    session_id: str
    image: str

@router.post("/analyze_frame")
def analyze_frame(data: FrameData):
    if face_cascade is None:
        return {"status": "Error", "message": "Face detection unavailble"}
        
    try:
        # Decode image
        if "," in data.image:
            encoded_data = data.image.split(',')[1]
        else:
            encoded_data = data.image  
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return {"status": "Error", "message": "Invalid image"}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        face_count = len(faces)
        is_suspicious = False
        reason = ""

        if face_count == 0:
            is_suspicious = True
            reason = "No face detected"
        elif face_count > 1:
            is_suspicious = True
            reason = f"Multiple faces detected ({face_count})"

        # Return analysis result without DB update
        return {
            "status": "Flagged" if is_suspicious else "Active", 
            "face_count": face_count,
            "reason": reason if is_suspicious else None
        }

    except Exception as e:
        print(f"Error analyzing frame: {e}")
        return {"status": "Error", "message": str(e)}
