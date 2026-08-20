"""
Monitoring and proctoring routes.

Handles webcam frame analysis for face detection and
exam integrity monitoring.
"""

import base64
from datetime import UTC, datetime

import cv2
import numpy as np
from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator

from backend.app.dependencies import get_firestore_db
from backend.app.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter()

# Initialize face detection cascade
try:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
except Exception:
    face_cascade = None
    logger.warning("Haarcascade not found — face detection will be unavailable")

# Maximum base64 image payload size (10 MB)
MAX_IMAGE_PAYLOAD_SIZE = 10 * 1024 * 1024


class FrameData(BaseModel):
    session_id: str
    image: str

    @field_validator("image")
    @classmethod
    def validate_image_size(cls, v):
        """Validate that the base64 image payload is within acceptable size limits."""
        if len(v) > MAX_IMAGE_PAYLOAD_SIZE:
            raise ValueError(f"Image payload too large: {len(v)} bytes (max {MAX_IMAGE_PAYLOAD_SIZE} bytes)")
        return v


@router.post("/analyze_frame", tags=["Monitoring Service"], summary="Analyze Webcam Frame")
def analyze_frame(data: FrameData, db=Depends(get_firestore_db)):
    if face_cascade is None:
        return {"status": "Error", "message": "Face detection unavailable"}

    try:
        # Decode image
        encoded_data = data.image.split(",")[1] if "," in data.image else data.image

        try:
            decoded_bytes = base64.b64decode(encoded_data)
        except Exception:
            return {"status": "Error", "message": "Invalid base64 image data"}

        nparr = np.frombuffer(decoded_bytes, np.uint8)
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

        # DB Logging if suspicious
        if is_suspicious:
            if not db:
                logger.error("Firestore connection failed during violation logging")
                return {"status": "Error", "message": "Database error"}

            try:
                session_ref = db.collection("sessions").document(data.session_id)
                session_doc = session_ref.get()

                if session_doc.exists:
                    session_data = session_doc.to_dict()
                    if session_data.get("status") == "Active":
                        # STRICT TERMINATION LOGIC
                        termination_reason = f"Zero Tolerance Violation: {reason}"

                        # Update Session
                        session_ref.update(
                            {
                                "status": "Terminated",
                                "termination_reason": termination_reason,
                                "trust_score": 0,
                                "latest_log": f"Terminated: {reason}",
                            }
                        )

                        # Log to subcollection
                        log_entry = {"message": f"Terminated: {reason}", "timestamp": datetime.now(UTC).isoformat()}
                        session_ref.collection("logs").add(log_entry)

                        logger.warning("Session %s terminated: %s", data.session_id, termination_reason)

                        return {"status": "Terminated", "face_count": face_count, "reason": termination_reason}
                    elif session_data.get("status") == "Terminated":
                        return {
                            "status": "Terminated",
                            "face_count": face_count,
                            "reason": session_data.get("termination_reason"),
                        }

            except Exception as e:
                logger.error("Error logging violation to Firestore: %s", e, exc_info=True)

        return {"status": "Active", "face_count": face_count, "reason": None}

    except Exception as e:
        logger.error("Error analyzing frame: %s", e, exc_info=True)
        return {"status": "Error", "message": "Frame analysis failed"}
