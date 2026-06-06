import { Link } from 'react-router-dom';
import { useTokens } from '../context/TokenContext';
import GoldCoin from '../components/GoldCoin';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: '🩺',
    title: '5 Conditions Detected',
    desc: 'Cataract, Glaucoma, Diabetic Retinopathy, Keratoconus & Normal',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.15)',
    gradient: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(96,165,250,0.05))',
  },
  {
    icon: '⚡',
    title: 'Instant AI Analysis',
    desc: 'Deep learning classification with Generative AI explanations in plain language',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.15)',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
  },
  {
    icon: '📄',
    title: 'PDF & QR Reports',
    desc: 'Downloadable professional clinical reports with embedded QR codes',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    gradient: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))',
  },
  {
    icon: '🎤',
    title: 'Voice-Powered Chat',
    desc: 'Talk to your AI assistant in any language — speech to answer in seconds',
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.15)',
    gradient: 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(192,132,252,0.05))',
  },
  {
    icon: '🔒',
    title: 'Secure & HIPAA-aware',
    desc: 'JWT-authenticated, encrypted data storage with medical-grade privacy',
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.15)',
    gradient: 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(251,146,60,0.05))',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Track screening history, condition trends and probabilities over time',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.15)',
    gradient: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(34,211,238,0.05))',
  },
];

const stats = [
  { label: 'Model Accuracy',  value: '94.2%', icon: '🎯', color: '#00e5ff' },
  { label: 'Conditions',      value: '5',      icon: '👁️',  color: '#a78bfa' },
  { label: 'Avg. Analysis',   value: '<3s',    icon: '⚡',  color: '#fbbf24' },
];

const howItWorks = [
  { num: 1, icon: '📸', title: 'Upload Eye Image', desc: 'Select a clear, high-resolution photo of the anterior eye segment.' },
  { num: 2, icon: '🧠', title: 'AI Analyzes',      desc: 'EfficientNet-B3 processes the image and classifies across 5 conditions.' },
  { num: 3, icon: '📊', title: 'Results Generated', desc: 'View predictions, confidence scores, probability charts and AI explanations.' },
  { num: 4, icon: '📄', title: 'Download Report',   desc: 'Get a professional PDF with embedded QR code — ready to share with your doctor.' },
];

/* ── Animated counter hook ── */
const useCountUp = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ''));
    if (isNaN(numeric)) { setCount(target); return; }
    let start = 0;
    const step = numeric / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) { setCount(target); clearInterval(timer); }
      else setCount((target.includes('%') ? start.toFixed(1) + '%' : Math.floor(start).toString()));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const StatCard = ({ stat, delay }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  const displayed = visible ? stat.value : '—';

  return (
    <div
      className="glass-card card-shimmer"
      style={{
        padding: '1.75rem',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}>
        {stat.icon}
      </div>
      <div style={{
        fontSize: '2.25rem',
        fontWeight: 900,
        fontFamily: 'Space Grotesk, sans-serif',
        color: stat.color,
        lineHeight: 1,
        textShadow: `0 0 20px ${stat.color}60`,
        marginBottom: '0.5rem',
        animation: visible ? 'count-up 0.4s ease' : 'none',
      }}>
        {displayed}
      </div>
      <div className="section-label" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
    </div>
  );
};

const Dashboard = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const { tokens } = useTokens();

  const tokenColor = tokens === null ? '#7dd3fc'
    : tokens === 0 ? '#fb7185'
    : tokens <= 5  ? '#fcd34d'
    : '#6ee7b7';

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="animate-fade-in-up page-wrapper" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* ── Hero Banner ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        borderRadius: '2rem',
        overflow: 'hidden',
        padding: '3.5rem 3rem',
        background: 'linear-gradient(135deg, #001166 0%, #0033aa 35%, #0055cc 65%, #0088ff 100%)',
        border: '1px solid rgba(0,170,255,0.25)',
        boxShadow: '0 20px 80px rgba(0,80,255,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,255,0.25) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(80,0,255,0.2) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '8%', transform: 'translateY(-50%)', fontSize: '9rem', opacity: 0.06, userSelect: 'none', animation: 'float 5s ease-in-out infinite' }}>👁️</div>

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50rem',
            padding: '0.35rem 1rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#bfdbfe',
            marginBottom: '1.5rem',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
            🔬 AI-Powered Eye Screening Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '0.875rem',
            fontFamily: 'Space Grotesk, sans-serif',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
          }}>
            {timeOfDay()},{' '}
            <span style={{
              background: 'linear-gradient(135deg, #bfdbfe, #93c5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {user?.name || 'Doctor'}
            </span>{' '}👋
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.68)',
            fontSize: '1.05rem',
            marginBottom: '2.25rem',
            maxWidth: '520px',
            lineHeight: 1.65,
            fontWeight: 400,
          }}>
            Analyze anterior eye health images, detect 5 conditions instantly, and generate comprehensive clinical reports powered by AI.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/upload" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 2rem',
              background: '#fff',
              color: '#0033aa',
              fontWeight: 800,
              fontSize: '0.95rem',
              borderRadius: '50rem',
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              transition: 'all 0.3s',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { transform: 'translateY(-2px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { transform: 'translateY(0)', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' })}
            >
              🔬 Start New Screening
            </Link>
            <Link to="/history" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem 2rem',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.95rem',
              borderRadius: '50rem',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.22)',
              transition: 'all 0.3s',
              backdropFilter: 'blur(8px)',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.18)', transform: 'translateY(-2px)' })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.1)', transform: 'translateY(0)' })}
            >
              📋 Patient History
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} delay={i * 120} />
        ))}

        {/* Token card */}
        <Link
          to="/pricing"
          className="glass-card card-shimmer"
          style={{ padding: '1.75rem', textAlign: 'center', textDecoration: 'none', display: 'block', transition: 'all 0.35s' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem', animation: 'float 3.5s ease-in-out infinite' }}>
            <GoldCoin size={38} />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: tokenColor, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, textShadow: `0 0 20px ${tokenColor}60`, marginBottom: '0.5rem' }}>
            {tokens !== null ? tokens : '—'}
          </div>
          <div className="section-label" style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Scan Tokens</div>
          <div style={{
            padding: '0.3rem 0.85rem', borderRadius: '50rem',
            fontSize: '0.72rem', fontWeight: 700,
            background: 'rgba(0,119,255,0.15)', color: '#93c5fd',
            border: '1px solid rgba(0,119,255,0.3)', display: 'inline-block',
          }}>
            Buy More →
          </div>
        </Link>
      </div>

      {/* ── Feature Cards ────────────────────────────────────────────────── */}
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge badge-blue">✨ Capabilities</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
            Everything You Need
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.1rem' }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card card-shimmer stagger-${i + 1} animate-fade-in-up`}
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
                opacity: 0,
                cursor: 'default',
              }}
            >
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
                background: f.gradient,
                border: `1px solid ${f.color}30`,
                boxShadow: `0 0 24px ${f.glow}`,
                transition: 'all 0.3s',
              }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.4rem' }}>
                  {f.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.855rem', lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <div className="glass-card-elevated" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-violet" style={{ marginBottom: '0.875rem', display: 'inline-flex' }}>⚙️ Process</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
            How It <span className="gradient-text">Works</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            From upload to clinical report in under 30 seconds
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
          {howItWorks.map((step, i) => (
            <div
              key={step.num}
              className={`glass-card stagger-${i + 1} animate-fade-in-up`}
              style={{
                padding: '1.5rem',
                display: 'flex',
                gap: '1.1rem',
                alignItems: 'flex-start',
                opacity: 0,
              }}
            >
              <div style={{
                width: '44px', height: '44px', flexShrink: 0,
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 900, color: '#fff',
                boxShadow: 'var(--glow-sm)',
              }}>
                {step.num}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{step.icon}</span>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Space Grotesk, sans-serif' }}>{step.title}</h4>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.855rem', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link to="/upload" className="btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem' }}>
            🔬 Try It Now — It's Free
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
