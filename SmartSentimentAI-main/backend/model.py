import json
from pathlib import Path
import numpy as np
from tensorflow.keras.models import load_model
from preprocessing import encode_text

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "sentiment_lstm.keras"
TOKENIZER_PATH = BASE_DIR / "models" / "tokenizer.json"
METRICS_PATH = BASE_DIR / "models" / "metrics.json"

class SentimentModel:
    def __init__(self):
        self.model = None
        self.word_index = None
        self.metrics = None
        self.load()

    def load(self):
        if MODEL_PATH.exists() and TOKENIZER_PATH.exists():
            self.model = load_model(MODEL_PATH)
            self.word_index = json.loads(TOKENIZER_PATH.read_text(encoding="utf-8"))
        if METRICS_PATH.exists():
            self.metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8"))

    @property
    def ready(self):
        return self.model is not None and self.word_index is not None

    def predict(self, text: str):
        if not self.ready:
            raise RuntimeError("LSTM model is not trained. Follow the README training steps.")
        sequence = encode_text(text, self.word_index)
        score = float(self.model.predict(sequence, verbose=0)[0][0])
        label = "Positive" if score >= 0.5 else "Negative"
        confidence = score if score >= 0.5 else 1.0 - score
        return {"sentiment": label, "confidence": round(confidence * 100, 2),
                "positive_probability": round(score * 100, 2)}
