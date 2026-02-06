from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Annotated
from sqlmodel import Session, select
from datetime import datetime, timedelta
import uuid

from .database import get_session
from .models import ExamSession, QuestionPaper, Question, User
from .auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user, 
    get_current_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from pydantic import BaseModel
from .ocr import extract_text_from_image, parse_questions_from_text

router = APIRouter()

# --- Auth Routes ---

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "student"
    institution: str = None

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str

@router.post("/auth/signup", response_model=User)
def signup(user: UserCreate, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == user.email)
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        role=user.role,
        institution=user.institution
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@router.post("/auth/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    session: Session = Depends(get_session)
):
    statement = select(User).where(User.email == form_data.username) # OAuth2 form uses 'username' for email
    user = session.exec(statement).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role,
        "name": user.full_name
    }

# --- Exam Routes (Protected) ---

class ExamSessionCreate(BaseModel):
    student_name: str
    exam_type: str
    question_paper_id: str | None = None

@router.post("/sessions", response_model=ExamSession)
def create_session(session_data: ExamSessionCreate, session: Session = Depends(get_session)):
    new_session = ExamSession(
        id=str(uuid.uuid4()),
        student_name=session_data.student_name,
        exam_type=session_data.exam_type,
        status="Active",
        trust_score=100,
        started_at=datetime.now(),
        alerts=[],
        question_paper_id=session_data.question_paper_id
    )
    session.add(new_session)
    session.commit()
    session.refresh(new_session)
    return new_session

@router.get("/sessions", response_model=List[ExamSession])
def get_sessions(student_name: str = None, session: Session = Depends(get_session)):
    query = select(ExamSession)
    if student_name:
        query = query.where(ExamSession.student_name == student_name)
    return session.exec(query).all()

@router.get("/students", response_model=List[User])
def get_students(session: Session = Depends(get_session)):
    return session.exec(select(User).where(User.role == "student")).all()

@router.get("/sessions/{session_id}", response_model=ExamSession)
def get_session_by_id(session_id: str, session: Session = Depends(get_session)):
    exam = session.get(ExamSession, session_id)
    if not exam:
         raise HTTPException(status_code=404, detail="Session not found")
    return exam

# --- Admin Routes ---


# --- Pydantic Models for Creation ---

class QuestionCreate(BaseModel):
    text: str
    options: List[str]
    correct_answer: int

class QuestionPaperCreate(BaseModel):
    title: str
    subject: str
    questions: List[QuestionCreate]

@router.post("/question-papers", response_model=QuestionPaper)
def create_question_paper(
    paper_data: QuestionPaperCreate, 
    session: Session = Depends(get_session),
    # current_user: User = Depends(get_current_admin) # Uncomment to enforce admin
):
    # 1. Create QuestionPaper
    new_paper_id = str(uuid.uuid4())
    new_paper = QuestionPaper(
        id=new_paper_id,
        title=paper_data.title,
        subject=paper_data.subject
        # created_by could be set here if we had current_user
    )
    session.add(new_paper)
    
    # 2. Create Questions linked to this paper
    for q_data in paper_data.questions:
        new_question = Question(
            id=str(uuid.uuid4()),
            text=q_data.text,
            options=q_data.options,
            correct_answer=q_data.correct_answer,
            question_paper_id=new_paper_id
        )
        session.add(new_question)

    session.commit()
    session.refresh(new_paper)
    return new_paper


@router.post("/ocr/upload")
async def upload_question_paper(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    try:
        content = await file.read()
        # Basic check for image vs pdf (pdf support needs pypdf or pdf2image, here simple check)
        # For now, support images
        text = await extract_text_from_image(content)
        if not text:
            return {"questions": []}
            
        questions_data = parse_questions_from_text(text)
        return {"questions": questions_data, "raw_text": text}
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process file")

@router.get("/question-papers", response_model=List[QuestionPaper])
def get_question_papers(session: Session = Depends(get_session)):
    from sqlalchemy.orm import selectinload
    return session.exec(select(QuestionPaper).options(selectinload(QuestionPaper.questions))).all()

@router.post("/admin/assign-exam")
def assign_exam(
    student_name: str, 
    exam_type: str, 
    question_paper_id: str,
    session: Session = Depends(get_session)
):
    session_id = str(uuid.uuid4())
    new_session = ExamSession(
        id=session_id,
        student_name=student_name,
        exam_type=exam_type,
        status="Active",
        trust_score=100,
        started_at=datetime.now(),
        alerts=[],
        question_paper_id=question_paper_id
    )
    session.add(new_session)
    session.commit()
    return {"session_id": session_id, "message": f"Exam assigned to {student_name}"}

@router.get("/dashboard-stats")
def get_dashboard_stats(session: Session = Depends(get_session)):
    exam_statement = select(ExamSession)
    exams = session.exec(exam_statement).all()
    
    active = [s for s in exams if s.status == "Active"]
    flagged = [s for s in exams if s.status == "Flagged"]
    avg_score = sum(s.trust_score for s in exams) / len(exams) if exams else 0
    
    # Count students (role='student')
    student_statement = select(User).where(User.role == 'student')
    student_count = len(session.exec(student_statement).all())
    
    return {
        "active_exams": len(active),
        "flagged_exams": len(flagged),
        "total_exams_today": len(exams), # Total exams in DB
        "average_trust_score": int(avg_score),
        "total_students": student_count
    }

# --- Monitor Routes ---
# Keeping the monitor logic similar but updating session via DB

import cv2
import numpy as np
import base64

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

class FrameData(BaseModel):
    session_id: str
    image: str

@router.post("/analyze_frame")
def analyze_frame(data: FrameData, session: Session = Depends(get_session)):
    try:
        # Fetch session
        exam = session.get(ExamSession, data.session_id)
        if not exam:
             return {"status": "Error", "message": "Session not found"} 
        
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

        if is_suspicious:
            # Update DB using SQLModel
            exam.status = "Flagged" # Use Flagged instead of Terminated for soft warnings? Or Terminated.
            if len(exam.alerts) is None: exam.alerts = []
            
            # Append new alert
            current_alerts = list(exam.alerts)
            current_alerts.append(f"Suspicion: {reason}")
            exam.alerts = current_alerts
            
            exam.trust_score = max(0, exam.trust_score - 10)
            session.add(exam)
            session.commit()
            
            if exam.trust_score < 50:
                 exam.status = "Terminated"
                 session.add(exam)
                 session.commit()
                 return {"status": "Terminated", "reason": reason, "face_count": face_count}

        return {"status": "Active", "face_count": face_count}

    except Exception as e:
        print(f"Error analyzing frame: {e}")
        return {"status": "Error", "message": str(e)}

