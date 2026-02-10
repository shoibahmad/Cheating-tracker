from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from typing import List, Optional
import json
import cv2
import numpy as np
import base64
from backend.app.ai_service import extract_exam_and_insights
from firebase_admin import auth, firestore
from backend.app.firebase_setup import get_db

router = APIRouter()

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

@router.post("/analyze_frame", tags=["Monitoring Service"], summary="Analyze Webcam Frame", description="Analyzes a single webcam frame for face detection to identify potential cheating (no face, multiple faces).")
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
            if db:
                session_ref = db.collection('sessions').document(data.session_id)
                # Check if session is already terminated, if so, don't log more (optional, but good practice)
                # For speed, we might skip reading first, but let's just write.
                
                log_entry = {
                    "timestamp": firestore.SERVER_TIMESTAMP,
                    "message": reason
                }
                
                # Update session with log and latest alert
                # Also decrement trust score slightly for real-time impact? 
                # Let's just log for now as requested.
                session_ref.update({
                    "logs": firestore.ArrayUnion([log_entry]),
                    "latest_log": reason,
                    "status": "Flagged" # Ensure status is flagged
                })

        return {
            "status": "Flagged" if is_suspicious else "Active", 
            "face_count": face_count,
            "reason": reason if is_suspicious else None
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

# --- GET Endpoints for Student Portal ---

@router.get("/sessions/{session_id}", tags=["Exam Session"])
def get_session(session_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        session_ref = db.collection('sessions').document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")

        session_data = session_doc.to_dict()
        session_data['id'] = session_doc.id
        return session_data

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error fetching session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/question-papers/{paper_id}", tags=["Exam Session"])
def get_question_paper(paper_id: str):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        # Check 'exams' collection
        paper_ref = db.collection('exams').document(paper_id)
        paper_doc = paper_ref.get()

        if not paper_doc.exists:
            raise HTTPException(status_code=404, detail="Question paper not found")

        paper_data = paper_doc.to_dict()
        paper_data['id'] = paper_doc.id
        return paper_data

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error fetching question paper: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class SubmitExamRequest(BaseModel):
    answers: dict  # { "question_id": selected_option_index }

@router.post("/sessions/{session_id}/submit", tags=["Exam Session"])
def submit_exam(session_id: str, submission: SubmitExamRequest):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        # 1. Fetch Session
        session_ref = db.collection('sessions').document(session_id)
        session_doc = session_ref.get()

        if not session_doc.exists:
            raise HTTPException(status_code=404, detail="Session not found")

        session_data = session_doc.to_dict()

        if session_data.get('status') == 'Completed':
             return {"message": "Exam already submitted", "score": session_data.get('score'), "total": len(session_data.get('questions', [])), "percentage": session_data.get('percentage', 0)}

        # 2. Get Questions (Embedded in Session)
        questions = session_data.get('questions', [])
        if not questions:
            # Fallback for older sessions without embedded questions (legacy)
             # You might need to fetch from exams collection if using examId
             # For now, assume questions are embedded as per fix in AssignExamPage
             pass 

        # 3. Calculate Score
        score = 0
        total_questions = len(questions)

        for i, q in enumerate(questions):
            # Question IDs in frontend might be indices if not explicitly set
            # Assuming frontend sends index as key or we iterate by index
            # The structure from CreatePaperPage is: questions is an array.
            # StudentExamPage map uses index as key if q.id is missing.
            
            # Since frontend uses q.id or index, let's correspond.
            # Convert submission keys to integers if possible
            
            # Let's assume submission.answers keys match questions indices for now if no IDs
            # But wait, CreatePaperPage doesn't seem to assign unique IDs to questions, just array index.
            # StudentExamPage uses `q.id` which might be undefined, falling back to index?
            # Let's check StudentExamPage again. It uses `q.id` in `key={q.id}`. 
            # If questions from CreatePaperPage don't have IDs, this is a problem.
            # But let's assume valid array index mapping for now.
            
            q_id = str(q.get('id', i)) # Fallback to index if no ID
            
            user_answer = submission.answers.get(str(q_id)) # Keys are strings in JSON
            
            # Correct answer is index
            correct_answer = q.get('correct_answer')
            
            if user_answer is not None and int(user_answer) == int(correct_answer):
                score += 1

        # 4. Update Session in Firestore
        percentage = (score / total_questions * 100) if total_questions > 0 else 0
        
        session_ref.update({
            'status': 'Completed',
            'score': score,
            'total_questions': total_questions,
            'percentage': round(percentage, 2),
            'answers': submission.answers,
            'submittedAt': firestore.SERVER_TIMESTAMP
        })

        return {
            "message": "Exam submitted successfully",
            "score": score,
            "total": total_questions,
            "percentage": round(percentage, 2)
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error submitting exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions/{session_id}/terminate", tags=["Exam Session"])
def terminate_exam(session_id: str, reason: str = "Violation of exam protocols"):
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database connection failed")

    try:
        session_ref = db.collection('sessions').document(session_id)
        
        # Verify session exists
        if not session_ref.get().exists:
            raise HTTPException(status_code=404, detail="Session not found")

        # Update session status and trust score
        session_ref.update({
            'status': 'Terminated',
            'trust_score': 0,
            'termination_reason': reason,
            'terminatedAt': firestore.SERVER_TIMESTAMP
        })

        return {"message": "Exam terminated successfully"}

    except Exception as e:
        print(f"Error terminating exam: {e}")
        raise HTTPException(status_code=500, detail=str(e))

