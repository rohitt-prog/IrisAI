from flask import Blueprint, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from utils.llm_explainer import chat_assistant

chat_bp = Blueprint('chat', __name__)

# Separate limiter for chat — Gemini API calls are expensive
_chat_limiter = Limiter(key_func=get_remote_address)

@chat_bp.route('/chat', methods=['POST'])
@_chat_limiter.limit("20 per hour")
def chat():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"message": "No question provided"}), 400

    question = data['question']
    if not question or not question.strip():
        return jsonify({"message": "Question cannot be empty"}), 400

    # Limit question length to avoid very long Gemini prompts
    question = question.strip()[:1000]
    answer = chat_assistant(question)
    
    return jsonify({"answer": answer}), 200
