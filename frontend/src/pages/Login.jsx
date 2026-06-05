import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';
import Logo from '../components/Logo';
import { useTokens } from '../context/TokenContext';
import LoginIntroAnimation from '../components/LoginIntroAnimation';

const features = [
  { icon: '🧠', text: 'AI-powered eye disease detection' },
  { icon: '📄', text: 'Professional clinical PDF reports' },
  { icon: '💬', text: 'Multilingual AI health assistant' },
  { icon: '🔒', text: 'HIPAA-aware, encrypted storage' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const navigate = useNavigate();
  const { fetchTokens } = useTokens();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      await fetchTokens();
      // Show the cinematic intro before navigating
      setShowIntro(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Called by LoginIntroAnimation when its sequence finishes
  const handleIntroDone = () => {
    navigate('/dashboard');
  };

  return (
    <>
      {showIntro && <LoginIntroAnimation onComplete={handleIntroDone} />}
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,100,255,0.12) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Logo + heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Logo width={160} height={60} style={{ margin: '0 auto 1.25rem', display: 'block' }} />
          <h1 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to your IRISAI account
          </p>
        </div>

        {/* Card */}
        <div className="glass-card-elevated" style={{ padding: '2.25rem' }}>

          {error && (
            <div className="alert-error" style={{ marginBottom: '1.5rem', animation: 'fade-in-up 0.3s ease' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Email */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--text-muted)', marginBottom: '0.5rem',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Email Address
              </label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: '0.78rem', fontWeight: 700,
                color: 'var(--text-muted)', marginBottom: '0.5rem',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: '1rem', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', fontSize: '1rem',
                  pointerEvents: 'none',
                }}>🔑</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: '1rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: 'var(--text-muted)',
                    fontSize: '1rem', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%', padding: '1rem',
                borderRadius: '0.875rem', fontSize: '1rem',
                marginTop: '0.25rem',
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', justifyContent: 'center' }}>
                  <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.75s linear infinite', display: 'inline-block' }} />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--iris-400)', fontWeight: 700, textDecoration: 'none' }}>
                Create one →
              </Link>
            </p>
          </div>
        </div>

        {/* Features row */}
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {features.map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.875rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '1rem' }}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
