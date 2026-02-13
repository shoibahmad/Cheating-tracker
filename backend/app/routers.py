from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime
import cv2
import numpy as np
import base64
from backend.app.ai_service import extract_exam_and_insights
from backend.app.ai_service import extract_exam_and_insights
from firebase_admin import auth
from firebase_admin import firestore as admin_firestore # Rename to avoid confusion
from google.cloud import firestore # For Query.DESCENDING
from backend.app.firebase_setup import get_db

router = APIRouter()



@router.get("/admin/exams/history", tags=["Exam Session"])
def get_session_history():
    print("Fetching session history from Firestore (list_history)...")
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        # Fetch ALL sessions (Fetch all then sort to avoid missing docs without created_at)
        sessions_ref = db.collection("sessions")
        docs = sessions_ref.stream()
        
        sessions_data = []
        for doc in docs:
            data = doc.to_dict()
            
            sessions_data.append({
                "id": doc.id,
                "student_name": data.get('student_name'),
                "studentId": data.get('studentId'),
                "exam_title": data.get('exam_title'),
                "exam_type": data.get('exam_type', "University"),
                "status": data.get('status'),
                "trust_score": data.get('trust_score'),
                "score": data.get('score', 0),
                "percentage": data.get('percentage', 0),
                "total": data.get('total', 0),
                "latest_log": data.get('latest_log'),
                "created_at": data.get('created_at', "")
            })
            
        print(f"Total sessions found: {len(sessions_data)}")
        # Sort by created_at desc
        sessions_data.sort(key=lambda x: x['created_at'] or "", reverse=True)
            
        return sessions_data
    except Exception as e:
        print(f"Error fetching session history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- OCR Routes ---
@router.post("/ocr/upload", tags=["OCR Service"], summary="Upload Exam Paper", description="Uploads an image or PDF exam paper, extracts text via OCR/AI, and returns structured questions.")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # Use Gemini AI for extraction
        result = extract_exam_and_insights(contents, file.content_type)
        
        if "error" in result:
             return {"status": "error", "message": result["error"]}
             
        return {
            "status": "success", 
            "filename": file.filename, 
            "text": "Extracted via Gemini", 
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

@router.post("/analyze_frame", tags=["Monitoring Service"], summary="Analyze Webcam Frame")
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

        # DB Logging if suspicious
        if is_suspicious:
            db = get_db()
            if not db:
                 print("Firestore connection failed")
                 return {"status": "Error", "message": "Database error"}
                 
            try:
                session_ref = db.collection("sessions").document(data.session_id)
                session_doc = session_ref.get()
                
                if session_doc.exists:
                    session_data = session_doc.to_dict()
                    if session_data.get('status') == 'Active':
                        # STRICT TERMINATION LOGIC
                        termination_reason = f"Zero Tolerance Violation: {reason}"
                        
                        # Update Session
                        session_ref.update({
                            "status": "Terminated",
                            "termination_reason": termination_reason,
                            "trust_score": 0,
                            "latest_log": f"Terminated: {reason}"
                        })
                        
                        # Log to subcollection
                        log_entry = {
                            "message": f"Terminated: {reason}",
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        session_ref.collection("logs").add(log_entry)
                        
                        return {
                            "status": "Terminated", 
                            "face_count": face_count,
                            "reason": termination_reason
                        }
                    elif session_data.get('status') == 'Terminated':
                         return {
                            "status": "Terminated", 
                            "face_count": face_count,
                            "reason": session_data.get('termination_reason')
                        }

            except Exception as e:
                print(f"Error logging to Firestore: {e}")

        return {
            "status": "Active", 
            "face_count": face_count,
            "reason": None
        }

    except Exception as e:
        print(f"Error analyzing frame: {e}")
        return {"status": "Error", "message": str(e)}

# --- Student Routes (Firebase) ---

class StudentModel(BaseModel):
    id: Optional[str] = None
    full_name: str
    email: str
    password: Optional[str] = None # Only needed for creation
    role: str = "student"
    institution: Optional[str] = ""

@router.get("/admin/students", tags=["Student Management"])
def get_students():
    print("Fetching students from Firestore...")
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        # Fetch students from 'users' collection where role is 'student'
        users_ref = db.collection('users')
        query = users_ref.where('role', '==', 'student')
        docs = query.stream()
        
        students = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            students.append(data)
            
        print(f"Found {len(students)} students in 'users' collection")
        return students
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/students", tags=["Student Management"])
def create_student(student: StudentModel):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        # 1. Create User in Firebase Authentication
        try:
            user_record = auth.create_user(
                email=student.email,
                password=student.password,
                display_name=student.full_name
            )
            uid = user_record.uid
        except auth.EmailAlreadyExistsError:
             raise HTTPException(status_code=400, detail="Email already exists")
        except Exception as e:
             raise HTTPException(status_code=400, detail=f"Auth Error: {str(e)}")

        # 2. Store Metadata in Firestore
        student_data = {
            "full_name": student.full_name,
            "email": student.email,
            "role": student.role,
            "institution": student.institution,
            "uid": uid
        }
        
        db.collection('students').document(uid).set(student_data)
        
        # Also store in 'users' collection if your app uses that structure for separation
        # db.collection('users').document(uid).set(student_data)

        # 3. Set Custom Claims (Optional but good for role-based access)
        auth.set_custom_user_claims(uid, {'role': student.role})

        return {**student_data, "id": uid}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/admin/students/{student_id}", tags=["Student Management"])
def update_student(student_id: str, student: StudentModel):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        # 1. Update Firestore
        user_ref = db.collection('students').document(student_id)
        # Check if exists
        if not user_ref.get().exists:
             # Try users collection fallback
             user_ref = db.collection('users').document(student_id)
             if not user_ref.get().exists:
                 raise HTTPException(status_code=404, detail="User not found")

        update_data = {
            "full_name": student.full_name,
            "email": student.email,
            "role": student.role,
            "institution": student.institution
        }
        
        user_ref.update(update_data)

        # 2. Update Firebase Auth (Custom Claims & Display Name)
        try:
            auth.update_user(
                student_id,
                email=student.email,
                display_name=student.full_name,
                # Password update is separate or optional here
            )
            # Update Role Claim
            auth.set_custom_user_claims(student_id, {'role': student.role})
            
        except Exception as auth_err:
            print(f"Auth update warning: {auth_err}")
            # Non-critical if auth update fails but DB updates, but strictly we should sync.
            # Continue for now.

        return {"ok": True, "message": "User updated successfully"}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error updating student: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/admin/students/{student_id}", tags=["Student Management"])
def delete_student(student_id: str):
    db = get_db()
    if not db: 
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        # 1. Delete from Auth
        auth.delete_user(student_id)
        
        # 2. Delete from Firestore
        db.collection('students').document(student_id).delete()
        
        return {"ok": True}
    except Exception as e:
         # If user not found in Auth, try deleting from Firestore anyway
         try:
            db.collection('students').document(student_id).delete()
            return {"ok": True}
         except:
            raise HTTPException(status_code=400, detail=str(e))

# --- Session Exam Handling (Submit & Score) ---

class CreateSessionRequest(BaseModel):
    studentId: str
    student_name: str
    examId: str
    examTitle: str
    exam_type: str 

@router.post("/sessions", tags=["Exam Session"])
def create_session(data: CreateSessionRequest):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        # Generate ID (or let Firestore do it, but we want to return it)
        # Using Firestore auto-id by creating a doc ref first
        new_session_ref = db.collection("sessions").document()
        
        session_data = {
            "studentId": data.studentId,
            "student_name": data.student_name,
            "exam_id": data.examId,
            "exam_title": data.examTitle,
            "exam_type": data.exam_type,
            "status": "Active",
            "trust_score": 100,
            "created_at": datetime.utcnow().isoformat(),
            "termination_reason": None
        }
        
        new_session_ref.set(session_data)
        
        return {"session_id": new_session_ref.id}
    except Exception as e:
        print(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))




@router.get("/sessions/{session_id}", tags=["Exam Session"])
def get_session(session_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        doc = db.collection("sessions").document(session_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")
            
        data = doc.to_dict()
        data['id'] = doc.id
        
        # Check if completed/terminated
        if data.get('status') in ['Completed', 'Terminated']:
             return {
                 "id": data['id'],
                 "status": data.get('status'),
                 "score": data.get('score', 0), 
                 "termination_reason": data.get('termination_reason')
             }

        # Fetch questions from Firestore
        questions = []
        exam_id = data.get('exam_id')
        if exam_id:
            paper_ref = db.collection('exams').document(exam_id)
            paper_doc = paper_ref.get()
            if paper_doc.exists:
                questions = paper_doc.to_dict().get('questions', [])

        return {
            "id": data['id'],
            "student_id": data.get('studentId'),
            "exam_id": data.get('exam_id'),
            "status": data.get('status'),
            "questions": questions,
            "trust_score": data.get('trust_score')
        }

    except Exception as e:
        print(f"Error fetching session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions", tags=["Exam Session"])
def get_active_sessions():
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        # Fetch status in ['Active', 'Flagged']
        sessions_ref = db.collection("sessions")
        # Firestore 'IN' query
        query = sessions_ref.where("status", "in", ["Active", "Flagged"])
        docs = query.stream()
        
        sessions_data = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            
            # Fetch latest log? This is expensive in Firestore if in subcollection.
            # Assuming 'latest_log' is kept in the main doc for efficiency (as per analyze_frame update)
            
            sessions_data.append({
                "id": data['id'],
                "student_name": data.get('student_name'),
                "studentId": data.get('studentId'),
                "exam_title": data.get('exam_title'),
                "status": data.get('status'),
                "trust_score": data.get('trust_score'),
                "latest_log": data.get('latest_log')
            })
            
        return sessions_data
    except Exception as e:
        print(f"Error fetching active sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/logs", tags=["Exam Session"])
def get_session_logs(session_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        # Fetch logs from subcollection
        logs_ref = db.collection("sessions").document(session_id).collection("logs")
        query = logs_ref.order_by("timestamp", direction=firestore.Query.DESCENDING)
        docs = query.stream()
        
        logs = []
        for doc in docs:
            logs.append(doc.to_dict())
            
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}/status", tags=["Exam Session"])
def get_session_status(session_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        doc_ref = db.collection("sessions").document(session_id)
        doc = doc_ref.get()
        if not doc.exists:
             raise HTTPException(status_code=404, detail="Session not found")
        
        data = doc.to_dict()
        
        # Fetch latest logs for alerts
        # Assuming we just return latest message stored in doc or query subcollection limit 5
        # Let's query subcollection for better detail
        logs_ref = doc_ref.collection("logs").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(5)
        log_docs = logs_ref.stream()
        alert_messages = [l.to_dict().get('message') for l in log_docs]

        return {
            "status": data.get('status'),
            "trust_score": data.get('trust_score'),
            "latest_logs": alert_messages,
            "termination_reason": data.get('termination_reason')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SubmitExamRequest(BaseModel):
    answers: dict

@router.post("/sessions/{session_id}/submit", tags=["Exam Session"])
def submit_exam(session_id: str, submission: SubmitExamRequest):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        session_ref = db.collection("sessions").document(session_id)
        session_doc = session_ref.get()
        
        if not session_doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")
            
        data = session_doc.to_dict()
        if data.get('status') == 'Completed':
             return {"message": "Already submitted"}

        # Fetch questions for grading
        questions = []
        exam_id = data.get('exam_id')
        if exam_id:
            paper_ref = db.collection('exams').document(exam_id)
            paper_doc = paper_ref.get()
            if paper_doc.exists:
                questions = paper_doc.to_dict().get('questions', [])
                
        # Use AI Service for Evaluation
        from backend.app.ai_service import evaluate_exam_submission
        
        evaluation = evaluate_exam_submission(questions, submission.answers)
        
        score = evaluation['score']
        total = evaluation['total_questions']
        percentage = (score / total * 100) if total > 0 else 0

        # Update Firestore
        session_ref.update({
            "status": "Completed",
            "score": score,
            "total": total,
            "percentage": round(percentage, 2),
            "answers": submission.answers,
            "feedback": evaluation['feedback'] # Store detailed feedback
        })

        return {
            "message": "Exam submitted successfully",
            "score": score,
            "total": total,
            "percentage": round(percentage, 2),
            "feedback": evaluation['feedback']
        }

    except Exception as e:
        print(f"Error submitting exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions/{session_id}/terminate", tags=["Exam Session"])
def terminate_exam(session_id: str, reason: str = "Violation of exam protocols"):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        session_ref = db.collection("sessions").document(session_id)
        
        if not session_ref.get().exists:
             raise HTTPException(status_code=404, detail="Session not found")

        session_ref.update({
            "status": "Terminated",
            "termination_reason": reason,
            "trust_score": 0
        })

        return {"message": "Exam terminated successfully"}

    except Exception as e:
        print(f"Error terminating exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/sessions/{session_id}", tags=["Exam Session"])
def delete_session(session_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        # Note: Firestore doesn't automatically delete subcollections (logs).
        # We should delete logs explicitly if possible, or use a recursive delete function.
        # For simplicity in this scope:
        db.collection("sessions").document(session_id).delete()
        
        return {"message": "Session deleted successfully"}
    except Exception as e:
        print(f"Error deleting session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sessions/{session_id}/generate-report", tags=["Exam Session"])
def generate_session_report(session_id: str):
    db = get_db()
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
        
        report = generate_exam_report(logs, data.get('score', 0), data.get('total', 0))
        
        # Save Report
        session_ref.update({
            "ai_report": report
        })
        
        return report
    except Exception as e:
        print(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class LogRequest(BaseModel):
    message: str
    timestamp: str

@router.post("/sessions/{session_id}/log", tags=["Exam Session"])
def log_violation(session_id: str, log: LogRequest):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")
        
    try:
        session_ref = db.collection("sessions").document(session_id)
        
        # Add to subcollection
        session_ref.collection("logs").add({
            "message": log.message,
            "timestamp": log.timestamp
        })
        
        # Update latest log on main doc for quick access
        session_ref.update({
            "latest_log": log.message,
            # Decrease trust score logic could go here too
        })
        
        return {"status": "Logged"}
    except Exception as e:
        print(f"Error logging violation: {e}")
        raise HTTPException(status_code=500, detail=str(e))




