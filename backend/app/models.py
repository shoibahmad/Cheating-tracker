from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    email: str = Field(index=True, unique=True)
    password: str  # In production, hash this!
    role: str = "student"
    institution: Optional[str] = None

class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    options: str # JSON string of options
    correct_answer: int
    exam_id: Optional[int] = Field(default=None, foreign_key="exam.id")
    
    exam: Optional["Exam"] = Relationship(back_populates="questions")

class Exam(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    subject: str
    created_at: str # ISO format string
    created_by: str
    status: str = "draft"
    
    questions: List[Question] = Relationship(back_populates="exam")
