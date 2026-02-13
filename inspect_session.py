
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Initialize Firebase (Admin SDK)
if not firebase_admin._apps:
    cred = credentials.Certificate(r"d:\Stop Cheating\backend\app\serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

session_id = "pIKrxRCDmDJDEQ5uq21G"
doc_ref = db.collection("sessions").document(session_id)
doc = doc_ref.get()

if doc.exists:
    data = doc.to_dict()
    print(f"Session ID: {session_id}")
    print(f"Status: {data.get('status')}")
    print(f"Latest Log (Raw): '{data.get('latest_log')}'")
    print(f"Latest Log (Type): {type(data.get('latest_log'))}")
else:
    print("Session not found")
