import os
from dotenv import load_dotenv

load_dotenv()

def explain_sentiment(text: str, sentiment: str, confidence: float):
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        return {
            "explanation": "Generative AI explanation is unavailable because GROQ_API_KEY is not configured. The sentiment shown above is the LSTM model prediction.",
            "source": "unavailable"
        }
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        model_name = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        completion = client.chat.completions.create(
            model=model_name,
            temperature=0.3,
            max_tokens=220,
            messages=[
                {"role": "system", "content":
                 "You explain sentiment predictions, you do not classify text. The sentiment label and confidence were produced by a separate LSTM. In simple English, explain which words or phrases support that given label. Quote short phrases from the input. If the label is Negative, give exactly one constructive suggestion to improve the feedback. Be concise and do not contradict the supplied label."},
                {"role": "user", "content":
                 f"Input review: {text[:3000]}\nLSTM prediction: {sentiment}\nLSTM confidence: {confidence}%\nExplain this prediction."}
            ])
        answer = completion.choices[0].message.content.strip()
        return {"explanation": answer, "source": "groq"}
    except Exception as exc:
        return {
            "explanation": f"Generative AI could not respond ({type(exc).__name__}). The LSTM prediction remains available. Check the API key, model name, network connection, and Groq account limits.",
            "source": "unavailable"
        }
