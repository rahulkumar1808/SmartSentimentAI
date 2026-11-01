"""Train a compact LSTM on a manageable subset of Keras' IMDb dataset.

First run downloads the IMDb integer-encoded dataset from the Keras dataset host.
The first 8,000 training reviews are used for a fast one-day demonstration.
"""
import json
from pathlib import Path
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
from tensorflow.keras.datasets import imdb
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout
from tensorflow.keras.preprocessing.sequence import pad_sequences
from preprocessing import MAX_LEN, MAX_WORDS

BASE = Path(__file__).resolve().parent
MODEL_DIR = BASE / "models"
MODEL_DIR.mkdir(exist_ok=True)

def main():
    print("Downloading/loading IMDb dataset (internet required on first run)...")
    (x_train, y_train), (x_test, y_test) = imdb.load_data(num_words=MAX_WORDS)
    # Keep the subset intentionally small for a one-day project.
    x = np.concatenate([x_train[:8000], x_test[:2000]])
    y = np.concatenate([y_train[:8000], y_test[:2000]])
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42, stratify=y)
    x_train = pad_sequences(x_train, maxlen=MAX_LEN, padding="pre", truncating="pre")
    x_test = pad_sequences(x_test, maxlen=MAX_LEN, padding="pre", truncating="pre")

    model = Sequential([
        Embedding(MAX_WORDS, 64, input_length=MAX_LEN, mask_zero=True),
        LSTM(64, dropout=0.2, recurrent_dropout=0.0),
        Dense(32, activation="relu"),
        Dropout(0.3),
        Dense(1, activation="sigmoid")
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    model.summary()
    model.fit(x_train, y_train, validation_split=0.15, epochs=3,
              batch_size=64, verbose=1, callbacks=[])
    probabilities = model.predict(x_test, verbose=0).ravel()
    predictions = (probabilities >= 0.5).astype(int)
    metrics = {
        "status": "trained",
        "dataset": "IMDb (8,000 train + 2,000 test source subset; split 80/20)",
        "epochs": 3,
        "accuracy": round(float(accuracy_score(y_test, predictions)), 4),
        "precision": round(float(precision_score(y_test, predictions, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, predictions, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, predictions, zero_division=0)), 4),
        "test_samples": int(len(y_test))
    }
    model.save(MODEL_DIR / "sentiment_lstm.keras")
    word_index = imdb.get_word_index()
    (MODEL_DIR / "tokenizer.json").write_text(json.dumps(word_index), encoding="utf-8")
    (MODEL_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print("\nActual held-out evaluation metrics:")
    print(json.dumps(metrics, indent=2))
    print(f"\nSaved model artifacts to: {MODEL_DIR}")

if __name__ == "__main__":
    main()
