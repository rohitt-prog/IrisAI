from flask import Blueprint, request, jsonify
from utils.llm_explainer import chat_assistant

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'question' not in data:
        return jsonify({"message": "No question provided"}), 400
        
    question = data['question']
    answer = chat_assistant(question)
    
    return jsonify({"answer": answer}), 200
