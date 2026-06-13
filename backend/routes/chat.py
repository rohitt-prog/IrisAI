"""
routes/chat.py
──────────────
POST /api/chat
  Accepts a JSON body with a 'question' field.
  Returns an AI-generated answer from Gemini.
"""

import logging
from flask import Blueprint, request, jsonify
from utils.llm_explainer import chat_assistant

logger = logging.getLogger(__name__)

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/chat', methods=['POST'])
def chat():
    """Answer eye-health questions via Gemini AI.

    Rate limiting is handled by the global Flask-Limiter configured in app.py
    (200 req/day, 50 req/hour per IP). No additional per-route limiter is needed
    to avoid the standalone-Limiter bug in Flask-Limiter 3.x.
    """
    data = request.get_json(silent=True)
    if not data or 'question' not in data:
        return jsonify({"message": "No question provided"}), 400

    question = data['question']
    if not question or not question.strip():
        return jsonify({"message": "Question cannot be empty"}), 400

    # Trim to avoid very long Gemini prompts
    question = question.strip()[:1000]

    logger.info(f"Chat request: '{question[:80]}...' " if len(question) > 80 else f"Chat request: '{question}'")
    answer = chat_assistant(question)

    return jsonify({"answer": answer}), 200
