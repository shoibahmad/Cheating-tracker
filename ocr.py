import pytesseract
from PIL import Image
import io
import re
import uuid
# Try importing pypdf for direct text extraction
try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

# Try importing pdf2image for OCR fallback
try:
    from pdf2image import convert_from_bytes
    HAS_PDF2IMAGE = True
except ImportError:
    HAS_PDF2IMAGE = False

async def extract_text_from_image(file_bytes: bytes, filename: str = "") -> str:
    """
    Extracts text from image bytes or PDF bytes.
    """
    text = ""
    try:
        # Check if PDF
        if filename.lower().endswith('.pdf') or file_bytes[:4] == b'%PDF':
            print("Detected PDF file...")
            
            # Strategy 1: Direct Text Extraction (Fast, for digital PDFs)
            if HAS_PYPDF:
                try:
                    pdf_file = io.BytesIO(file_bytes)
                    reader = PdfReader(pdf_file)
                    for i, page in enumerate(reader.pages):
                        page_text = page.extract_text()
                        if page_text:
                            text += f"\n--- Page {i+1} ---\n{page_text}"
                    print(f"Directory PDF Extraction Paged: {len(reader.pages)}")
                except Exception as e:
                    print(f"pypdf extraction failed: {e}")
            
            # Strategy 2: OCR via pdf2image (Slow, for scanned PDFs)
            # Use this if text is still empty (scanned file) or pypdf failed
            if not text.strip() and HAS_PDF2IMAGE:
                print("Falling back to OCR for PDF...")
                try:
                    images = convert_from_bytes(file_bytes)
                    for i, image in enumerate(images):
                        page_text = pytesseract.image_to_string(image)
                        text += f"\n--- Page {i+1} ---\n{page_text}"
                except Exception as e:
                    print(f"PDF OCR Error: {e}")
            elif not text.strip() and not HAS_PDF2IMAGE:
                 print("PDF text extraction failed: pypdf found no text and pdf2image not installed.")

        else:
            # Assume Image
            try:
                image = Image.open(io.BytesIO(file_bytes))
                text = pytesseract.image_to_string(image)
            except Exception as e:
                print(f"Image OCR Error: {e}")
                return ""
                
        return text
    except Exception as e:
        print(f"OCR General Error: {e}")
        return ""

def parse_questions_from_text(text: str):
    """
    Parses raw text to find questions and options.
    Supports formats:
    1. Question... 1) Question... Q1. Question...
    a) Option... A. Option... (a) Option...
    """
    questions = []
    lines = text.split('\n')
    current_q = None
    
    # Regex Patterns
    # Question start: "1.", "1)", "Q1.", "Q1)"
    q_start_pattern = r'^(?:Q|q)?\d+[\.\)]\s+'
    
    # Option start: "a)", "a.", "(a)", "A)", "A.", "(A)"
    opt_start_pattern = r'^(?:\([a-dA-D]\)|[a-dA-D][\.\)])\s+'

    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Detect Question Start
        if re.match(q_start_pattern, line):
            if current_q:
                questions.append(current_q)
            
            clean_text = re.sub(q_start_pattern, '', line)
            current_q = {
                "id": str(uuid.uuid4()), 
                "text": clean_text,
                "options": [],
                "correct_answer": 0
            }
        
        # Detect Option
        elif re.match(opt_start_pattern, line):
            if current_q:
                clean_opt = re.sub(opt_start_pattern, '', line)
                if len(current_q["options"]) < 4:
                    current_q["options"].append(clean_opt)
        
        # Continuation of text
        elif current_q:
            # If we haven't started collecting options yet, append to question text
            if len(current_q["options"]) == 0:
                current_q["text"] += " " + line
            else:
                # If we have options, maybe it's a multiline option? 
                # For simplicity, append to the last option
                current_q["options"][-1] += " " + line
            
    if current_q:
        questions.append(current_q)
        
    # Validation & Fill
    valid_questions = []
    for q in questions:
        # Filter out junk
        if len(q["text"]) < 3: 
            continue
            
        # Ensure 4 options
        while len(q["options"]) < 4:
            q["options"].append("")
            
        valid_questions.append(q)
            
    return valid_questions
