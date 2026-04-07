import { Link } from 'react-router-dom';
import { useTokens } from '../context/TokenContext';
import GoldCoin from '../components/GoldCoin';

const features = [
  {
    icon: '🩺',
    title: '6 Conditions Detected',
    desc: 'Cataract, Glaucoma, Diabetic Retinopathy, Uveitis, Keratoconus & Normal',
    color: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.15)',
  },
  {
    icon: '⚡',
    title: 'Instant AI Analysis',
    desc: 'Deep learning classification with Generative AI explanations in plain language',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.15)',
  },
  {
    icon: '📄',
    title: 'PDF & QR Reports',
    desc: 'Downloadable professional clinical reports with embedded QR codes for records',
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.15)',
  },
];

const stats = [
  { label: 'Accuracy', value: '94.2%', icon: '🎯' },
  { label: 'Conditions', value: '6', icon: '👁️' },
  { label: 'Avg. Speed', value: '<3s', icon: '⚡' },
];

const howItWorks = [
  {
    num: 1,
    icon: '📸',
    title: 'Upload Eye Image',
    desc: 'Drag and drop or select a clear, high-resolution photo of the anterior eye segment.',
  },
  {
    num: 2,
    icon: '🧠',
    title: 'AI Analyzes',
    desc: 'Our deep learning model processes the image and classifies it across 6 eye conditions.',
  },
  {
    num: 3,
    icon: '📊',
    title: 'Result Generated',
    desc: 'View predictions, confidence scores, probability charts, and a plain-language AI explanation.',
  },
  {
    num: 4,
    icon: '📄',
    title: 'Download Report',
    desc: 'Get a professional PDF report with an embedded QR code — ready to share with your doctor.',
  },
];

const Dashboard = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const { tokens } = useTokens();

  const tokenColor = tokens === null ? '#a3d9ff'
    : tokens === 0 ? '#f87171'
    : tokens <= 5 ? '#fbbf24'
    : '#34d399';

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* ── Hero Banner ───────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        borderRadius: '1.75rem',
        overflow: 'hidden',
        padding: '3rem 2.5rem',
        background: 'linear-gradient(135deg, #0f2557 0%, #132d6e 40%, #1e3a8a 70%, #1d4fd8 100%)',
        border: '1px solid var(--border-medium)',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)', fontSize: '7rem', opacity: 0.06, userSelect: 'none' }}>👁️</div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="badge badge-blue" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
            🔬 AI-Powered Eye Screening
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.15 }}>
            Welcome back,{' '}
            <span style={{ color: '#93c5fd' }}>{user?.name || 'Doctor'}</span> 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '1.05rem', marginBottom: '2rem', maxWidth: '540px', fontWeight: 400 }}>
            Analyze anterior eye health images, detect conditions instantly, and generate comprehensive clinical reports with AI.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/upload" className="btn-primary" style={{ background: '#fff', color: '#1d4ed8', fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
              🔬 Start New Screening
            </Link>
            <Link to="/history" className="btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              📋 Patient History
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--iris-400)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div className="section-label" style={{ marginTop: '0.375rem' }}>{stat.label}</div>
          </div>
        ))}

        {/* Token card — links to pricing */}
        <Link
          to="/pricing"
          className="glass-card"
          style={{ padding: '1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden', textDecoration: 'none', display: 'block' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <GoldCoin size={42} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: tokenColor, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
            {tokens !== null ? tokens : '—'}
          </div>
          <div className="section-label" style={{ marginTop: '0.375rem' }}>Scan Tokens</div>
          <div style={{
            marginTop: '0.75rem',
            padding: '0.3rem 0.85rem',
            borderRadius: '50rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: 'rgba(59,130,246,0.15)',
            color: '#93c5fd',
            border: '1px solid rgba(59,130,246,0.3)',
            display: 'inline-block',
          }}>
            Buy More →
          </div>
        </Link>
      </div>

      {/* ── Feature Cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {features.map((f, i) => (
          <div
            key={f.title}
            className={`glass-card stagger-${i + 1} animate-fade-in-up`}
            style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', opacity: 0 }}
          >
            <div style={{
              width: '52px', height: '52px',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem',
              background: `linear-gradient(135deg, ${f.glow.replace('0.15', '0.2')}, ${f.glow})`,
              border: `1px solid ${f.color}30`,
              boxShadow: `0 0 20px ${f.glow}`,
            }}>
              {f.icon}
            </div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>
              {f.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <div className="glass-card-elevated" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-blue" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>⚙️ Process</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>
            How It Works
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.375rem' }}>
            From upload to clinical report in under 30 seconds
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {howItWorks.map((step, i) => (
            <div
              key={step.num}
              className={`glass-card stagger-${i + 1} animate-fade-in-up`}
              style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', opacity: 0 }}
            >
              {/* Step number */}
              <div style={{
                width: '40px', height: '40px', flexShrink: 0,
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 800, color: '#fff',
                boxShadow: 'var(--glow-sm)',
              }}>
                {step.num}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{step.icon}</span>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'Space Grotesk, sans-serif' }}>{step.title}</h4>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/upload" className="btn-primary">
            🔬 Try It Now
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
