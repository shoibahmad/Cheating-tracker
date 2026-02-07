import os
import google.generativeai as genai
import json
import typing_extensions as typing

# Configure API Key
# Try getting from os.environ (if loaded by dotenv elsewhere) or load manually logic here if needed, 
# but best to rely on main.py loading .env
API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)

# Define schemas for structured output
class Option(typing.TypedDict):
    text: str
    label: str  # 'a', 'b', 'c', 'd'

class Question(typing.TypedDict):
    id: int
    text: str
    options: list[Option]
    correctAnswer: str  # 'a', 'b', 'c', 'd'
    marks: int

def extract_exam_and_insights(file_bytes: bytes, mime_type: str):
    """
    Uses Gemini Flash to extract exam questions and provide insights.
    Returns: { "questions": [...], "insights": "..." }
    """
    if not API_KEY:
        raise Exception("GEMINI_API_KEY not configured")

    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = """
    Analyze this exam paper document.
    1. Extract all questions, their options (if multiple choice), marks, and correct answer (if indicated).
    2. Format the output as a valid JSON object with a 'questions' array.
    3. Each question object should have: 'id' (number), 'text' (string), 'options' (array of {label, text}), 'correctAnswer' (label string or null if unknown), and 'marks' (number, default to 1).
    4. Also provide a brief 'insights' string summarizing the difficulty level and topics covered.
    
    Return ONLY valid JSON.
    """

    # For images, we can pass bytes directly. For PDF, we might need to be careful.
    # Gemini 1.5 Flash supports PDF via File API or as image parts.
    # For simplicity, if it's a PDF, we might assume the caller converts it to images or we use File API.
    # If the file_bytes are small, we can try passing as blob.
    
    try:
        response = model.generate_content([
            {'mime_type': mime_type, 'data': file_bytes},
            prompt
        ])
        
        # Clean up response text to ensure it's JSON
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:-3]
        
        return json.loads(text)
    except Exception as e:
        print(f"Gemini AI Error: {e}")
        return {"error": str(e), "questions": []}

def analyze_student_session(monitoring_logs: list, exam_score: float):
    """
    Analyzes monitoring logs to detect cheating patterns.
    """
    if not API_KEY:
        return "AI analysis unavailable (API Key missing)."

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    Analyze this exam session for potential academic dishonesty.
    Exam Score: {exam_score}%
    Monitoring Logs: {json.dumps(monitoring_logs)}
    
    Provide a concise assessment (Safe, Suspicious, High Risk) and explain why.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error analyzing session: {e}"
