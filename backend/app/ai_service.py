import os
import google.generativeai as genai
import json
import typing_extensions as typing
from google.api_core.exceptions import FailedPrecondition, InvalidArgument

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

    model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')

    prompt = """
    Extract questions from this exam paper.
    Identify if they are multiple choice (mcq) or descriptive.
    Return a JSON object with a 'questions' array.
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
    except FailedPrecondition as e:
        print(f"Gemini Location Error: {e}")
        return {
            "error": f"Google API Error: {e}. (Hint: We are using 'gemini-2.5-flash-preview-09-2025'. If this fails, the model might not be available in your 'oregon' region or project).", 
            "questions": []
        }
    except InvalidArgument as e:
        print(f"Gemini Invalid Argument: {e}")
        return {"error": f"Invalid Argument (Model/Config): {e}", "questions": []}
    except Exception as e:
        # Fixed syntax error in f-string
        print(f"Gemini AI Error type: {type(e)}")
        print(f"Gemini AI Error: {e}")
        if hasattr(e, 'response'):
             print(f"Gemini Response Feedback: {e.response.prompt_feedback}")
             
        return {"error": f"AI Service Error: {str(e)}", "questions": []}

def analyze_student_session(monitoring_logs: list, exam_score: float):
    """
    Analyzes monitoring logs to detect cheating patterns.
    """
    if not API_KEY:
        return "AI analysis unavailable (API Key missing)."

    model = genai.GenerativeModel('gemini-2.5-flash-preview-09-2025')
    
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

def generate_exam_report(logs: list, score: float, total_questions: int):
    """
    Generates a detailed post-exam report using Gemini.
    """
    if not API_KEY:
        return {"summary": "AI analysis unavailable.", "trust_score_analysis": "N/A", "timeline_analysis": []}

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Compress logs if too long
    log_text = json.dumps(logs[:50]) if len(logs) > 50 else json.dumps(logs)
    
    prompt = f"""
    Generate a detailed post-exam proctoring report for a student session.
    
    Data:
    - Score: {score}/{total_questions}
    - Violation Logs: {log_text}
    
    Task:
    1. Analyze the logs to determine the integrity of the session.
    2. Provide a 'trust_score' (0-100) based on the severity and frequency of violations.
    3. Create a 'summary' paragraph explaining the student's behavior.
    4. Highlight key 'suspicious_moments' if any.
    
    Output JSON format:
    {{
        "trust_score": number,
        "summary": "string",
        "suspicious_moments": ["string", "string"]
    }}
    Return ONLY JSON.
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:-3]
        return json.loads(text)
    except Exception as e:
        print(f"Report Gen Error: {e}")
        return {
            "trust_score": None, 
            "summary": "Could not generate report due to AI error.", 
            "suspicious_moments": []
        }

def evaluate_exam_submission(questions: list, student_answers: dict):
    """
    Evaluates an exam submission using AI for descriptive answers and strict matching for MCQs.
    
    Args:
        questions: List of question objects (from Firestore/DB).
        student_answers: Dict of {question_id: answer}.
        
    Returns:
        {
            "score": float,
            "total_questions": int,
            "feedback": { q_id: { "correct": bool, "score": float, "remarks": str } }
        }
    """
    if not API_KEY:
         return {"error": "AI Service Unavailable"}
         
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    results = {}
    total_score = 0
    total_questions = len(questions)
    
    # Separate Descriptive Questions for AI Batch Processing (optimization)
    descriptive_tasks = []
    
    for i, q in enumerate(questions):
        q_id = str(q.get('id', i))
        u_ans = student_answers.get(str(q_id))
        q_type = q.get('type', 'mcq') # Default to MCQ
        
        if q_type == 'mcq':
            # Strict Grading
            correct_idx = q.get('correct_answer')
            is_correct = False
            try:
                if u_ans is not None and int(u_ans) == int(correct_idx):
                    is_correct = True
            except:
                pass
            
            score = 1.0 if is_correct else 0.0
            total_score += score
            results[q_id] = {
                "correct": is_correct,
                "score": score,
                "remarks": "Correct" if is_correct else "Incorrect"
            }
            
        elif q_type == 'descriptive':
            # Queue for AI
            descriptive_tasks.append({
                "id": q_id,
                "text": q.get('text'),
                "answer": u_ans,
                "max_score": 1 # Assume 1 mark for now, or fetch from q
            })
            
    # Batch Process Descriptive Answers
    if descriptive_tasks:
        prompt = f"""
        You are an strict academic examiner. Grade the following student answers.
        
        Tasks : {json.dumps(descriptive_tasks)}
        
        For each task, compare the 'answer' against the 'text' (question).
        Verify if the answer is relevant and correct. 
        Give a score between 0 and 1 (decimal allowed, e.g. 0.5 for partial).
        Provide very brief remarks.
        
        Output JSON:
        {{
            "results": [
                {{ "id": "q_id", "score": 0.5, "remarks": "Partially correct, missing key keyword." }}
            ]
        }}
        """
        
        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```json'):
                text = text[7:-3]
            ai_data = json.loads(text)
            
            for item in ai_data.get('results', []):
                q_id = item.get('id')
                score = float(item.get('score', 0))
                total_score += score
                results[q_id] = {
                    "correct": score >= 0.5,
                    "score": score,
                    "remarks": item.get('remarks')
                }
        except Exception as e:
            print(f"AI Grading Error: {e}")
            # Fallback: Mark as 0 to be safe, or manual review needed
            for task in descriptive_tasks:
                 results[task['id']] = { "correct": False, "score": 0, "remarks": "AI Grading Failed" }

    return {
        "score": round(total_score, 2),
        "total_questions": total_questions,
        "feedback": results
    }
