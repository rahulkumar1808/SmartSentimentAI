import re
from tensorflow.keras.preprocessing.sequence import pad_sequences

MAX_LEN = 200
MAX_WORDS = 20000

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"<br\s*/?>", " ", text)
    text = re.sub(r"[^a-z0-9\s']", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def encode_text(text: str, word_index: dict, max_len: int = MAX_LEN):
    # Match the Keras IMDb tokenizer convention: reserve 0 for padding and
    # 1 for OOV; retain only the most frequent MAX_WORDS-1 words.
    words = clean_text(text).split()
    sequence = []
    for word in words:
        idx = word_index.get(word)
        sequence.append(idx + 3 if idx is not None and idx < MAX_WORDS - 3 else 2)
    return pad_sequences([sequence], maxlen=max_len, padding="pre", truncating="pre")
