import os
import google.generativeai as genai
from dotenv import load_dotenv

# Use full path to .env
load_dotenv(r"d:\Stop Cheating\backend\.env")
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
    try:
        print("Checking models...")
        models = genai.list_models()
        for m in models:
            if 'generateContent' in m.supported_generation_methods:
                print(f"Model available: {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")
else:
    print("API Key missing")
