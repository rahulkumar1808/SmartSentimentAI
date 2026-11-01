# SmartSentiment AI – Intelligent Sentiment Analysis Using Deep Learning and Generative AI

> A one-day-scope full-stack project that classifies review sentiment with a trained LSTM and optionally explains the result with Groq Generative AI.

## 1. Project overview
SmartSentiment AI accepts a review or message, predicts **Positive** or **Negative** sentiment using a TensorFlow/Keras LSTM, and reports model confidence. An optional Groq language model explains the LSTM result in simple English. The React dashboard stores analysis history in SQLite, visualizes sentiment distribution, and exports CSV.

**Important separation:** the LSTM is the only sentiment classifier. Groq receives the text and the already-computed LSTM label to explain it; Groq does not decide the sentiment.

## 2. Problem statement
Businesses and product teams receive large volumes of written feedback. Manual review is time-consuming, while a bare positive/negative label does not explain which parts of a review influenced the prediction. This project demonstrates an automated classification workflow with a human-readable explanation layer.

## 3. Project objectives
- Build and evaluate a binary LSTM sentiment classifier.
- Expose inference and history through a REST API.
- Add optional GenAI explanations without making the app depend on an API key.
- Present results, metrics, and saved history in a responsive dashboard.
- Keep setup small enough for a one-day college demonstration.

## 4. Features
- Review input, examples, character count, and clear action.
- LSTM prediction and confidence percentage.
- Optional Groq explanation, with graceful no-key/API-error behavior.
- Dashboard totals and positive/negative Doughnut chart.
- SQLite history with search and clear action.
- CSV export.
- Model performance page populated from actual training metrics.
- Dark/light theme toggle and responsive layout.

## 5. Technology stack
| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, JavaScript, HTML, CSS |
| Charts | Chart.js, react-chartjs-2 |
| Backend | Python, FastAPI, Uvicorn, REST |
| Database | SQLite |
| Deep learning | TensorFlow/Keras, LSTM, NumPy |
| NLP / evaluation | IMDb dataset, Keras tokenizer format, scikit-learn, NLTK dependency |
| Generative AI | Groq Python SDK (optional) |

## 6. System architecture
```text
Browser (React + Chart.js)
        |
        | HTTP / JSON
        v
FastAPI REST API --------------------> SQLite (analysis history)
        |
        +--> preprocessing.py --> Saved tokenizer --> Saved LSTM --> Positive/Negative + confidence
        |
        +--> genai.py --> Groq API (optional explanation only)
        |
        +--> metrics.json (actual held-out evaluation metrics)
```

## 7. Project folder structure
```text
SmartSentimentAI/
├── backend/
│   ├── main.py
│   ├── model.py
│   ├── preprocessing.py
│   ├── genai.py
│   ├── database.py
│   ├── train_model.py
│   ├── requirements.txt
│   ├── .env.example
│   └── models/                 # created model artifacts after training
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
├── dataset/                    # optional location for a separately downloaded dataset
├── screenshots/                # add your own screenshots here
├── .gitignore
└── README.md
```

## 8. Installation requirements
- Windows 10/11, 64-bit.
- Python **3.10** recommended (TensorFlow 2.15 compatibility); Python 3.11 may work depending on the TensorFlow wheel available for your platform.
- Node.js 18 or 20 LTS and npm.
- Internet for first-time dependency and IMDb dataset downloads.
- 8 GB RAM recommended; training is CPU-capable but can take time.
- Groq API key is optional.

## 9–13. Windows setup, virtual environment, backend, frontend, and Groq configuration

### Step 1 — Open PowerShell in the project root
```powershell
cd path\to\SmartSentimentAI
```

### Step 2 — Create and activate Python virtual environment
```powershell
py -3.10 -m venv .venv
.\.venv\Scripts\Activate.ps1
python --version
python -m pip install --upgrade pip
```
If PowerShell blocks activation for this terminal session:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### Step 3 — Install backend dependencies and train once
```powershell
cd backend
pip install -r requirements.txt
python train_model.py
```
Training downloads the IMDb dataset through `tensorflow.keras.datasets.imdb` on first use. The script uses 8,000 training-source reviews plus 2,000 test-source reviews, creates an 80/20 stratified train/test split, trains for 3 epochs, evaluates the held-out split, and saves:
- `backend/models/sentiment_lstm.keras`
- `backend/models/tokenizer.json`
- `backend/models/metrics.json`

Do not delete these artifacts if you want to reuse the trained model. The API loads them at startup; it does **not** train on every launch.

### Step 4 — Optional Groq configuration
```powershell
Copy-Item .env.example .env
notepad .env
```
Set `GROQ_API_KEY=your_real_key` and, if desired, `GROQ_MODEL=llama-3.3-70b-versatile`. Obtain a key from the Groq developer console. Never commit `.env`; it is ignored by Git. If no key is configured, sentiment analysis and history continue to work and the explanation is clearly marked unavailable. If Groq changes model availability, set `GROQ_MODEL` to a model currently enabled for your account.

### Step 5 — Start the backend
Run from the `backend` directory:
```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Open API docs at `http://127.0.0.1:8000/docs`. Keep this terminal running.

### Step 6 — Start the frontend in a second PowerShell window
```powershell
cd path\to\SmartSentimentAI\frontend
npm install
npm run dev
```
Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

### Optional frontend API URL
The frontend defaults to `http://127.0.0.1:8000`. To override it, create `frontend/.env`:
```text
VITE_API_URL=http://127.0.0.1:8000
```
Restart Vite after changing environment variables.

## 14. Dataset download and preparation
The training script uses the IMDb movie-review sentiment dataset provided by `tensorflow.keras.datasets.imdb`. Keras downloads and caches it on first training run; you do not need to manually place a dataset file in `dataset/`. Labels are binary: 0 = negative, 1 = positive. For reproducibility, the code limits the source subset to 8,000 training reviews and 2,000 test reviews before creating a stratified 80/20 split. Internet access is required for the first download. If download fails, retry on a stable connection; alternatively download the IMDb dataset from the official Keras dataset source and configure the local Keras cache, then rerun training. Do not substitute made-up metrics.

## 15. LSTM model workflow
```text
Raw review
 -> lowercase / remove HTML breaks and punctuation noise
 -> convert words to integer IDs using IMDb word index
 -> pad/truncate to 200 tokens
 -> Embedding (20,000 vocabulary, 64 dimensions)
 -> LSTM (64 units)
 -> Dense (32, ReLU) + Dropout
 -> Dense (1, sigmoid)
 -> threshold at 0.5 -> Positive or Negative
```
The model is trained with Adam and binary cross-entropy. The sigmoid output is the model's positive-class probability. Confidence is the probability of the selected class (for negative, `1 - positive_probability`). The tokenizer word index is saved separately and reused for inference.

## 16. How Generative AI works
After LSTM inference, the backend sends the original text, LSTM label, and confidence to Groq. The system prompt asks the language model to explain the supplied prediction, identify short supporting phrases, and give one constructive improvement suggestion for negative feedback. The UI labels the explanation source. If the key is absent or the API fails, a clear unavailable message is returned while the LSTM result is retained.

## 17. API endpoint documentation
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API status and model readiness |
| POST | `/analyze` | Predict sentiment, explain, and save result |
| GET | `/history` | Retrieve saved analyses (newest first) |
| DELETE | `/history` | Clear saved history |
| GET | `/stats` | Total, positive, and negative counts |
| GET | `/metrics` | Actual model metrics, or not-trained status |
| GET | `/export` | Download saved history as CSV |

### POST `/analyze` example
Request:
```json
{"text":"The film was moving, beautifully acted, and thoroughly enjoyable."}
```
Response shape (values below are illustrative only; your actual prediction/confidence depend on the trained model):
```json
{
  "id": 1,
  "text": "The film was moving, beautifully acted, and thoroughly enjoyable.",
  "sentiment": "Positive",
  "confidence": 0.0,
  "positive_probability": 0.0,
  "explanation": "Explanation returned by Groq or the unavailable fallback.",
  "explanation_source": "groq",
  "created_at": "UTC ISO timestamp"
}
```
The numeric values above are placeholders to illustrate response fields, not claimed model results.

## 18. Screenshots
Add your screenshots to `screenshots/` and update the links below:
- `![Dashboard](screenshots/dashboard.png)`
- `![Analyzer](screenshots/analyzer.png)`
- `![History](screenshots/history.png)`
- `![Model metrics](screenshots/model-performance.png)`

## 19. Sample input and output
Positive test input:
> The story was captivating, the acting was brilliant, and I enjoyed every minute.

Negative test input:
> The plot was confusing and slow. The acting felt dull and the ending disappointed me.

These are test examples, not guaranteed labels. The trained model determines the result at runtime.

## 20. Model evaluation metrics
The training script calculates **accuracy, precision, recall, and F1-score** on a held-out test split and writes the actual values to `backend/models/metrics.json`. The Model Performance page reads this file through `GET /metrics`. No evaluation values are pre-filled or fabricated. Before training, the page correctly displays “not available yet”.

## 21. Common errors and troubleshooting
- **`Model is not trained` / HTTP 503:** Activate the virtual environment, install requirements, run `python train_model.py` from `backend`, and confirm the three files exist in `backend/models/`.
- **TensorFlow cannot install:** Use 64-bit Python 3.10 and a compatible Windows environment. Confirm `python --version` and upgrade pip. Native Windows TensorFlow compatibility varies by release; if the wheel is unavailable, use WSL2 or a supported Python environment.
- **IMDb download error:** Check internet access and retry. The dataset is downloaded and cached by Keras.
- **Frontend cannot connect:** Start FastAPI on port 8000 and Vite on port 5173. Check `VITE_API_URL`, then restart Vite.
- **CORS error:** Keep the frontend on `http://localhost:5173` or `http://127.0.0.1:5173`; add any other trusted development origin to `allow_origins` in `backend/main.py`.
- **Groq explanation unavailable:** Verify `.env` is in `backend/`, the variable is `GROQ_API_KEY`, the key is valid, the selected model is enabled for your account, and the backend was restarted. The classifier works without Groq.
- **PowerShell activation blocked:** Use the process-scoped execution policy command in Step 2.
- **Port already in use:** Stop the other process or choose another port and update the frontend API URL.

## 22. Future enhancements
- Add neutral sentiment and aspect-based sentiment classification.
- Add multilingual support and domain-specific fine-tuning.
- Add user authentication and per-user history.
- Add batch upload and downloadable PDF reports.
- Add model versioning, confusion matrix, ROC-AUC, and drift monitoring.
- Add explainability methods such as LIME/SHAP with careful interpretation.

## 23. Limitations
- Binary IMDb movie-review training data may not generalize to sarcasm, mixed sentiment, short social messages, or other domains.
- A small subset and three epochs are intended for a compact demonstration, not production-grade performance.
- Confidence is the model's sigmoid-derived class probability and is not guaranteed to be calibrated.
- Groq explanations can be unavailable, rate-limited, or occasionally produce imperfect rationale. They are explanatory text, not proof of model reasoning.
- Text preprocessing is English-oriented.
- Training time depends on CPU, RAM, TensorFlow build, and network speed.

## 24. Author
**Name:** Poshanya  
**College:** PVPSIT  
**Department / Year:** CSE 4th year
**GitHub:** https://github.com/Poshanya  
