import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const ChatBox = () => {
  const [messages, setMessages] = useState([{
    sender: 'ai',
    text: 'Hello! I\'m your AI Eye Health Assistant. I can answer questions about eye conditions, symptoms, or treatment options. How can I help you today?',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { question: userMsg });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I\'m unable to process your question right now. Please try again later.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '420px' }}>
      {/* Messages */}
      <div
        className="chat-scroll"
        style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', overflowY: 'auto' }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`animate-fade-in`}
            style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '0.5rem' }}
          >
            {msg.sender === 'ai' && (
              <div style={{
                width: '30px', height: '30px', flexShrink: 0,
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem',
                boxShadow: 'var(--glow-sm)',
              }}>
                🤖
              </div>
            )}
            <div className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{
              width: '30px', height: '30px', flexShrink: 0,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem',
            }}>
              🤖
            </div>
            <div className="chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.75rem 1.1rem' }}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '0.875rem',
        display: 'flex',
        gap: '0.625rem',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <input
          type="text"
          className="input-field"
          placeholder="Ask about eye conditions, treatments, symptoms..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          style={{ borderRadius: '50rem' }}
        />
        <button
          className="btn-primary"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{ padding: '0.75rem 1.25rem', borderRadius: '50rem', flexShrink: 0, opacity: loading || !input.trim() ? 0.6 : 1 }}
        >
          Send ↑
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
