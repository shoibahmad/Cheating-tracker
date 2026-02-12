
import sqlite3

def fix_db():
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        
        # Get existing columns
        cursor.execute("PRAGMA table_info(examsession)")
        columns = [info[1] for info in cursor.fetchall()]
        print(f"Existing columns: {columns}")
        
        # Add student_id if missing
        if 'student_id' not in columns:
            print("Adding student_id column...")
            cursor.execute("ALTER TABLE examsession ADD COLUMN student_id TEXT")
            
        # Add student_name if missing
        if 'student_name' not in columns:
            print("Adding student_name column...")
            cursor.execute("ALTER TABLE examsession ADD COLUMN student_name TEXT")

        # Add exam_id if missing
        if 'exam_id' not in columns:
            print("Adding exam_id column...")
            cursor.execute("ALTER TABLE examsession ADD COLUMN exam_id TEXT")

        # Add created_at if missing
        if 'created_at' not in columns:
            print("Adding created_at column...")
            cursor.execute("ALTER TABLE examsession ADD COLUMN created_at TEXT")

        # Add exam_title if missing
        if 'exam_title' not in columns:
            print("Adding exam_title column...")
            cursor.execute("ALTER TABLE examsession ADD COLUMN exam_title TEXT")

        # Add termination_reason if missing (nullable)
        if 'termination_reason' not in columns:
            print("Adding termination_reason column...")
            cursor.execute("ALTER TABLE examsession ADD COLUMN termination_reason TEXT")
            
        conn.commit()
        print("Database schema updated successfully.")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    fix_db()
