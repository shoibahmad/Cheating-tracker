import os
import google.generativeai as genai
import traceback
from dotenv import load_dotenv

# Load environment
print("--- DEBUG SESSION START ---")
load_dotenv(r"d:\Stop Cheating\backend\.env")
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("CRITICAL: GEMINI_API_KEY is missing from .env")
else:
    print(f"API Key found (length: {len(api_key)})")
    genai.configure(api_key=api_key)

    # Use the model name the user requested
    model_name = 'gemini-2.5-flash'
    print(f"Attempting to use model: {model_name}")

    try:
        model = genai.GenerativeModel(model_name)
        
        # Test with a simple prompt first (no file)
        print("Test 1: Simple prompt...")
        response = model.generate_content("Hello, write a 1-sentence test response.")
        print(f"Test 1 Success! Response: {response.text}")

        # Test 2: Mock OCR (small image/data)
        print("\nTest 2: Mock binary data...")
        # Just sending some dummy bytes to see if it triggers the gRPC error
        dummy_data = b"dummy data"
        response = model.generate_content([
            {'mime_type': 'image/png', 'data': dummy_data},
            "Extract text."
        ])
        print(f"Test 2 Success! Response: {response.text}")

    except Exception as e:
        print("\n--- ERROR DETECTED ---")
        print(f"Error Type: {type(e)}")
        print(f"Error Message: {str(e)}")
        print("\nFULL STACK TRACE:")
        traceback.print_exc()

print("\n--- DEBUG SESSION END ---")
