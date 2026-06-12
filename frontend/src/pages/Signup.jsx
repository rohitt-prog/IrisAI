import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import Logo from '../components/Logo';

const perks = [
  { icon: '🎁', title: '10 Free Scans',    desc: 'No credit card required' },
  { icon: '⚡', title: 'Instant Results',  desc: 'Results in under 3 seconds' },
  { icon: '📄', title: 'PDF Reports',      desc: 'Download clinical reports' },
  { icon: '🤖', title: 'AI Assistant',     desc: '24/7 eye health guidance' },
];

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: 'Weak', color: '#f43f5e', width: '30%' };
    if (password.length < 8) return { label: 'Fair', color: '#f59e0b', width: '55%' };
    if (password.length < 12) return { label: 'Good', color: '#22d3ee', width: '75%' };
    return { label: 'Strong', color: '#10b981', width: '100%' };
  };
  const strength = passwordStrength();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    // Validate first (before showing the loading spinner)
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!/\d/.test(password)) { setError('Password must contain at least one number.'); return; }
    if (!/[a-zA-Z]/.test(password)) { setError('Password must contain at least one letter.'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/signup`, { name: name.trim(), email, password });
      navigate('/login', { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.toLowerCase().includes('already exists') || err.response?.status === 400) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(msg || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Logo width={160} height={60} style={{ margin: '0 auto 1.25rem', display: 'block' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Join IRISAI — get{' '}
            <span style={{ color: '#6ee7b7', fontWeight: 700 }}>10 free scan tokens</span> instantly
          </p>
        </div>

        {/* Perks row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.625rem', marginBottom: '1.5rem' }}>
          {perks.map(p => (
            <div key={p.title} style={{
              padding: '0.875rem 0.5rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '1rem',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.4rem' }}>{p.icon}</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{p.title}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{p.desc}</div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card-elevated" style={{ padding: '2.25rem' }}>

          {/* Free tokens callout */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '1rem 1.25rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
            border: '1px solid rgba(16,185,129,0.25)',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '0.75rem',
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
            }}>🎁</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#6ee7b7', marginBottom: '0.15rem' }}>10 Free Scan Tokens — on us!</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No credit card required. Start scanning right away.</div>
            </div>
          </div>

          {error && (
            <div className="alert-error" style={{ marginBottom: '1.25rem' }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Full name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Full Name
              </label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input type="text" className="input-field" placeholder="Dr. Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Email Address
              </label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem', pointerEvents: 'none' }}>🔑</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password strength bar */}
              {strength && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '50rem', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: strength.width,
                      background: strength.color,
                      borderRadius: '50rem',
                      transition: 'all 0.35s ease',
                      boxShadow: `0 0 8px ${strength.color}80`,
                    }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: strength.color, marginTop: '0.3rem', fontWeight: 600, textAlign: 'right' }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '1rem', borderRadius: '0.875rem', fontSize: '1rem', marginTop: '0.25rem', opacity: loading ? 0.8 : 1 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', justifyContent: 'center' }}>
                  <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.75s linear infinite', display: 'inline-block' }} />
                  Creating account...
                </span>
              ) : 'Create Account →'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--iris-400)', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.73rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          By creating an account, you agree to our Terms of Service. This tool is for preliminary screening only — not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
};

export default Signup;
