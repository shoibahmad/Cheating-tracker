import pytesseract
from PIL import Image
import io
import re

async def extract_text_from_image(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

def parse_questions_from_text(text: str):
    """
    Parses raw text to find questions and options.
    Assumes format:
    1. Question text
    a) Option A
    b) Option B ...
    """
    questions = []
    # Simple regex to find "1. ", "Q1.", etc.
    # This is a basic parser and might need refinement based on actual input format
    # For now, we'll try to split by numbered lines
    
    lines = text.split('\n')
    current_q = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect Question Start (e.g., "1.", "2)")
        if re.match(r'^\d+[\.)]', line):
            if current_q:
                questions.append(current_q)
            current_q = {
                "id": f"q{len(questions)+1}",
                "text": re.sub(r'^\d+[\.)]\s*', '', line),
                "options": [],
                "correct_answer": 0
            }
        # Detect Option (e.g., "a)", "A.", "(a)")
        elif re.match(r'^[a-dA-D][\.)\)]', line) or re.match(r'^\([a-dA-D]\)', line):
            if current_q:
                opt_text = re.sub(r'^[a-dA-D][\.)\)]\s*|^\([a-dA-D]\)\s*', '', line)
                if len(current_q["options"]) < 4:
                    current_q["options"].append(opt_text)
        elif current_q:
            # Append to current question text if not an option and question exists
            # (unless strictly detecting options)
            if len(current_q["options"]) == 0:
                current_q["text"] += " " + line
            
    if current_q:
        questions.append(current_q)
        
    # Fill empty options if parsing failed to find 4
    for q in questions:
        while len(q["options"]) < 4:
            q["options"].append("")
            
    return questions
