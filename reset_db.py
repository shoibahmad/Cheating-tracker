
import sqlite3

def reset_tables():
    try:
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        
        print("Dropping tables...")
        cursor.execute("DROP TABLE IF EXISTS monitoringlog")
        cursor.execute("DROP TABLE IF EXISTS examsession")
        
        conn.commit()
        print("Tables dropped. Restart the backend to recreate them.")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    reset_tables()
