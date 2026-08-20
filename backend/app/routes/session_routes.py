"""
Session management routes.

Handles exam session lifecycle: creation, retrieval, submission,
termination, logging, timing, and messaging using typed domain exceptions.
"""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore
from pydantic import BaseModel

from backend.app.dependencies import get_firestore_db
from backend.app.errors import (
    FirestoreUnavailableError,
    SecureEvalError,
    SessionNotFoundError,
)
from backend.app.logging_config import get_logger

logger = get_logger(__name__)

router = APIRouter()


# --- Pydantic Models ---


class CreateSessionRequest(BaseModel):
    studentId: str
    student_name: str
    examId: str
    examTitle: str
    exam_type: str
    duration_minutes: int | None = 30
    course: str | None = None
    class_name: str | None = None


class BulkCreateSessionRequest(BaseModel):
    studentIds: list[str]
    examId: str
    examTitle: str
    exam_type: str
    duration_minutes: int | None = 30


class SubmitExamRequest(BaseModel):
    answers: dict


class LogRequest(BaseModel):
    message: str
    timestamp: str


class QuestionTiming(BaseModel):
    index: int
    duration_ms: int


class MessageRequest(BaseModel):
    message: str


class HeartbeatRequest(BaseModel):
    client_timestamp: float | None = None
    tab_focused: bool = True
    battery_level: float | None = None


# --- Session CRUD ---


@router.post("/sessions", tags=["Exam Session"])
def create_session(data: CreateSessionRequest, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("create_session")

    try:
        new_session_ref = db.collection("sessions").document()

        session_data = {
            "studentId": data.studentId,
            "student_id": data.studentId,
            "student_name": data.student_name,
            "examId": data.examId,
            "exam_id": data.examId,
            "examTitle": data.examTitle,
            "exam_title": data.examTitle,
            "exam_type": data.exam_type,
            "duration_minutes": data.duration_minutes,
            "duration": data.duration_minutes,
            "course": data.course,
            "class_name": data.class_name,
            "status": "Active",
            "trust_score": 100,
            "cheat_score": 0,
            "questions_attempted": 0,
            "created_at": datetime.now(UTC).isoformat(),
            "termination_reason": None,
        }

        logger.info("Creating session for student %s with duration %d mins", data.studentId, data.duration_minutes)
        new_session_ref.set(session_data)

        return {"session_id": new_session_ref.id}
    except SecureEvalError:
        raise
    except Exception as e:
        logger.error("Error creating session: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create session")


@router.post("/sessions/bulk", tags=["Exam Session"])
def bulk_create_sessions(data: BulkCreateSessionRequest, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("bulk_create_sessions")

    try:
        results = []
        batch = db.batch()

        for student_id in data.studentIds:
            # Fetch student details
            student_doc = db.collection("users").document(student_id).get()
            if not student_doc.exists:
                student_doc = db.collection("students").document(student_id).get()

            student_data = student_doc.to_dict() if student_doc.exists else {}
            student_name = student_data.get("full_name", "Unknown")
            course = student_data.get("course", "")
            class_name = student_data.get("class_name", "")

            new_session_ref = db.collection("sessions").document()

            session_data = {
                "studentId": student_id,
                "student_id": student_id,
                "student_name": student_name,
                "examId": data.examId,
                "exam_id": data.examId,
                "examTitle": data.examTitle,
                "exam_title": data.examTitle,
                "exam_type": data.exam_type,
                "duration_minutes": data.duration_minutes,
                "duration": data.duration_minutes,
                "course": course,
                "class_name": class_name,
                "status": "Active",
                "trust_score": 100,
                "cheat_score": 0,
                "questions_attempted": 0,
                "created_at": datetime.now(UTC).isoformat(),
                "termination_reason": None,
            }

            batch.set(new_session_ref, session_data)
            results.append({"session_id": new_session_ref.id, "student_id": student_id, "student_name": student_name})

        batch.commit()
        logger.info("Bulk created %d sessions for exam %s", len(results), data.examId)
        return {"sessions": results}
    except SecureEvalError:
        raise
    except Exception as e:
        logger.error("Error bulk creating sessions: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to bulk create sessions")


@router.get("/sessions/{session_id}", tags=["Exam Session"])
def get_session(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("get_session")

    try:
        session_ref = db.collection("sessions").document(session_id)
        doc = session_ref.get()

        if not doc.exists:
            raise SessionNotFoundError(session_id)

        data = doc.to_dict()
        data["id"] = doc.id

        # If Completed or Terminated, return minimal response
        if data.get("status") in ["Completed", "Terminated"]:
            return {
                "id": data["id"],
                "status": data.get("status"),
                "score": data.get("score", 0),
                "termination_reason": data.get("termination_reason"),
            }

        # Fetch questions from Firestore
        questions = []
        exam_id = data.get("exam_id")
        exam_metadata = {}
        if exam_id:
            paper_ref = db.collection("exams").document(exam_id)
            paper_doc = paper_ref.get()
            if paper_doc.exists:
                paper_data = paper_doc.to_dict()
                questions = paper_data.get("questions", [])
                exam_metadata = {
                    "duration": paper_data.get("duration"),
                    "subject": paper_data.get("subject"),
                    "total_marks": paper_data.get("total_marks"),
                }

        return {
            "id": data["id"],
            "student_id": data.get("studentId"),
            "student_name": data.get("student_name"),
            "exam_id": data.get("exam_id"),
            "exam_title": data.get("exam_title") or data.get("examTitle"),
            "exam_type": data.get("exam_type"),
            "duration_minutes": data.get("duration_minutes") or data.get("duration"),
            "status": data.get("status"),
            "questions": questions,
            "questions_metadata": exam_metadata,
            "trust_score": data.get("trust_score"),
            "created_at": data.get("created_at"),
        }

    except SecureEvalError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error fetching session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch session")


@router.get("/sessions", tags=["Exam Session"])
def get_active_sessions(db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("get_active_sessions")

    try:
        sessions_ref = db.collection("sessions")
        query = sessions_ref.where("status", "in", ["Active", "Flagged"])
        docs = query.stream()

        sessions_data = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id

            sessions_data.append(
                {
                    "id": data["id"],
                    "student_name": data.get("student_name"),
                    "studentId": data.get("studentId"),
                    "exam_title": data.get("exam_title"),
                    "status": data.get("status"),
                    "trust_score": data.get("trust_score"),
                    "latest_log": data.get("latest_log"),
                }
            )

        return sessions_data
    except SecureEvalError:
        raise
    except Exception as e:
        logger.error("Error fetching active sessions: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch sessions")


@router.get("/sessions/{session_id}/logs", tags=["Exam Session"])
def get_session_logs(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("get_session_logs")

    try:
        logs_ref = db.collection("sessions").document(session_id).collection("logs")
        query = logs_ref.order_by("timestamp", direction=firestore.Query.DESCENDING)
        docs = query.stream()

        logs = []
        for doc in docs:
            logs.append(doc.to_dict())

        return logs
    except SecureEvalError:
        raise
    except Exception as e:
        logger.error("Error fetching logs for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch session logs")


@router.get("/sessions/{session_id}/status", tags=["Exam Session"])
def get_session_status(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("get_session_status")

    try:
        session_ref = db.collection("sessions").document(session_id)
        doc = session_ref.get()

        if not doc.exists:
            raise SessionNotFoundError(session_id)

        data = doc.to_dict()
        return {
            "status": data.get("status"),
            "trust_score": data.get("trust_score"),
            "score": data.get("score"),
            "total_questions": data.get("total_questions"),
            "message": data.get("current_message"),
            "is_message_read": data.get("is_message_read", False),
        }
    except SecureEvalError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error fetching session status %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch session status")


# --- Session Actions ---


@router.post("/sessions/{session_id}/submit", tags=["Exam Session"])
def submit_exam(session_id: str, submission: SubmitExamRequest, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("submit_exam")

    try:
        session_ref = db.collection("sessions").document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise SessionNotFoundError(session_id)

        data = session_doc.to_dict()
        if data.get("status") == "Completed":
            return {"message": "Already submitted"}

        # Fetch questions for grading
        questions = []
        exam_id = data.get("exam_id")
        if exam_id:
            paper_ref = db.collection("exams").document(exam_id)
            paper_doc = paper_ref.get()
            if paper_doc.exists:
                questions = paper_doc.to_dict().get("questions", [])

        # Use AI Service for Evaluation
        from backend.app.ai_service import evaluate_exam_submission

        evaluation = evaluate_exam_submission(questions, submission.answers)

        score = evaluation["score"]
        total = evaluation["total_questions"]
        percentage = (score / total * 100) if total > 0 else 0

        # Count number of suspicious logs
        logs_ref = session_ref.collection("logs")
        logs_stream = logs_ref.stream()
        cheat_score = len(list(logs_stream))

        # Calculate questions attempted
        questions_attempted = len([v for v in submission.answers.values() if v is not None and v != ""])

        # Update Firestore
        session_ref.update(
            {
                "status": "Completed",
                "score": score,
                "total": total,
                "total_questions": total,
                "questions_attempted": questions_attempted,
                "cheat_score": cheat_score,
                "percentage": round(percentage, 2),
                "answers": submission.answers,
                "feedback": evaluation["feedback"],
                "finished_at": datetime.now(UTC).isoformat(),
            }
        )

        logger.info("Exam submitted for session %s: score=%s/%s", session_id, score, total)

        return {
            "message": "Exam submitted successfully",
            "score": score,
            "total": total,
            "percentage": round(percentage, 2),
            "feedback": evaluation["feedback"],
        }

    except SecureEvalError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error submitting exam for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to submit exam")


@router.post("/sessions/{session_id}/terminate", tags=["Exam Session"])
def terminate_exam(session_id: str, reason: str = "Violation of exam protocols", db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("terminate_exam")

    try:
        session_ref = db.collection("sessions").document(session_id)

        if not session_ref.get().exists:
            raise SessionNotFoundError(session_id)

        session_ref.update(
            {
                "status": "Terminated",
                "termination_reason": reason,
                "trust_score": 0,
                "finished_at": datetime.now(UTC).isoformat(),
            }
        )

        logger.info("Session %s terminated: %s", session_id, reason)
        return {"message": "Exam terminated successfully"}

    except SecureEvalError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error terminating session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to terminate exam")


@router.delete("/sessions/{session_id}", tags=["Exam Session"])
def delete_session(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("delete_session")

    try:
        db.collection("sessions").document(session_id).delete()
        logger.info("Session %s deleted", session_id)
        return {"message": "Session deleted successfully"}
    except SecureEvalError:
        raise
    except Exception as e:
        logger.error("Error deleting session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete session")


@router.post("/sessions/{session_id}/generate-report", tags=["Exam Session"])
def generate_session_report(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("generate_session_report")

    try:
        session_ref = db.collection("sessions").document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise SessionNotFoundError(session_id)

        data = session_doc.to_dict()

        # Fetch detailed logs
        logs_ref = session_ref.collection("logs").order_by("timestamp")
        logs = [d.to_dict() for d in logs_ref.stream()]

        # Generate AI Report
        from backend.app.ai_service import generate_exam_report

        report = generate_exam_report(logs, data.get("score", 0), data.get("total", 0))

        # Save Report
        session_ref.update({"ai_report": report})

        logger.info("Generated AI report for session %s", session_id)
        return report
    except SecureEvalError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error generating report for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate report")


# --- Logging & Timing ---


@router.post("/sessions/{session_id}/log", tags=["Exam Session"])
def log_violation(session_id: str, log: LogRequest, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("log_violation")

    try:
        session_ref = db.collection("sessions").document(session_id)

        penalty = 10
        if "Locked" in log.message:
            penalty = 30
        if "Terminated" in log.message:
            penalty = 100

        session_ref.collection("logs").add(
            {"message": log.message, "timestamp": log.timestamp, "severity": "High" if penalty >= 30 else "Medium"}
        )

        doc = session_ref.get()
        if doc.exists:
            new_trust = max(0, doc.to_dict().get("trust_score", 100) - penalty)
            session_ref.update({"latest_log": log.message, "trust_score": new_trust})

        return {"status": "Logged"}
    except SecureEvalError:
        raise
    except Exception as e:
        logger.error("Error logging violation for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to log violation")


@router.post("/sessions/{session_id}/log-timing", tags=["Exam Session"])
def log_question_timing(session_id: str, timing: QuestionTiming, db=Depends(get_firestore_db)):
    try:
        session_ref = db.collection("sessions").document(session_id)
        session_ref.update({f"performance.{timing.index}": timing.duration_ms})
        return {"status": "saved"}
    except Exception as e:
        logger.error("Error logging timing for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to log timing")


# --- Messaging ---


@router.post("/sessions/{session_id}/message", tags=["Exam Session"])
def send_message_to_student(session_id: str, request: MessageRequest, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("send_message_to_student")

    try:
        session_ref = db.collection("sessions").document(session_id)
        doc = session_ref.get()

        if not doc.exists:
            raise SessionNotFoundError(session_id)

        session_ref.update({"current_message": request.message, "is_message_read": False})

        logger.info("Message sent to student in session %s", session_id)
        return {"status": "Message Sent"}
    except SecureEvalError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error sending message to student in session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to send message")


@router.post("/sessions/{session_id}/message/read", tags=["Exam Session"])
def mark_message_as_read(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise FirestoreUnavailableError("mark_message_as_read")

    try:
        session_ref = db.collection("sessions").document(session_id)
        doc = session_ref.get()

        if not doc.exists:
            raise SessionNotFoundError(session_id)

        session_ref.update({"is_message_read": True})

        return {"status": "Marked as read"}
    except SecureEvalError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error marking message as read in session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to mark message as read")


@router.post("/sessions/{session_id}/heartbeat", tags=["Exam Session"])
def record_heartbeat(session_id: str, heartbeat: HeartbeatRequest, db=Depends(get_firestore_db)):
    """Records client heartbeat to verify tab presence and network connectivity."""
    if not db:
        raise FirestoreUnavailableError("record_heartbeat")

    try:
        session_ref = db.collection("sessions").document(session_id)
        doc = session_ref.get()

        if not doc.exists:
            raise SessionNotFoundError(session_id)

        server_time = datetime.now(UTC).timestamp()
        drift = round(server_time - heartbeat.client_timestamp, 3) if heartbeat.client_timestamp else None

        update_payload = {
            "last_heartbeat": datetime.now(UTC).isoformat(),
            "tab_focused": heartbeat.tab_focused,
        }
        if drift is not None:
            update_payload["clock_drift_seconds"] = drift
        if heartbeat.battery_level is not None:
            update_payload["battery_level"] = heartbeat.battery_level

        session_ref.update(update_payload)

        if not heartbeat.tab_focused:
            session_ref.collection("logs").add(
                {
                    "message": "Tab lost focus (unfocused window detected)",
                    "timestamp": datetime.now(UTC).isoformat(),
                    "severity": "Medium",
                }
            )

        return {
            "status": "ok",
            "message": "Heartbeat recorded",
            "server_timestamp": server_time,
            "clock_drift_seconds": drift,
            "drift_ms": round(drift * 1000, 2) if drift is not None else None,
            "tab_focused": heartbeat.tab_focused,
        }
    except SecureEvalError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error recording heartbeat for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to record heartbeat")
