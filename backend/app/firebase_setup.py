import firebase_admin
from firebase_admin import credentials, auth, firestore
import os

# Initialize Firebase Admin
# Initialize Firebase Admin
cred_filename = "eval-6be19-firebase-adminsdk-fbsvc-0693781b8f.json"
cred_path = os.path.join(os.path.dirname(__file__), "..", cred_filename)

if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
elif os.getenv("FIREBASE_CREDENTIALS"):
    import json
    import ast
    # Parse JSON from environment variable
    cred_str = os.getenv("FIREBASE_CREDENTIALS")
    try:
        cred_dict = json.loads(cred_str)
    except json.JSONDecodeError:
        print("Warning: Failed to parse FIREBASE_CREDENTIALS as JSON. Attempting literal_eval...")
        try:
            cred_dict = ast.literal_eval(cred_str)
        except Exception as e:
            print(f"Error parsing FIREBASE_CREDENTIALS: {e}")
            raise e
            
    cred = credentials.Certificate(cred_dict)
else:
    cred = None
    print(f"WARNING: {cred_filename} not found and FIREBASE_CREDENTIALS env var not set.")

if cred:
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)

def get_db():
    try:
        return firestore.client()
    except Exception as e:
        print(f"Error getting Firestore client: {e}")
        return None
