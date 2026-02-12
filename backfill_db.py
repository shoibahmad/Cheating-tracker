
import sqlite3
from datetime import datetime

def backfill_db():
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        
        # Check rows with NULL student_id
        cursor.execute("SELECT count(*) FROM examsession WHERE student_id IS NULL")
        count = cursor.fetchone()[0]
        print(f"Rows with NULL student_id: {count}")
        
        if count > 0:
            print("Backfilling NULL columns...")
            # Set defaults for legacy sessions
            default_date = datetime.utcnow().isoformat()
            cursor.execute("""
                UPDATE examsession 
                SET student_id = 'legacy_student',
                    student_name = 'Legacy Candidate',
                    exam_id = 'legacy_exam',
                    exam_title = 'Legacy Session',
                    created_at = ?,
                    status = 'Completed',
                    trust_score = 0
                WHERE student_id IS NULL
            """, (default_date,))
            
            conn.commit()
            print("Backfill complete.")
        else:
            print("No rows needed backfilling.")
            
        # Verify
        cursor.execute("SELECT id, student_name, created_at FROM examsession LIMIT 5")
        rows = cursor.fetchall()
        print("Sample rows:", rows)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    backfill_db()
