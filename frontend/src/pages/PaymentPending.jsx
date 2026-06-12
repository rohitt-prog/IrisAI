import { useLocation, useNavigate, Link } from 'react-router-dom';
import GoldCoin from '../components/GoldCoin';

const PaymentPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '70vh', padding: '2rem',
    }}>
      <div className="animate-fade-in-up glass-card-elevated" style={{
        maxWidth: '480px', width: '100%',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
      }}>
        {/* Animated lock icon */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))',
          border: '1px solid rgba(251,191,36,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.2rem',
          boxShadow: '0 0 40px rgba(251,191,36,0.15)',
        }}>
          🔒
        </div>

        <div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 800,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '0.5rem',
          }}>
            Payment Coming Soon
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            We're integrating our secure payment gateway.
            {plan && (
              <span>
                {' '}Your selected plan — <strong style={{ color: '#00e5ff' }}>{plan.name} ({plan.tokens} tokens for ${plan.price})</strong> — will be available shortly.
              </span>
            )}
          </p>
        </div>

        {/* Plan recap card */}
        {plan && (
          <div style={{
            width: '100%',
            padding: '1.25rem 1.5rem',
            borderRadius: '1rem',
            background: 'rgba(0,229,255,0.04)',
            border: '1px solid rgba(0,229,255,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Selected Plan</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#a3d9ff', marginTop: '0.2rem' }}><GoldCoin size={16} /> {plan.tokens} Scan Tokens</div>
              </div>
              <div style={{
                fontSize: '2rem', fontWeight: 900,
                fontFamily: 'Space Grotesk, sans-serif',
                color: '#00e5ff',
              }}>
                ${plan.price}
              </div>
            </div>
          </div>
        )}

        <p style={{
          fontSize: '0.82rem', color: 'var(--text-muted)',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          lineHeight: 1.6,
        }}>
          We'll notify you as soon as payments are live. Your existing 10 starter tokens are available in the meantime.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button
            onClick={() => navigate('/pricing')}
            style={{
              flex: 1, padding: '0.85rem',
              borderRadius: '0.875rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            ← Back to Plans
          </button>
          <Link
            to="/upload"
            className="btn-primary"
            style={{ flex: 1, borderRadius: '0.875rem', fontSize: '0.9rem', padding: '0.85rem' }}
          >
            Start Scanning
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
