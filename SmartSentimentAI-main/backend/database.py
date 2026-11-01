import sqlite3
from pathlib import Path
from datetime import datetime, timezone

DB_PATH = Path(__file__).resolve().parent / "sentiment.db"

def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                sentiment TEXT NOT NULL,
                confidence REAL NOT NULL,
                explanation TEXT NOT NULL,
                explanation_source TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

def add_analysis(text, sentiment, confidence, explanation, source):
    timestamp = datetime.now(timezone.utc).isoformat()
    with connect() as conn:
        cur = conn.execute(
            "INSERT INTO analyses(text,sentiment,confidence,explanation,explanation_source,created_at) VALUES(?,?,?,?,?,?)",
            (text, sentiment, confidence, explanation, source, timestamp))
        return cur.lastrowid, timestamp

def get_history(limit=200):
    with connect() as conn:
        rows = conn.execute("SELECT * FROM analyses ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
        return [dict(row) for row in rows]

def get_stats():
    with connect() as conn:
        total = conn.execute("SELECT COUNT(*) FROM analyses").fetchone()[0]
        positive = conn.execute("SELECT COUNT(*) FROM analyses WHERE sentiment='Positive'").fetchone()[0]
        negative = total - positive
    return {"total": total, "positive": positive, "negative": negative}

def clear_history():
    with connect() as conn:
        conn.execute("DELETE FROM analyses")
