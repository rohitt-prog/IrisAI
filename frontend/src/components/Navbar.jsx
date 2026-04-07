import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useTokens } from '../context/TokenContext';
import GoldCoin from './GoldCoin';

const navLinks = [
  { to: '/upload', label: 'Screening', icon: '●' },
  { to: '/dashboard', label: 'Dashboard', authRequired: true },
  { to: '/history', label: 'History', authRequired: true },
];

// Colour based on token count
const getTokenStyle = (count) => {
  if (count === 0)  return { color: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)'  };
  if (count <= 5)   return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' };
  return              { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  };
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const { tokens } = useTokens();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;
  const tokenStyle = tokens !== null ? getTokenStyle(tokens) : null;

  return (
    <nav style={{
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      backgroundColor: 'var(--bg-base)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <Logo width={160} height={50} style={{ marginLeft: '-10px', marginTop: '-5px' }} />
        </Link>

        {/* Nav + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {navLinks.map(link => {
            if (link.authRequired && !token) return null;
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: isActive(link.to) ? '#a3d9ff' : 'var(--text-secondary)',
                  backgroundColor: isActive(link.to) ? 'rgba(0, 170, 255, 0.1)' : 'transparent',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '50rem', fontSize: '0.9rem', fontWeight: 500,
                  textDecoration: 'none',
                  border: isActive(link.to) ? '1px solid rgba(0, 170, 255, 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {link.icon && <span style={{ color: '#00e5ff', fontSize: '0.8rem' }}>{link.icon}</span>}
                {link.label}
              </Link>
            );
          })}

          {/* Pricing link — always visible */}
          <Link
            to="/pricing"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: isActive('/pricing') ? '#a3d9ff' : 'var(--text-secondary)',
              backgroundColor: isActive('/pricing') ? 'rgba(0, 170, 255, 0.1)' : 'transparent',
              padding: '0.5rem 1.25rem',
              borderRadius: '50rem', fontSize: '0.9rem', fontWeight: 500,
              textDecoration: 'none',
              border: isActive('/pricing') ? '1px solid rgba(0, 170, 255, 0.2)' : '1px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <GoldCoin size={16} style={{ marginRight: '2px' }} /> Plans
          </Link>

          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

              {/* Token Badge — clicking it goes to Pricing */}
              {tokens !== null && tokenStyle && (
                <Link
                  to="/pricing"
                  title="Buy more tokens"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '0.35rem 0.9rem',
                    borderRadius: '50rem',
                    fontSize: '0.82rem', fontWeight: 700,
                    color: tokenStyle.color,
                    backgroundColor: tokenStyle.bg,
                    border: `1px solid ${tokenStyle.border}`,
                    textDecoration: 'none',
                    transition: 'all 0.25s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, { filter: 'brightness(1.15)' })}
                  onMouseLeave={e => Object.assign(e.currentTarget.style, { filter: 'brightness(1)' })}
                >
                  <GoldCoin size={16} /> {tokens} left
                </Link>
              )}

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '0.4rem 1.1rem',
                  borderRadius: '50rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => Object.assign(e.target.style, { backgroundColor: 'rgba(255,255,255,0.05)' })}
                onMouseOut={e => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" style={{
                color: 'var(--text-primary)', textDecoration: 'none',
                fontWeight: 500, fontSize: '0.85rem',
                padding: '0.4rem 1.1rem', borderRadius: '50rem', transition: 'all 0.2s',
              }}
              onMouseOver={e => Object.assign(e.target.style, { backgroundColor: 'rgba(255,255,255,0.05)' })}
              onMouseOut={e => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
              >Login</Link>
              <Link to="/signup" style={{
                color: 'var(--text-primary)', textDecoration: 'none',
                fontWeight: 500, fontSize: '0.85rem',
                padding: '0.4rem 1.1rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '50rem', transition: 'all 0.2s',
              }}
              onMouseOver={e => Object.assign(e.target.style, { backgroundColor: 'rgba(255,255,255,0.05)' })}
              onMouseOut={e => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
              >Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
