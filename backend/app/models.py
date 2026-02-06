from typing import List, Optional
from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel, Relationship, JSON

# --- Models ---

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    full_name: str
    role: str = "student" # "admin" or "student"
    institution: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Question(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    text: str
    options: List[str] = Field(sa_type=JSON) 
    correct_answer: int
    question_paper_id: Optional[str] = Field(default=None, foreign_key="questionpaper.id")
    
    paper: Optional["QuestionPaper"] = Relationship(back_populates="questions")

class QuestionPaper(SQLModel, table=True):
    id: Optional[str] = Field(default=None, primary_key=True)
    title: str
    subject: str
    created_by: Optional[int] = Field(default=None, foreign_key="user.id")
    
    questions: List["Question"] = Relationship(back_populates="paper")

class ExamSession(SQLModel, table=True):
    id: str = Field(primary_key=True)
    student_name: str
    exam_type: str
    status: str
    trust_score: int
    started_at: datetime
    alerts: List[str] = Field(default=[], sa_type=JSON)
    question_paper_id: Optional[str] = Field(default=None, foreign_key="questionpaper.id")
    score: float = Field(default=0.0)
