from flask import Flask, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

# Database connection
def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

# Create tables
def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT
    )
    """)
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        time TEXT
    )
    """)
    
    conn.commit()
    conn.close()

init_db()

# 🔐 Login API
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM students WHERE username=? AND password=?", (username, password))
    user = cursor.fetchone()
    
    conn.close()
    
    if user:
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "fail"})

# 🕒 Mark Attendance
@app.route('/attendance', methods=['POST'])
def mark_attendance():
    data = request.json
    username = data['username']
    
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("INSERT INTO attendance (username, time) VALUES (?, ?)", (username, time))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Attendance Marked"})

# 📊 View Attendance
@app.route('/records', methods=['GET'])
def get_records():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM attendance")
    rows = cursor.fetchall()
    
    result = []
    for row in rows:
        result.append(dict(row))
    
    conn.close()
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
