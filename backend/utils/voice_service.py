"""
voice_service.py
────────────────
Handles the full voice pipeline:
  1. Speech-to-Text  (Google Cloud Speech-to-Text)
  2. AI response     (Gemini — same language as user)
  3. Text-to-Speech  (Google Cloud Text-to-Speech)

All three steps are isolated so they can be tested/replaced independently.
"""

import os
import base64
import logging
import tempfile

logger = logging.getLogger(__name__)

# ── Google Cloud Speech-to-Text ─────────────────────────────────────────────
def transcribe_audio(audio_bytes: bytes, mime_type: str = "audio/webm") -> tuple[str, str]:
    """
    Convert audio bytes → (transcript_text, detected_language_code).
    Returns ("", "en-US") on failure so callers can degrade gracefully.

    Supported mime types: audio/webm, audio/ogg, audio/wav, audio/mp4
    """
    try:
        from google.cloud import speech

        client = speech.SpeechClient()

        # Map browser MIME types to Google encoding enums
        encoding_map = {
            "audio/webm":  speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            "audio/ogg":   speech.RecognitionConfig.AudioEncoding.OGG_OPUS,
            "audio/wav":   speech.RecognitionConfig.AudioEncoding.LINEAR16,
            "audio/mp4":   speech.RecognitionConfig.AudioEncoding.MP3,
            "audio/mpeg":  speech.RecognitionConfig.AudioEncoding.MP3,
        }
        encoding = encoding_map.get(mime_type, speech.RecognitionConfig.AudioEncoding.WEBM_OPUS)

        audio = speech.RecognitionAudio(content=audio_bytes)
        config = speech.RecognitionConfig(
            encoding=encoding,
            # sample_rate_hertz is auto-detected for WEBM/OGG
            language_code="en-US",
            # Enable multiple language alternatives for auto-detect
            alternative_language_codes=[
                "hi-IN",   # Hindi
                "es-ES",   # Spanish
                "fr-FR",   # French
                "de-DE",   # German
                "ar-SA",   # Arabic
                "zh-CN",   # Chinese (Simplified)
                "pt-BR",   # Portuguese
                "ja-JP",   # Japanese
                "ko-KR",   # Korean
                "ru-RU",   # Russian
            ],
            enable_automatic_punctuation=True,
        )

        response = client.recognize(config=config, audio=audio)

        if not response.results:
            logger.warning("Speech-to-Text returned no results")
            return "", "en-US"

        best_result = response.results[0].alternatives[0]
        transcript = best_result.transcript
        # detected language code is in result.language_code (when alt languages used)
        lang_code = response.results[0].language_code or "en-US"
        logger.info(f"STT: '{transcript[:80]}…' lang={lang_code}")
        return transcript, lang_code

    except ImportError:
        logger.error("google-cloud-speech not installed. Run: pip install google-cloud-speech")
        raise RuntimeError("google-cloud-speech package missing")
    except Exception as e:
        logger.error(f"STT error: {e}")
        raise


# ── Gemini — multilingual response ─────────────────────────────────────────
def generate_ai_response(question: str, detected_lang: str = "en-US") -> str:
    """
    Ask Gemini to answer `question` in the same language as the user spoke.
    Reuses the existing _get_client / _generate helpers from llm_explainer.
    """
    try:
        from utils.llm_explainer import _get_client, _generate

        client = _get_client()
        if client is None:
            return (
                "The AI assistant requires a Gemini API key. "
                "Please add GEMINI_API_KEY to backend/.env and restart."
            )

        prompt = (
            f"You are an AI assistant specializing in eye health. "
            f"Always respond in the SAME language as the user's question. "
            f"If the user used mixed language (e.g. Hinglish), respond naturally in the same mixed style. "
            f"Detected language: {detected_lang}. "
            f"User question: '{question}'. "
            f"Give a clear, helpful answer in 2–3 short paragraphs. "
            f"Always end with: 'Remember: for personal medical concerns, please consult a licensed ophthalmologist.' "
            f"Never diagnose. Keep it simple and reassuring."
        )

        response_text = _generate(client, prompt)
        logger.info(f"Gemini answered ({len(response_text)} chars)")
        return response_text

    except Exception as e:
        logger.error(f"Gemini voice response error: {e}")
        return "I'm unable to answer right now. Please try again later."


# ── Google Cloud Text-to-Speech ─────────────────────────────────────────────
# BCP-47 language code → Google TTS voice name mapping
_TTS_VOICE_MAP = {
    "en":    ("en-US", "en-US-Neural2-F"),
    "hi":    ("hi-IN", "hi-IN-Neural2-A"),
    "es":    ("es-ES", "es-ES-Neural2-A"),
    "fr":    ("fr-FR", "fr-FR-Neural2-A"),
    "de":    ("de-DE", "de-DE-Neural2-F"),
    "ar":    ("ar-XA", "ar-XA-Wavenet-A"),
    "zh":    ("cmn-CN", "cmn-CN-Wavenet-A"),
    "pt":    ("pt-BR", "pt-BR-Neural2-A"),
    "ja":    ("ja-JP", "ja-JP-Neural2-B"),
    "ko":    ("ko-KR", "ko-KR-Neural2-A"),
    "ru":    ("ru-RU", "ru-RU-Wavenet-A"),
}

def _resolve_tts_voice(lang_code: str):
    """Map a BCP-47 code like 'hi-IN' → (language_code, voice_name)."""
    prefix = lang_code.split("-")[0].lower()
    return _TTS_VOICE_MAP.get(prefix, ("en-US", "en-US-Neural2-F"))


def synthesize_speech(text: str, lang_code: str = "en-US") -> bytes:
    """
    Convert `text` → MP3 audio bytes using Google Text-to-Speech.
    Returns raw MP3 bytes on success.
    """
    try:
        from google.cloud import texttospeech

        tts_client = texttospeech.TextToSpeechClient()

        language_code, voice_name = _resolve_tts_voice(lang_code)

        synthesis_input = texttospeech.SynthesisInput(text=text)
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=voice_name,
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,
            pitch=0.0,
        )

        response = tts_client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config,
        )

        logger.info(f"TTS: generated {len(response.audio_content)} bytes for lang={lang_code}")
        return response.audio_content

    except ImportError:
        logger.error("google-cloud-texttospeech not installed. Run: pip install google-cloud-texttospeech")
        raise RuntimeError("google-cloud-texttospeech package missing")
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise


# ── Full pipeline convenience function ──────────────────────────────────────
def voice_pipeline(audio_bytes: bytes, mime_type: str = "audio/webm") -> dict:
    """
    Run the complete voice pipeline:
      audio_bytes → STT → Gemini → TTS → { text, audio_b64 }

    Returns:
        {
            "transcript": str,     # what the user said
            "text": str,           # AI response text
            "audio": str,          # base64-encoded MP3
            "language": str,       # detected BCP-47 language code
        }
    Raises on hard failures (let the route handle HTTP errors).
    """
    # Step 1: Speech → Text
    transcript, lang_code = transcribe_audio(audio_bytes, mime_type)
    if not transcript:
        raise ValueError("Could not transcribe audio. Please speak clearly and try again.")

    # Step 2: Text → Gemini AI
    ai_text = generate_ai_response(transcript, lang_code)

    # Step 3: AI text → Speech
    audio_bytes_out = synthesize_speech(ai_text, lang_code)
    audio_b64 = base64.b64encode(audio_bytes_out).decode("utf-8")

    return {
        "transcript": transcript,
        "text": ai_text,
        "audio": audio_b64,
        "language": lang_code,
    }
