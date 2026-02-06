import sqlite3
import os

# Use absolute path to avoid confusion
db_path = r"d:/Stop Cheating/database.db"
print(f"Connecting to: {db_path}")

if not os.path.exists(db_path):
    print("ERROR: Database file not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

session_id = "4f811bc7-b8c5-4237-901e-0112928a40df"

print(f"Inspecting Session: {session_id}")

try:
    # 1. Check Session
    cursor.execute("SELECT id, student_name, question_paper_id FROM examsession WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    
    if not row:
        print("Session NOT FOUND in DB.")
    else:
        print(f"Session Found: ID={row[0]}, Student={row[1]}, PaperID={row[2]}")
        paper_id = row[2]
        
        if paper_id:
            # 2. Check Paper
            cursor.execute("SELECT id, title, subject FROM questionpaper WHERE id = ?", (paper_id,))
            paper_row = cursor.fetchone()
            if paper_row:
                print(f"Paper Found: Title={paper_row[1]}, Subject={paper_row[2]}")
                
                # 3. Check Questions
                cursor.execute("SELECT id, text FROM question WHERE question_paper_id = ?", (paper_id,))
                questions = cursor.fetchall()
                print(f"Questions Found: {len(questions)}")
                for q in questions:
                    print(f" - {q[1]} (ID: {q[0]})")
            else:
                print(f"Paper ID {paper_id} NOT FOUND in questionpaper table.")
        else:
            print("No Question Paper ID is linked to this session.")
            
except Exception as e:
    print(f"Error querying DB: {e}")
    # List tables to see if we are crazy
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print("Tables in DB:", cursor.fetchall())

conn.close()
