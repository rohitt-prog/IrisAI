import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import VoiceButton from '../components/VoiceButton';

const SUGGESTIONS = [
  { text: "What are the symptoms of glaucoma?",         icon: "👁️" },
  { text: "How is cataract treated?",                    icon: "💊" },
  { text: "What causes diabetic retinopathy?",           icon: "🩸" },
  { text: "How often should I get an eye exam?",         icon: "📅" },
  { text: "What is keratoconus?",                        icon: "🔬" },
  { text: "Can uveitis be cured?",                       icon: "🏥" },
];

const TypingDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.75rem 1.1rem' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--iris-400)',
        display: 'inline-block',
        animation: `typingBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
        boxShadow: '0 0 8px rgba(0,229,255,0.5)',
      }} />
    ))}
  </div>
);

const MessageBubble = ({ msg }) => {
  const isUser = msg.sender === 'user';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end',
        gap: '0.6rem',
        animation: 'fade-in-up 0.3s ease forwards',
      }}
    >
      {/* AI avatar */}
      {!isUser && (
        <div style={{
          width: 34, height: 34, flexShrink: 0, borderRadius: '50%',
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', boxShadow: 'var(--glow-sm)',
        }}>🤖</div>
      )}

      <div
        className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}
        style={{
          maxWidth: '75%',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.7,
          ...(msg.isError ? {
            borderColor: 'rgba(244,63,94,0.3)',
            background: 'rgba(244,63,94,0.08)',
          } : {}),
          ...(msg.isVoice && isUser ? {
            background: 'linear-gradient(135deg, #0044cc, #6d28d9)',
          } : {}),
        }}
      >
        {msg.isVoice && (
          <span style={{ fontSize: '0.72rem', opacity: 0.7, marginRight: '0.4rem' }}>
            {isUser ? '🎤' : '🔊'}
          </span>
        )}
        {msg.text}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: 34, height: 34, flexShrink: 0, borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', fontWeight: 700, color: '#fff',
          border: '2px solid rgba(59,130,246,0.4)',
        }}>
          {(() => {
            const u = localStorage.getItem('user');
            const name = u ? JSON.parse(u).name : '';
            return name ? name[0].toUpperCase() : '👤';
          })()}
        </div>
      )}
    </div>
  );
};

const Chat = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  const [messages, setMessages] = useState([{
    sender: 'ai',
    text: "👋 Hello! I'm your AI Eye Health Assistant powered by Gemini.\n\nAsk me anything about eye conditions, symptoms, treatments, or general eye health. You can also tap 🎤 to speak in any language!",
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const audioRef = useRef(null);

  const handleVoiceTranscript = useCallback((transcript) => {
    setMessages(prev => [...prev, { sender: 'user', text: transcript, isVoice: true }]);
    setLoading(true);
  }, []);

  const handleVoiceResponse = useCallback(({ text, audio }) => {
    setMessages(prev => [...prev, { sender: 'ai', text, isVoice: true }]);
    setLoading(false);
    setMessageCount(c => c + 1);
    if (audio) {
      try {
        const mp3 = `data:audio/mp3;base64,${audio}`;
        if (audioRef.current) {
          audioRef.current.src = mp3;
          audioRef.current.play().catch(() => {});
        }
      } catch {}
    }
  }, []);

  const handleVoiceError = useCallback((msg) => {
    setLoading(false);
    setMessages(prev => [...prev, { sender: 'ai', text: `⚠️ ${msg}`, isError: true }]);
  }, []);

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
      setMessageCount(c => c + 1);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Sorry, the AI assistant is unavailable right now.';
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
    <div className="animate-fade-in-up page-wrapper" style={{ maxWidth: '860px', margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '50rem', padding: '0.38rem 1.1rem',
          fontSize: '0.8rem', fontWeight: 600, color: '#86efac',
          marginBottom: '1rem',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e', animation: 'pulse-dot 2s infinite' }} />
          AI Assistant · Live · Powered by Gemini
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
          Eye Health <span className="gradient-text">AI Chat</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
          Ask me anything about eye conditions, symptoms, or treatments. Here 24/7.
        </p>
      </div>

      {/* Chat container */}
      <div className="glass-card-elevated" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '620px', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>

        {/* Header bar */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          background: 'rgba(0,119,255,0.04)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', boxShadow: 'var(--glow-sm)',
            flexShrink: 0, position: 'relative',
          }}>
            🤖
            <span style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 12, height: 12, borderRadius: '50%',
              background: '#22c55e', border: '2px solid var(--bg-elevated)',
              boxShadow: '0 0 8px #22c55e',
            }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', fontFamily: 'Space Grotesk, sans-serif', color: '#e0f2fe' }}>
              AI Medical Assistant
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Specialized in eye health · {messageCount} responses today · Not a medical replacement
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
            <span style={{ fontSize: '0.72rem', color: '#86efac', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              Online
            </span>
          </div>
        </div>

        {/* Messages area */}
        <div className="chat-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {messages.map((msg, idx) => (
            <MessageBubble key={idx} msg={msg} />
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', animation: 'fade-in 0.3s ease' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem',
                boxShadow: 'var(--glow-sm)',
              }}>🤖</div>
              <div className="chat-bubble-ai" style={{ padding: 0 }}>
                <TypingDots />
              </div>
            </div>
          )}

          {/* Suggestion chips */}
          {showSuggestions && !loading && (
            <div style={{ marginTop: '0.75rem', paddingLeft: '46px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
                💡 Try asking about:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.text)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      background: 'rgba(0,119,255,0.07)',
                      border: '1px solid rgba(0,119,255,0.18)',
                      color: '#93c5fd',
                      borderRadius: '50rem',
                      padding: '0.4rem 1rem',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => Object.assign(e.currentTarget.style, { background: 'rgba(0,119,255,0.16)', borderColor: 'rgba(0,119,255,0.4)', color: '#bfdbfe', transform: 'translateY(-1px)' })}
                    onMouseLeave={e => Object.assign(e.currentTarget.style, { background: 'rgba(0,119,255,0.07)', borderColor: 'rgba(0,119,255,0.18)', color: '#93c5fd', transform: 'translateY(0)' })}
                  >
                    <span style={{ fontSize: '0.85rem' }}>{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1rem 1.25rem',
          display: 'flex', gap: '0.625rem',
          background: 'rgba(0,0,0,0.3)',
          flexShrink: 0,
          alignItems: 'flex-end',
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              className="input-field"
              placeholder="Ask about eye conditions, treatments, symptoms..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                borderRadius: '0.875rem',
                paddingRight: '3rem',
                background: 'rgba(255,255,255,0.05)',
              }}
            />
            {input && (
              <button
                onClick={() => setInput('')}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-muted)',
                  fontSize: '1rem',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                ✕
              </button>
            )}
          </div>

          <VoiceButton
            onTranscript={handleVoiceTranscript}
            onResponse={handleVoiceResponse}
            onError={handleVoiceError}
            disabled={loading}
          />

          <button
            className="btn-primary"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.875rem',
              flexShrink: 0,
              opacity: loading || !input.trim() ? 0.5 : 1,
              transition: 'all 0.2s',
              fontSize: '0.9rem',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.7s linear infinite', display: 'inline-block' }} />
              </span>
            ) : '↑ Send'}
          </button>
          <audio ref={audioRef} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Disclaimer */}
      <p style={{ textAlign: 'center', fontSize: '0.73rem', color: 'var(--text-dim)', marginTop: '1rem', lineHeight: 1.6 }}>
        ⚠️ This AI assistant is for informational purposes only and does not constitute medical advice.
        Always consult a licensed ophthalmologist for diagnosis and treatment.
      </p>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30%            { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Chat;
