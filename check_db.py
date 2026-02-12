
import sqlite3

def check_columns():
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(examsession)")
        columns = [info[1] for info in cursor.fetchall()]
        print(f"Current columns in examsession: {columns}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_columns()
