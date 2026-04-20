import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const SUGGESTIONS = [
  "What are the symptoms of glaucoma?",
  "How is cataract treated?",
  "What causes diabetic retinopathy?",
  "How often should I get an eye exam?",
  "What is keratoconus?",
  "Can uveitis be cured?",
];

const TypingDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.75rem 1.1rem' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--accent-blue)',
        display: 'inline-block',
        animation: `typingBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
      }} />
    ))}
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState([{
    sender: 'ai',
    text: "👋 Hello! I'm your AI Eye Health Assistant powered by Gemini.\n\nAsk me anything about eye conditions, symptoms, treatments, or general eye health. I'm here to help!",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    setMessages(prev => [...prev, { sender: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { question });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Sorry, the AI assistant is unavailable right now. Please try again later.';
      setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ ${errMsg}`, isError: true }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '820px', margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: '50rem', padding: '0.35rem 1rem',
          fontSize: '0.8rem', fontWeight: 600, color: '#60a5fa',
          marginBottom: '1rem',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
          AI Assistant · Powered by Gemini
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.5rem' }}>
          Eye Health <span className="gradient-text">AI Chat</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          Ask me anything about eye conditions, symptoms, or treatments. I'm here 24/7.
        </p>
      </div>

      {/* Chat Card */}
      <div className="glass-card-elevated" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px' }}>

        {/* Header bar */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(59, 130, 246, 0.05)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', boxShadow: 'var(--glow-sm)', flexShrink: 0,
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Space Grotesk, sans-serif' }}>
              AI Medical Assistant
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Specialized in eye health · Not a replacement for professional advice
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse-glow 2s infinite' }} />
            <span style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 600 }}>Online</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {messages.map((msg, idx) => (
            <div key={idx} className="animate-fade-in" style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end', gap: '0.5rem',
            }}>
              {msg.sender === 'ai' && (
                <div style={{
                  width: 30, height: 30, flexShrink: 0, borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', boxShadow: 'var(--glow-sm)',
                }}>🤖</div>
              )}
              <div
                className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                style={{
                  maxWidth: '75%', whiteSpace: 'pre-wrap', lineHeight: 1.65,
                  ...(msg.isError ? { borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' } : {}),
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <div style={{
                width: 30, height: 30, flexShrink: 0, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
              }}>🤖</div>
              <div className="chat-bubble-ai" style={{ padding: 0 }}>
                <TypingDots />
              </div>
            </div>
          )}

          {/* Suggested questions — only show on first load */}
          {showSuggestions && !loading && (
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem', paddingLeft: '38px' }}>
                Try asking:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingLeft: '38px' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    style={{
                      background: 'rgba(59,130,246,0.08)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      color: '#93c5fd',
                      borderRadius: '50rem',
                      padding: '0.35rem 0.9rem',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => Object.assign(e.currentTarget.style, { background: 'rgba(59,130,246,0.18)', borderColor: 'rgba(59,130,246,0.4)' })}
                    onMouseLeave={e => Object.assign(e.currentTarget.style, { background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '0.875rem 1rem',
          display: 'flex', gap: '0.625rem',
          background: 'rgba(255,255,255,0.02)',
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            type="text"
            className="input-field"
            placeholder="Ask about eye conditions, treatments, symptoms..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{ borderRadius: '50rem', flex: 1 }}
          />
          <button
            className="btn-primary"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '50rem',
              flexShrink: 0,
              opacity: loading || !input.trim() ? 0.6 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? '...' : 'Send ↑'}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{
        textAlign: 'center', fontSize: '0.73rem',
        color: 'var(--text-muted)', marginTop: '1rem', lineHeight: 1.6,
      }}>
        ⚠️ This AI assistant is for informational purposes only and does not constitute medical advice.
        Always consult a licensed ophthalmologist for diagnosis and treatment.
      </p>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Chat;
