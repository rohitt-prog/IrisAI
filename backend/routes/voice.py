"""
routes/voice.py
───────────────
POST /api/voice
  Accepts:  multipart/form-data  with field 'audio' (audio file)
  Returns:
    {
        "transcript": "what the user said",
        "text":       "AI response",
        "audio":      "<base64-encoded MP3>",
        "language":   "detected BCP-47 code, e.g. hi-IN"
    }

No existing routes are modified.
"""

import logging
from flask import Blueprint, request, jsonify
from utils.voice_service import voice_pipeline

logger = logging.getLogger(__name__)

voice_bp = Blueprint("voice", __name__)


@voice_bp.route("/voice", methods=["POST"])
def voice():
    """
    Full voice pipeline endpoint.

    Accepts a multipart/form-data request with:
      - audio: binary audio file (webm, ogg, wav, mp4)
    """
    # ── Validate request ────────────────────────────────────────────────────
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided. Send a file with field name 'audio'."}), 400

    audio_file = request.files["audio"]
    if audio_file.filename == "":
        return jsonify({"error": "Empty audio file received."}), 400

    mime_type = audio_file.content_type or "audio/webm"

    # ── Read audio bytes ────────────────────────────────────────────────────
    try:
        audio_bytes = audio_file.read()
        if len(audio_bytes) == 0:
            return jsonify({"error": "Audio file is empty."}), 400
        logger.info(f"Received audio: {len(audio_bytes)} bytes, mime={mime_type}")
    except Exception as e:
        logger.error(f"Failed to read audio file: {e}")
        return jsonify({"error": "Could not read audio file."}), 400

    # ── Run voice pipeline ──────────────────────────────────────────────────
    try:
        result = voice_pipeline(audio_bytes, mime_type)
        return jsonify(result), 200

    except ValueError as e:
        # User-facing errors (e.g., "could not transcribe")
        logger.warning(f"Voice pipeline user error: {e}")
        return jsonify({"error": str(e)}), 422

    except RuntimeError as e:
        # Missing dependency errors
        logger.error(f"Voice pipeline dependency error: {e}")
        return jsonify({
            "error": f"Server configuration error: {e}. "
                     "Please ensure google-cloud-speech and google-cloud-texttospeech are installed."
        }), 503

    except Exception as e:
        logger.error(f"Voice pipeline unexpected error: {e}", exc_info=True)
        return jsonify({"error": "An unexpected error occurred. Please try again."}), 500
