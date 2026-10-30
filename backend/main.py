
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pathlib import Path
from datetime import datetime
import sqlite3

# Application
app = FastAPI(
    title="MediMate AI API",
    description="Backend for MediMate AI Healthcare Assistant",
    version="1.0"
)

# Allow React frontend to communicate with Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database location
DB_PATH = Path(__file__).with_name("medimate.db")


# Create database and table
def initialize_database():
    connection = sqlite3.connect(DB_PATH)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS hydration_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount_ml INTEGER NOT NULL,
            logged_at TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


initialize_database()


# Input validation
class HydrationEntry(BaseModel):
    amount_ml: int = Field(gt=0, le=2000)


# Test API
@app.get("/")
def home():
    return {
        "message": "Welcome to MediMate AI Backend",
        "status": "Running successfully"
    }


# Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "application": "MediMate AI"
    }


# Add water intake
@app.post("/api/hydration")
def add_hydration(entry: HydrationEntry):

    logged_at = datetime.now().isoformat(timespec="seconds")

    connection = sqlite3.connect(DB_PATH)

    cursor = connection.execute(
        """
        INSERT INTO hydration_logs (amount_ml, logged_at)
        VALUES (?, ?)
        """,
        (entry.amount_ml, logged_at)
    )

    connection.commit()

    record_id = cursor.lastrowid
    connection.close()

    return {
        "message": "Water intake saved successfully",
        "id": record_id,
        "amount_ml": entry.amount_ml,
        "logged_at": logged_at
    }


# Get today's water intake
@app.get("/api/hydration/today")
def get_hydration():

    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    rows = connection.execute(
        """
        SELECT id, amount_ml, logged_at
        FROM hydration_logs
        WHERE date(logged_at) = date('now', 'localtime')
        ORDER BY id DESC
        """
    ).fetchall()

    total = sum(row["amount_ml"] for row in rows)

    connection.close()

    return {
        "total_ml": total,
        "entries": [dict(row) for row in rows]
    }
