
import sqlite3

def inspect_db():
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        
        # 1. Check Table DDL (to see how ID is defined)
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='examsession'")
        ddl = cursor.fetchone()
        print(f"Table DDL: {ddl[0] if ddl else 'Table not found'}")
        
        # 2. Check for NULLs in required fields
        required_cols = ['student_id', 'student_name', 'exam_id', 'exam_title', 'created_at']
        for col in required_cols:
            cursor.execute(f"SELECT count(*) FROM examsession WHERE {col} IS NULL")
            count = cursor.fetchone()[0]
            print(f"Rows with NULL {col}: {count}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    inspect_db()
