from contextlib import asynccontextmanager
from io import StringIO
import csv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from database import init_db, add_analysis, get_history, get_stats, clear_history
from model import SentimentModel
from genai import explain_sentiment

sentiment_model = SentimentModel()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="SmartSentiment AI API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=3, max_length=5000)

@app.get("/")
def status():
    return {"status": "ok", "application": "SmartSentiment AI",
            "model_ready": sentiment_model.ready}

@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    text = payload.text.strip()
    if len(text) < 3:
        raise HTTPException(status_code=422, detail="Please enter at least 3 characters.")
    try:
        prediction = sentiment_model.predict(text)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    ai = explain_sentiment(text, prediction["sentiment"], prediction["confidence"])
    row_id, timestamp = add_analysis(text, prediction["sentiment"], prediction["confidence"],
                                     ai["explanation"], ai["source"])
    return {"id": row_id, "text": text, **prediction,
            "explanation": ai["explanation"], "explanation_source": ai["source"],
            "created_at": timestamp}

@app.get("/history")
def history():
    return get_history()

@app.delete("/history")
def delete_history():
    clear_history()
    return {"message": "Analysis history cleared."}

@app.get("/stats")
def stats():
    return get_stats()

@app.get("/metrics")
def metrics():
    return sentiment_model.metrics or {
        "status": "not_trained",
        "message": "Train the LSTM model using: python train_model.py"
    }

@app.get("/export")
def export_csv():
    rows = get_history(limit=10000)
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "id", "text", "sentiment", "confidence", "explanation",
        "explanation_source", "created_at"])
    writer.writeheader()
    writer.writerows(rows)
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=smartsentiment_history.csv"})
