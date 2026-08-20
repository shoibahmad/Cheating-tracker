"""
Session management routes.

Handles exam session lifecycle: creation, retrieval, submission,
termination, logging, timing, and messaging.
"""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore
from pydantic import BaseModel

from backend.app.dependencies import get_firestore_db
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
        raise HTTPException(status_code=500, detail="Database connection failed")

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
    except Exception as e:
        logger.error("Error creating session: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create session")


@router.post("/sessions/bulk", tags=["Exam Session"])
def bulk_create_sessions(data: BulkCreateSessionRequest, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

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
            results.append({"student_id": student_id, "student_name": student_name, "session_id": new_session_ref.id})

        batch.commit()
        logger.info("Bulk created %d sessions for exam %s", len(results), data.examId)
        return {"sessions": results}
    except Exception as e:
        logger.error("Error bulk creating sessions: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create sessions")


@router.get("/sessions/{session_id}", tags=["Exam Session"])
def get_session(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        doc = db.collection("sessions").document(session_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")

        data = doc.to_dict()
        data["id"] = doc.id

        # Check if completed/terminated
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

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error fetching session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch session")


@router.get("/sessions", tags=["Exam Session"])
def get_active_sessions(db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

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
    except Exception as e:
        logger.error("Error fetching active sessions: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch sessions")


@router.get("/sessions/{session_id}/logs", tags=["Exam Session"])
def get_session_logs(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        logs_ref = db.collection("sessions").document(session_id).collection("logs")
        query = logs_ref.order_by("timestamp", direction=firestore.Query.DESCENDING)
        docs = query.stream()

        logs = []
        for doc in docs:
            logs.append(doc.to_dict())

        return logs
    except Exception as e:
        logger.error("Error fetching logs for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch session logs")


@router.get("/sessions/{session_id}/status", tags=["Exam Session"])
def get_session_status(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        doc_ref = db.collection("sessions").document(session_id)
        doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")

        data = doc.to_dict()

        # Fetch latest logs for alerts
        logs_ref = doc_ref.collection("logs").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(5)
        log_docs = logs_ref.stream()
        alert_messages = [log.to_dict().get("message") for log in log_docs]

        return {
            "status": data.get("status"),
            "trust_score": data.get("trust_score"),
            "latest_logs": alert_messages,
            "termination_reason": data.get("termination_reason"),
            "latest_message": data.get("latest_message"),
            "is_message_read": data.get("is_message_read", False),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error fetching session status %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch session status")


# --- Session Actions ---


@router.post("/sessions/{session_id}/submit", tags=["Exam Session"])
def submit_exam(session_id: str, submission: SubmitExamRequest, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        session_ref = db.collection("sessions").document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")

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

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error submitting exam for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to submit exam")


@router.post("/sessions/{session_id}/terminate", tags=["Exam Session"])
def terminate_exam(session_id: str, reason: str = "Violation of exam protocols", db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        session_ref = db.collection("sessions").document(session_id)

        if not session_ref.get().exists:
            raise HTTPException(status_code=404, detail="Session not found")

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

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error terminating session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to terminate exam")


@router.delete("/sessions/{session_id}", tags=["Exam Session"])
def delete_session(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        db.collection("sessions").document(session_id).delete()
        logger.info("Session %s deleted", session_id)
        return {"message": "Session deleted successfully"}
    except Exception as e:
        logger.error("Error deleting session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete session")


@router.post("/sessions/{session_id}/generate-report", tags=["Exam Session"])
def generate_session_report(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        session_ref = db.collection("sessions").document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")

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
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error generating report for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate report")


# --- Logging & Timing ---


@router.post("/sessions/{session_id}/log", tags=["Exam Session"])
def log_violation(session_id: str, log: LogRequest, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        session_ref = db.collection("sessions").document(session_id)

        # Determine penalty based on message content
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
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        session_ref = db.collection("sessions").document(session_id)

        session_ref.update(
            {
                "latest_message": request.message,
                "is_message_read": False,
                "latest_log": f"Admin Message: {request.message}",
            }
        )

        session_ref.collection("logs").add(
            {
                "message": f"Admin: {request.message}",
                "timestamp": datetime.now(UTC).isoformat(),
                "type": "admin_message",
            }
        )

        logger.info("Admin message sent to session %s", session_id)
        return {"status": "Message Sent"}
    except Exception as e:
        logger.error("Error sending message to session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to send message")


@router.post("/sessions/{session_id}/message/read", tags=["Exam Session"])
def mark_message_read(session_id: str, db=Depends(get_firestore_db)):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        session_ref = db.collection("sessions").document(session_id)
        session_ref.update({"is_message_read": True})
        return {"status": "Marked as read"}
    except Exception as e:
        logger.error("Error marking message read for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to mark message as read")


@router.post("/sessions/{session_id}/heartbeat", tags=["Exam Session"])
def log_session_heartbeat(
    session_id: str,
    data: HeartbeatRequest,
    db=Depends(get_firestore_db)
):
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        session_ref = db.collection("sessions").document(session_id)
        doc = session_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")

        now = datetime.now(UTC)
        server_ts = now.timestamp()
        drift_ms = round(abs(server_ts - (data.client_timestamp or server_ts)) * 1000, 2)

        update_payload = {
            "last_heartbeat": now.isoformat(),
            "client_tab_focused": data.tab_focused,
        }
        if data.battery_level is not None:
            update_payload["battery_level"] = data.battery_level

        session_ref.update(update_payload)

        if not data.tab_focused:
            session_ref.collection("logs").add({
                "message": "Tab lost focus during examination",
                "timestamp": now.isoformat(),
                "type": "tab_switch",
                "drift_ms": drift_ms
            })

        return {
            "status": "ok",
            "server_timestamp": now.isoformat(),
            "drift_ms": drift_ms,
            "session_status": doc.to_dict().get("status", "Active")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error processing heartbeat for session %s: %s", session_id, e, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to record heartbeat")
