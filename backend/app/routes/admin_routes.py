"""
Admin management routes.

Handles admin dashboard data, student CRUD, exam history,
and exam generation.
"""

from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import auth
from firebase_admin.auth import EmailAlreadyExistsError
from pydantic import BaseModel

from backend.app.ai_service import (
    check_semantic_consistency,
    generate_questions_from_content,
)
from backend.app.dependencies import get_firestore_db
from backend.app.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter()


# --- Pydantic Models ---


class StudentModel(BaseModel):
    id: str | None = None
    full_name: str
    email: str
    password: str | None = None
    role: str = "student"
    institution: str | None = ""
    course: str | None = ""
    class_name: str | None = ""


class ContentRequest(BaseModel):
    content: str


# --- Exam History ---


@router.get("/admin/exams/history", tags=["Exam Session"])
def get_session_history(db=Depends(get_firestore_db)):
    logger.info("Fetching session history from Firestore")
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        sessions_ref = db.collection("sessions")
        docs = sessions_ref.stream()

        sessions_data = []
        for doc in docs:
            data = doc.to_dict()

            sessions_data.append(
                {
                    "id": doc.id,
                    "student_name": data.get("student_name"),
                    "studentId": data.get("studentId"),
                    "exam_title": data.get("exam_title"),
                    "exam_type": data.get("exam_type", "University"),
                    "status": data.get("status"),
                    "trust_score": data.get("trust_score"),
                    "score": data.get("score", 0),
                    "percentage": data.get("percentage", 0),
                    "total": data.get("total", 0),
                    "latest_log": data.get("latest_log"),
                    "created_at": data.get("created_at", ""),
                }
            )

        logger.info("Total sessions found: %d", len(sessions_data))
        sessions_data.sort(key=lambda x: x["created_at"] or "", reverse=True)

        return sessions_data
    except Exception as e:
        logger.error("Error fetching session history: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch session history")


# --- Student CRUD ---


@router.get("/admin/students", tags=["Student Management"])
def get_students(db=Depends(get_firestore_db)):
    logger.info("Fetching students from Firestore")
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        users_ref = db.collection("users")
        query = users_ref.where("role", "==", "student")
        docs = query.stream()

        students = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            students.append(data)

        logger.info("Found %d students in 'users' collection", len(students))
        return students
    except Exception as e:
        logger.error("Error fetching students: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch students")


@router.post("/admin/students", tags=["Student Management"])
def create_student(student: StudentModel, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        # 1. Create User in Firebase Authentication
        try:
            user_record = auth.create_user(
                email=student.email, password=student.password, display_name=student.full_name
            )
            uid = user_record.uid
        except EmailAlreadyExistsError:
            raise HTTPException(status_code=400, detail="Email already exists")
        except Exception as e:
            logger.error("Firebase Auth error creating student: %s", e)
            raise HTTPException(status_code=400, detail=f"Auth Error: {e!s}")

        # 2. Store Metadata in Firestore
        student_data = {
            "full_name": student.full_name,
            "email": student.email,
            "role": student.role,
            "institution": student.institution,
            "course": student.course,
            "class_name": student.class_name,
            "uid": uid,
        }

        db.collection("students").document(uid).set(student_data)

        # 3. Set Custom Claims
        auth.set_custom_user_claims(uid, {"role": student.role})

        logger.info("Created student %s (uid=%s)", student.email, uid)
        return {**student_data, "id": uid}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error creating student: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create student")


@router.put("/admin/students/{student_id}", tags=["Student Management"])
def update_student(student_id: str, student: StudentModel, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        # 1. Update Firestore
        user_ref = db.collection("students").document(student_id)
        if not user_ref.get().exists:
            user_ref = db.collection("users").document(student_id)
            if not user_ref.get().exists:
                raise HTTPException(status_code=404, detail="User not found")

        update_data = {
            "full_name": student.full_name,
            "email": student.email,
            "role": student.role,
            "institution": student.institution,
            "course": student.course,
            "class_name": student.class_name,
        }

        user_ref.update(update_data)

        # 2. Update Firebase Auth
        try:
            auth.update_user(
                student_id,
                email=student.email,
                display_name=student.full_name,
            )
            auth.set_custom_user_claims(student_id, {"role": student.role})
        except Exception as auth_err:
            logger.warning("Auth update warning for student %s: %s", student_id, auth_err)

        logger.info("Updated student %s", student_id)
        return {"ok": True, "message": "User updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error updating student %s: %s", student_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update student")


@router.delete("/admin/students/{student_id}", tags=["Student Management"])
def delete_student(student_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        # 1. Delete from Auth
        auth.delete_user(student_id)

        # 2. Delete from Firestore
        db.collection("students").document(student_id).delete()

        logger.info("Deleted student %s", student_id)
        return {"ok": True}
    except Exception:
        # If user not found in Auth, try deleting from Firestore anyway
        try:
            db.collection("students").document(student_id).delete()
            logger.info("Deleted student %s from Firestore (not in Auth)", student_id)
            return {"ok": True}
        except Exception as inner_e:
            logger.error("Error deleting student %s: %s", student_id, inner_e, exc_info=True)
            raise HTTPException(status_code=400, detail="Failed to delete student")


# --- AI Exam Generation ---


@router.post("/admin/generate-exam", tags=["Admin Service"])
async def generate_exam_from_text(data: ContentRequest):
    try:
        result = generate_questions_from_content(data.content)
        return result
    except Exception as e:
        logger.error("Error generating exam: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate exam")


# --- Consistency Check ---


@router.post("/sessions/{session_id}/check-consistency", tags=["Exam Session"])
async def run_consistency_check(session_id: str, db=Depends(get_firestore_db)):
    try:
        doc = db.collection("sessions").document(session_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")

        data = doc.to_dict()
        answers = data.get("answers", {})
        descriptive_answers = [str(v) for v in answers.values() if isinstance(v, str) and len(v) > 20]

        analysis = check_semantic_consistency(descriptive_answers)
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error running consistency check for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to run consistency check")
