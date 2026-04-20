import os
import logging
import hashlib
from functools import lru_cache

logger = logging.getLogger(__name__)

# Use the new google-genai SDK (replaces deprecated google-generativeai)
try:
    from google import genai
    from google.genai import types
    USE_NEW_SDK = True
except ImportError:
    # Fallback to old SDK if new one not installed
    import google.generativeai as genai_old
    USE_NEW_SDK = False


def _get_client():
    """Return a configured Gemini client or model."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        return None
    if USE_NEW_SDK:
        return genai.Client(api_key=api_key)
    else:
        genai_old.configure(api_key=api_key)
        return genai_old.GenerativeModel('gemini-1.5-pro-latest')


def _generate(client, prompt: str) -> str:
    """Call Gemini with either SDK version."""
    if USE_NEW_SDK:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text
    else:
        response = client.generate_content(prompt)
        return response.text


# ── LRU cache for Gemini responses (reduces API costs) ──────────────────────
@lru_cache(maxsize=20)
def _cached_explain(prediction: str, prompt_hash: str) -> str:
    """Internal cached explanation generator. Caches by prediction + prompt hash."""
    client = _get_client()
    if client is None:
        return None

    prompt = (
        f"You are a compassionate medical assistant helping a patient understand their eye scan result. "
        f"The AI system predicted '{prediction}' for their eye scan. "
        f"In 3–4 short paragraphs: (1) explain what {prediction} is in simple terms, "
        f"(2) describe common symptoms a person might notice, "
        f"(3) explain what they should do next (consult an ophthalmologist). "
        f"Use simple, non-technical, friendly language. "
        f"End with a mandatory disclaimer: 'This is only an AI preliminary screening and not a medical diagnosis. "
        f"Please consult a licensed ophthalmologist.'"
    )

    try:
        return _generate(client, prompt)
    except Exception as e:
        logger.error(f"LLM explain_disease error: {e}")
        return None


def explain_disease(prediction: str) -> str:
    """
    Use Gemini to generate a plain-language explanation for the predicted eye condition.
    Responses are cached to reduce API costs.
    Falls back to a static message if no API key is configured.
    """
    if prediction == "Normal":
        return (
            "Your eye appears healthy based on our preliminary AI analysis. "
            "No significant abnormality was detected. Maintain regular eye check-ups with your ophthalmologist. "
            "\n\n⚠️ Disclaimer: This AI system is for preliminary screening only and is NOT a medical diagnosis."
        )

    # Generate cache key from prediction
    prompt_hash = hashlib.md5(prediction.encode()).hexdigest()

    result = _cached_explain(prediction, prompt_hash)

    if result is None:
        return (
            f"⚠️ AI explanation unavailable (no API key set). "
            f"Preliminary screening suggests: {prediction}. "
            f"Please consult an ophthalmologist for a proper medical diagnosis. "
            f"\n\n⚠️ Disclaimer: This system is for preliminary screening only."
        )

    return result


def chat_assistant(question: str) -> str:
    """
    Answer a user's eye-health question using Gemini.
    Falls back gracefully if no API key is set.
    """
    client = _get_client()
    if client is None:
        return (
            "The AI chat assistant requires a Gemini API key to function. "
            "Please add your GEMINI_API_KEY to the backend/.env file and restart the server."
        )

    prompt = (
        f"You are a friendly, non-technical AI assistant specializing in eye health. "
        f"A user asks: '{question}'. "
        f"Give a clear, simple, helpful answer in 2–3 short paragraphs. "
        f"Always end with: 'Remember: for personal medical concerns, please consult a licensed ophthalmologist.' "
        f"Never diagnose. Keep it simple and reassuring."
    )

    try:
        return _generate(client, prompt)
    except Exception as e:
        logger.error(f"LLM chat_assistant error: {e}")
        return "I'm unable to answer right now. Please try again later, or consult a licensed ophthalmologist for medical advice."
