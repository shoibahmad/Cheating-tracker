import os
import google.generativeai as genai
import json
import typing_extensions as typing
from google.api_core.exceptions import FailedPrecondition, InvalidArgument
import grpc

# Configure API Key
API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
    print("AI Service Loaded: v2.0-Reloaded")

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

    # Replaced preview model with standard gemini-2.5-flash per user request
    model = genai.GenerativeModel('gemini-2.5-flash')

    prompt = """
    Extract all questions from this exam paper image/PDF.
    
    RULES:
    1. Identify the question type: 'mcq' (Multiple Choice) or 'descriptive' (Short/Long Answer).
    2. For 'mcq' questions, you MUST extract at least 4 options.
    3. Return a valid JSON object.
    
    SCHEMA:
    {
      "questions": [
        {
          "text": "The full question text",
          "type": "mcq" | "descriptive",
          "options": ["Option A", "Option B", "Option C", "Option D"], 
          "correctAnswer": "a" | "b" | "c" | "d",
          "marks": 1
        }
      ],
      "insights": "A brief overview of the exam difficulty and topics covered."
    }
    
    IMPORTANT: 
    - If a question is descriptive, leave "options" as an empty array and "correctAnswer" as null.
    - If you can't find 4 options for an MCQ, provide empty strings for the missing ones.
    - Ensure "correctAnswer" is a single lowercase letter corresponding to the option index (0=a, 1=b, etc.).
    - Return ONLY the JSON object.
    """

    try:
        response = model.generate_content([
            {'mime_type': mime_type, 'data': file_bytes},
            prompt
        ])
        
        # Safe access to response.text
        try:
            res_text = response.text
            print(f"Gemini Response: {res_text}")
        except Exception as text_err:
             print(f"Error reading response text: {text_err}")
             return {"error": "Gemini returned a response that could not be read (possibly safety blocked or invalid model response).", "questions": []}
        
        if not res_text:
             return {"error": "Gemini returned empty response.", "questions": []}

        # Clean up response text to ensure it's JSON
        text = res_text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        
        text = text.strip()
            
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error. Raw text: {res_text}")
        return {"error": f"Failed to parse AI response. Raw: {res_text[:100]}...", "questions": []}
    except FailedPrecondition as e:
        print(f"Gemini Location Error: {e}")
        return {
            "error": f"Google API Error: {e}. (Hint: We are using 'gemini-2.5-flash'. If this fails, the model might not be available in your region or project).", 
            "questions": []
        }
    except InvalidArgument as e:
        print(f"Gemini Invalid Argument: {e}")
        return {"error": f"Invalid Argument (Model/Config): {e}", "questions": []}
    except (grpc.RpcError, ConnectionError, TimeoutError) as e:
        # SPECIFIC GRPC & NETWORK ERROR HANDLING
        print(f"AI Service Network Error: {type(e).__name__} - {str(e)}")
        return {
            "error": "AI Service Connection Timeout or Network Error. The service is currently unresponsive or too slow for this file. Please try again or use a smaller/simpler file.",
            "questions": []
        }
    except Exception as e:
        # BULLETPROOF ERROR HANDLING
        # We avoid accessing any response attributes here to prevent secondary crashes
        err_msg = str(e)
        
        # Guard against the specific 'prompt_feedback' attribute error which masks the real RPC failure
        if "prompt_feedback" in err_msg or "InactiveRpcError" in err_msg:
             err_msg = "AI Service Communication Failure (Internal SDK Error). This usually happens due to a network timeout."
             
        print(f"Gemini AI Error type: {type(e)}")
        print(f"Gemini AI Error: {err_msg}")
             
        return {
            "error": f"AI Service Error: {err_msg}. Ensure 'gemini-1.5-flash' or 'gemini-2.5-flash' is available.", 
            "questions": []
        }

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
    except (grpc.RpcError, ConnectionError, TimeoutError):
        return "Error analyzing session: Connection Timeout or Network Failure."
    except Exception as e:
        err_msg = str(e)
        if "prompt_feedback" in err_msg:
             err_msg = "Internal SDK Error (Connection Failed)"
        return f"Error analyzing session: {err_msg}"

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
        
        try:
             res_text = response.text
        except:
             return {"summary": "AI returned unreadable response.", "trust_score": None, "suspicious_moments": []}
             
        if not res_text:
            return {"summary": "AI returned empty report.", "trust_score": None, "suspicious_moments": []}

        text = res_text.strip()
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
        
        text = text.strip()
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "trust_score": None, 
            "summary": "Could not parse AI report.", 
            "suspicious_moments": []
        }
    except (grpc.RpcError, ConnectionError, TimeoutError):
        return {
            "trust_score": None, 
            "summary": "Could not generate report: AI Service Connection Timeout.", 
            "suspicious_moments": []
        }
    except Exception as e:
        err_msg = str(e)
        if "prompt_feedback" in err_msg:
             err_msg = "Internal SDK Error (Connection Failed)"
        return {
            "trust_score": None, 
            "summary": f"Could not generate report due to AI error: {err_msg}", 
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
            
            try:
                 res_text = response.text
            except:
                 ai_data = {"results": []}
                 res_text = ""
                 
            if res_text:
                text = res_text.strip()
                if text.startswith('```json'):
                    text = text[7:-3]
                ai_data = json.loads(text)
            else:
                ai_data = {"results": []}
            
            for item in ai_data.get('results', []):
                q_id = item.get('id')
                score = float(item.get('score', 0))
                total_score += score
                results[q_id] = {
                    "correct": score >= 0.5,
                    "score": score,
                    "remarks": item.get('remarks')
                }
        except (grpc.RpcError, ConnectionError, TimeoutError) as e:
            print(f"AI Grading Network Error: {e}")
            for task in descriptive_tasks:
                 results[task['id']] = { "correct": False, "score": 0, "remarks": "AI Grading Failed: Connection/Network Error." }
        except Exception as e:
            err_msg = str(e)
            if "prompt_feedback" in err_msg:
                 err_msg = "Internal SDK Error (Network Failed)"
            print(f"AI Grading Error: {err_msg}")
            # Fallback: Mark as 0 to be safe, or manual review needed
            for task in descriptive_tasks:
                 results[task['id']] = { "correct": False, "score": 0, "remarks": f"AI Grading Failed: {err_msg}" }

    return {
        "score": round(total_score, 2),
        "total_questions": total_questions,
        "feedback": results
    }
