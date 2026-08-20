"""
AI Service module for SecureEval.

Provides Gemini-powered exam extraction, grading, report generation,
semantic consistency analysis, and question generation.
"""

import json
import os

import google.generativeai as genai
import grpc
import typing_extensions as typing
from google.api_core.exceptions import FailedPrecondition, InvalidArgument

from backend.app.logging_config import get_logger

logger = get_logger(__name__)

# Configure API Key
API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
    logger.info("AI Service Loaded: v2.0-Reloaded")
else:
    logger.warning("GEMINI_API_KEY not set — AI features will be unavailable")


# --- Schema Definitions ---


class Option(typing.TypedDict):
    text: str
    label: str  # 'a', 'b', 'c', 'd'


class Question(typing.TypedDict):
    id: int
    text: str
    options: list[Option]
    correctAnswer: str  # 'a', 'b', 'c', 'd'
    marks: int


# --- Helper Functions ---


def _parse_ai_json(text: str) -> dict:
    """
    Parse JSON from AI response text, handling common formatting issues
    like markdown code fences.

    Args:
        text: Raw response text from Gemini.

    Returns:
        Parsed JSON as a dictionary.

    Raises:
        json.JSONDecodeError: If the text cannot be parsed as JSON.
    """
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return json.loads(cleaned.strip())


def _safe_get_response_text(response) -> str | None:
    """
    Safely extract text from a Gemini response, handling SDK edge cases.

    Returns:
        Response text string, or None if unreadable.
    """
    try:
        return response.text
    except Exception as e:
        logger.warning("Could not read Gemini response text: %s", e)
        return None


# --- Core AI Functions ---


def extract_exam_and_insights(file_bytes: bytes, mime_type: str) -> dict:
    """
    Uses Gemini Flash to extract exam questions and provide insights.

    Args:
        file_bytes: Raw file content (image or PDF).
        mime_type: MIME type of the uploaded file.

    Returns:
        Dictionary with 'questions' list and 'insights' string.
    """
    if not API_KEY:
        raise Exception("GEMINI_API_KEY not configured")

    model = genai.GenerativeModel("gemini-2.5-flash")

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
        response = model.generate_content([{"mime_type": mime_type, "data": file_bytes}, prompt])

        res_text = _safe_get_response_text(response)
        if res_text is None:
            return {
                "error": "Gemini returned a response that could not be read "
                "(possibly safety blocked or invalid model response).",
                "questions": [],
            }

        logger.debug("Gemini extraction response length: %d chars", len(res_text))

        if not res_text:
            return {"error": "Gemini returned empty response.", "questions": []}

        return _parse_ai_json(res_text)

    except json.JSONDecodeError:
        logger.error("JSON decode error in exam extraction. Raw text: %s", res_text[:200] if res_text else "N/A")
        return {"error": "Failed to parse AI response.", "questions": []}
    except FailedPrecondition as e:
        logger.error("Gemini location/precondition error: %s", e)
        return {"error": f"Google API Error: {e}. The model might not be available in your region.", "questions": []}
    except InvalidArgument as e:
        logger.error("Gemini invalid argument: %s", e)
        return {"error": f"Invalid Argument (Model/Config): {e}", "questions": []}
    except (grpc.RpcError, ConnectionError, TimeoutError) as e:
        logger.error("AI service network error: %s - %s", type(e).__name__, e)
        return {"error": "AI Service Connection Timeout or Network Error. Please try again.", "questions": []}
    except Exception as e:
        err_msg = str(e)
        if "prompt_feedback" in err_msg or "InactiveRpcError" in err_msg:
            err_msg = "AI Service Communication Failure (Internal SDK Error)."

        logger.error("Gemini AI error: %s (%s)", err_msg, type(e).__name__)
        return {"error": f"AI Service Error: {err_msg}", "questions": []}


def analyze_student_session(monitoring_logs: list, exam_score: float) -> str:
    """
    Analyzes monitoring logs to detect cheating patterns.

    Args:
        monitoring_logs: List of monitoring log entries.
        exam_score: Student's exam score percentage.

    Returns:
        AI-generated assessment string.
    """
    if not API_KEY:
        return "AI analysis unavailable (API Key missing)."

    model = genai.GenerativeModel("gemini-2.5-flash")

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
        logger.error("Network error analyzing student session")
        return "Error analyzing session: Connection Timeout or Network Failure."
    except Exception as e:
        err_msg = str(e)
        if "prompt_feedback" in err_msg:
            err_msg = "Internal SDK Error (Connection Failed)"
        logger.error("Error analyzing session: %s", err_msg)
        return f"Error analyzing session: {err_msg}"


def generate_exam_report(logs: list, score: float, total_questions: int) -> dict:
    """
    Generates a detailed post-exam report using Gemini.

    Args:
        logs: Session violation/monitoring logs.
        score: Student's achieved score.
        total_questions: Total number of questions.

    Returns:
        Dictionary with trust_score, summary, and suspicious_moments.
    """
    if not API_KEY:
        return {"summary": "AI analysis unavailable.", "trust_score_analysis": "N/A", "timeline_analysis": []}

    model = genai.GenerativeModel("gemini-2.5-flash")

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
        res_text = _safe_get_response_text(response)

        if not res_text:
            return {"summary": "AI returned empty report.", "trust_score": None, "suspicious_moments": []}

        return _parse_ai_json(res_text)

    except json.JSONDecodeError:
        logger.error("JSON decode error in report generation")
        return {"trust_score": None, "summary": "Could not parse AI report.", "suspicious_moments": []}
    except (grpc.RpcError, ConnectionError, TimeoutError):
        logger.error("Network error generating exam report")
        return {
            "trust_score": None,
            "summary": "Could not generate report: AI Service Connection Timeout.",
            "suspicious_moments": [],
        }
    except Exception as e:
        err_msg = str(e)
        if "prompt_feedback" in err_msg:
            err_msg = "Internal SDK Error (Connection Failed)"
        logger.error("Error generating exam report: %s", err_msg)
        return {
            "trust_score": None,
            "summary": f"Could not generate report due to AI error: {err_msg}",
            "suspicious_moments": [],
        }


def evaluate_exam_submission(questions: list, student_answers: dict) -> dict:
    """
    Evaluates an exam submission using AI for descriptive answers
    and strict matching for MCQs.

    Args:
        questions: List of question objects from the database.
        student_answers: Dictionary of {question_id: answer}.

    Returns:
        Dictionary with score, total_questions, and feedback per question.
    """
    if not API_KEY:
        return {"error": "AI Service Unavailable"}

    model = genai.GenerativeModel("gemini-2.5-flash")

    results = {}
    total_score = 0
    total_questions = len(questions)

    # Separate Descriptive Questions for AI Batch Processing
    descriptive_tasks = []

    for i, q in enumerate(questions):
        q_id = str(q.get("id", i))
        u_ans = student_answers.get(str(q_id))
        q_type = q.get("type", "mcq")

        if q_type == "mcq":
            # Strict Grading
            correct_idx = q.get("correct_answer")
            is_correct = False
            try:
                if u_ans is not None and int(u_ans) == int(correct_idx):
                    is_correct = True
            except (ValueError, TypeError):
                pass

            score = 1.0 if is_correct else 0.0
            total_score += score
            results[q_id] = {"correct": is_correct, "score": score, "remarks": "Correct" if is_correct else "Incorrect"}

        elif q_type == "descriptive":
            descriptive_tasks.append({"id": q_id, "text": q.get("text"), "answer": u_ans, "max_score": 1})

    # Batch Process Descriptive Answers
    if descriptive_tasks:
        prompt = f"""
        You are a strict academic examiner. Grade the following student answers.

        Tasks: {json.dumps(descriptive_tasks)}

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
            res_text = _safe_get_response_text(response)

            ai_data = _parse_ai_json(res_text) if res_text else {"results": []}

            for item in ai_data.get("results", []):
                q_id = item.get("id")
                score = float(item.get("score", 0))
                total_score += score
                results[q_id] = {"correct": score >= 0.5, "score": score, "remarks": item.get("remarks")}
        except (grpc.RpcError, ConnectionError, TimeoutError) as e:
            logger.error("AI grading network error: %s", e)
            for task in descriptive_tasks:
                results[task["id"]] = {
                    "correct": False,
                    "score": 0,
                    "remarks": "AI Grading Failed: Connection/Network Error.",
                }
        except Exception as e:
            err_msg = str(e)
            if "prompt_feedback" in err_msg:
                err_msg = "Internal SDK Error (Network Failed)"
            logger.error("AI grading error: %s", err_msg)
            for task in descriptive_tasks:
                results[task["id"]] = {"correct": False, "score": 0, "remarks": f"AI Grading Failed: {err_msg}"}

    return {"score": round(total_score, 2), "total_questions": total_questions, "feedback": results}


def check_semantic_consistency(student_answers: list) -> dict:
    """
    Analyzes multiple descriptive answers from a student to detect
    writing style shifts that may indicate copying.

    Args:
        student_answers: List of descriptive answer strings.

    Returns:
        Dictionary with style_consistency_score, findings, and suspicious_indices.
    """
    if not API_KEY or not student_answers:
        return {"suspicion_score": 0, "reason": "No answers to analyze."}

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
    Analyze the writing style of the following answers provided by the same student in a single exam.
    Detect if any answer appears to be from a different source (e.g., copied from a textbook or internet)
    compared to the other answers based on tone, vocabulary, and complexity.

    Answers:
    {json.dumps(student_answers)}

    Output JSON:
    {{
        "style_consistency_score": 0-100, // 100 is perfectly consistent, 0 is highly suspicious
        "findings": "Explanation of style shifts detected.",
        "suspicious_indices": [0, 1] // indices of suspicious answers
    }}
    """

    try:
        response = model.generate_content(prompt)
        res_text = response.text
        return _parse_ai_json(res_text)
    except Exception as e:
        logger.error("Error in semantic consistency check: %s", e)
        return {"error": str(e), "style_consistency_score": 100}


def generate_questions_from_content(content: str) -> dict:
    """
    Generates balanced MCQs and Descriptive questions from raw text.

    Args:
        content: Raw text content to generate questions from.

    Returns:
        Dictionary with title and questions list.
    """
    if not API_KEY:
        return {"questions": []}

    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
    Create a professional exam based on the following content.
    Generate 5 MCQs and 3 Descriptive questions.

    Content:
    {content[:5000]}

    Output JSON:
    {{
      "title": "Generated Exam",
      "questions": [
        {{
          "text": "...",
          "type": "mcq",
          "options": ["A", "B", "C", "D"],
          "correct_answer": 0, // index of correct option
          "marks": 1
        }},
        {{
          "text": "...",
          "type": "descriptive",
          "marks": 5
        }}
      ]
    }}
    """

    try:
        response = model.generate_content(prompt)
        res_text = response.text
        return _parse_ai_json(res_text)
    except Exception as e:
        logger.error("Error generating questions: %s", e)
        return {"error": str(e), "questions": []}
