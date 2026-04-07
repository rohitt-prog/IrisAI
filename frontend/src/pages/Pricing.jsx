import { useNavigate } from 'react-router-dom';
import GoldCoin from '../components/GoldCoin';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    tokens: 10,
    price: 10,
    pricePerScan: '$1.00',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.18)',
    border: 'rgba(96,165,250,0.25)',
    icon: '🔬',
    badge: null,
    features: [
      '10 AI Eye Scans',
      'Full diagnostic report',
      'AI-powered explanation',
      'PDF download with QR',
      'Chat with AI assistant',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    tokens: 30,
    price: 20,
    pricePerScan: '$0.67',
    color: '#00e5ff',
    glow: 'rgba(0,229,255,0.18)',
    border: 'rgba(0,229,255,0.35)',
    icon: '🧠',
    badge: 'Most Popular',
    features: [
      '30 AI Eye Scans',
      'Full diagnostic report',
      'AI-powered explanation',
      'PDF download with QR',
      'Chat with AI assistant',
      'Priority processing',
    ],
  },
  {
    id: 'clinic',
    name: 'Clinic',
    tokens: 50,
    price: 30,
    pricePerScan: '$0.60',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.18)',
    border: 'rgba(167,139,250,0.25)',
    icon: '🏥',
    badge: 'Best Value',
    features: [
      '50 AI Eye Scans',
      'Full diagnostic report',
      'AI-powered explanation',
      'PDF download with QR',
      'Chat with AI assistant',
      'Priority processing',
      'Bulk scan management',
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleSelectPlan = (plan) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    // Payment integration pending — navigate to a "coming soon" state
    navigate('/payment-pending', { state: { plan } });
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '0.4rem 1.1rem', borderRadius: '50rem',
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.2px',
          textTransform: 'uppercase',
          border: '1px solid rgba(0,229,255,0.3)',
          color: '#80ebff', backgroundColor: 'rgba(0,229,255,0.05)',
          marginBottom: '1.5rem',
        }}>
          <span style={{ color: '#00e5ff', fontSize: '0.55rem' }}>●</span> TOKEN PLANS
        </span>

        <h1 style={{
          fontSize: '3rem', fontWeight: 800,
          fontFamily: 'Space Grotesk, sans-serif',
          lineHeight: 1.15, marginBottom: '1rem',
        }}>
          Choose Your <span className="gradient-text">Scan Plan</span>
        </h1>
        <p style={{ color: '#a3d9ff', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
          Each token powers one complete AI eye scan — from image analysis to professional report generation.
        </p>
      </div>

      {/* ── Plans Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'stretch' }}>
        {plans.map((plan, i) => {
          const isPopular = plan.id === 'professional';
          return (
            <div
              key={plan.id}
              className={`stagger-${i + 1} animate-fade-in-up`}
              style={{
                position: 'relative',
                background: isPopular
                  ? `linear-gradient(160deg, rgba(0,34,60,0.95) 0%, rgba(0,15,40,0.98) 100%)`
                  : 'rgba(0,10,25,0.85)',
                border: `1px solid ${plan.border}`,
                borderRadius: '1.5rem',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                opacity: 0,
                boxShadow: isPopular ? `0 0 60px ${plan.glow}, 0 20px 40px rgba(0,0,0,0.4)` : '0 8px 30px rgba(0,0,0,0.3)',
                transform: isPopular ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
              }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, {
                boxShadow: `0 0 80px ${plan.glow}, 0 24px 48px rgba(0,0,0,0.5)`,
                transform: 'translateY(-4px)',
              })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, {
                boxShadow: isPopular ? `0 0 60px ${plan.glow}, 0 20px 40px rgba(0,0,0,0.4)` : '0 8px 30px rgba(0,0,0,0.3)',
                transform: isPopular ? 'scale(1.03)' : 'scale(1)',
              })}
            >
              {/* Subtle glow bg */}
              <div style={{
                position: 'absolute', top: '-40px', right: '-40px',
                width: '160px', height: '160px', borderRadius: '50%',
                background: `radial-gradient(circle, ${plan.glow} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Badge */}
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '50rem',
                  fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.05em',
                  background: plan.id === 'professional'
                    ? 'linear-gradient(135deg, #0077ff, #00e5ff)'
                    : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  color: '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Icon + Plan name */}
              <div>
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${plan.glow.replace('0.18', '0.25')}, ${plan.glow})`,
                  border: `1px solid ${plan.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  boxShadow: `0 0 20px ${plan.glow}`,
                }}>
                  {plan.icon}
                </div>
                <h3 style={{
                  fontSize: '1.1rem', fontWeight: 800, color: plan.color,
                  fontFamily: 'Space Grotesk, sans-serif',
                  marginBottom: '0.25rem',
                }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {plan.pricePerScan} per scan
                </p>
              </div>

              {/* Price */}
              <div style={{ borderBottom: `1px solid ${plan.border}`, paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#a3d9ff', fontWeight: 600 }}>$</span>
                  <span style={{
                    fontSize: '3.5rem', fontWeight: 900,
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: '#ffffff', lineHeight: 1,
                  }}>
                    {plan.price}
                  </span>
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '0.6rem',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '50rem',
                  background: `${plan.color}18`,
                  border: `1px solid ${plan.color}40`,
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: plan.color,
                }}>
                  <GoldCoin size={16} /> {plan.tokens} Scan Tokens
                </div>
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: '#c0d8f0' }}>
                    <span style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      background: `${plan.color}20`, border: `1px solid ${plan.color}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', color: plan.color, fontWeight: 800,
                    }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan)}
                style={{
                  width: '100%',
                  padding: '0.95rem',
                  borderRadius: '0.875rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.25s',
                  background: isPopular
                    ? 'linear-gradient(135deg, #0022cc, #0077ff, #00e5ff)'
                    : `linear-gradient(135deg, ${plan.color}30, ${plan.color}15)`,
                  color: isPopular ? '#fff' : plan.color,
                  boxShadow: isPopular
                    ? '0 4px 20px rgba(0,119,255,0.4)'
                    : `0 4px 15px ${plan.glow}`,
                  border: isPopular ? 'none' : `1px solid ${plan.border}`,
                }}
                onMouseEnter={e => Object.assign(e.currentTarget.style, {
                  transform: 'translateY(-2px)',
                  boxShadow: isPopular ? '0 8px 30px rgba(0,119,255,0.55)' : `0 8px 25px ${plan.glow}`,
                })}
                onMouseLeave={e => Object.assign(e.currentTarget.style, {
                  transform: 'translateY(0)',
                  boxShadow: isPopular ? '0 4px 20px rgba(0,119,255,0.4)' : `0 4px 15px ${plan.glow}`,
                })}
              >
                Get {plan.tokens} Tokens →
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Payment Pending Notice ── */}
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem 2rem',
        borderRadius: '1.25rem',
        background: 'rgba(251,191,36,0.05)',
        border: '1px solid rgba(251,191,36,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        textAlign: 'left',
      }}>
        <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>🔒</span>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.25rem' }}>
            Secure Payment — Coming Soon
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#fde68a', lineHeight: 1.6 }}>
            Payment integration is under development. Clicking a plan will show a confirmation screen — 
            your tokens will be credited once payment processing is live.
          </p>
        </div>
      </div>

      {/* ── FAQ / Reassurance Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
        {[
          { icon: 'coin', title: 'Tokens never expire', desc: 'Use them at your own pace — no monthly resets.' },
          { icon: '🔬', title: '1 token = 1 full scan', desc: 'Includes model inference, AI explanation & PDF.' },
          { icon: '💬', title: 'Chat is always free', desc: 'AI chat & history browsing never consume tokens.' },
        ].map(item => (
          <div key={item.title} style={{
            padding: '1.25rem',
            borderRadius: '1rem',
            background: 'rgba(0,10,25,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              {item.icon === 'coin' ? <GoldCoin size={32} /> : <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>}
            </div>
            <h5 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>{item.title}</h5>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Pricing;
