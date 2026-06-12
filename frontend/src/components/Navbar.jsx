import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from './Logo';
import { useTokens } from '../context/TokenContext';
import GoldCoin from './GoldCoin';

const navLinks = [
  { to: '/upload',    label: 'Screening',    icon: '🔬', authRequired: false },
  { to: '/dashboard', label: 'Dashboard',    icon: '📊', authRequired: true  },
  { to: '/history',   label: 'History',      icon: '📋', authRequired: true  },
  { to: '/chat',      label: 'AI Assistant', icon: '🤖', authRequired: false },
];

const getTokenStyle = (count) => {
  if (count === 0)  return { color: '#fb7185', bg: 'rgba(244,63,94,0.12)',   border: 'rgba(244,63,94,0.3)'   };
  if (count <= 5)   return { color: '#fcd34d', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' };
  return              { color: '#6ee7b7', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  };
};

const Navbar = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const { tokens } = useTokens();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;
  const tokenStyle = tokens !== null ? getTokenStyle(tokens) : null;

  return (
    <>
      <nav style={{
        borderBottom: scrolled ? '1px solid rgba(0,229,255,0.10)' : '1px solid rgba(255,255,255,0.04)',
        backgroundColor: scrolled ? 'rgba(0, 5, 15, 0.92)' : 'rgba(0, 5, 15, 0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4), 0 1px 0 rgba(0,229,255,0.08)' : 'none',
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)',
          opacity: scrolled ? 1 : 0,
          transition: 'opacity 0.4s',
        }} />

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
        }}>
          {/* ── Logo ── */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Logo width={150} height={46} style={{ marginLeft: '-6px', marginTop: '-3px' }} />
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {navLinks.map(link => {
              if (link.authRequired && !token) return null;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: active ? '#7dd3fc' : 'rgba(147,197,253,0.75)',
                    backgroundColor: active ? 'rgba(0,170,255,0.12)' : 'transparent',
                    padding: '0.5rem 1.1rem',
                    borderRadius: '0.625rem',
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                    textDecoration: 'none',
                    border: active ? '1px solid rgba(0,170,255,0.22)' : '1px solid transparent',
                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      Object.assign(e.currentTarget.style, {
                        color: '#e0f2fe',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                      });
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      Object.assign(e.currentTarget.style, {
                        color: 'rgba(147,197,253,0.75)',
                        backgroundColor: 'transparent',
                      });
                    }
                  }}
                >
                  <span style={{ fontSize: '0.8rem' }}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}

            {/* Plans link */}
            <Link
              to="/pricing"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: isActive('/pricing') ? '#7dd3fc' : 'rgba(147,197,253,0.75)',
                backgroundColor: isActive('/pricing') ? 'rgba(0,170,255,0.12)' : 'transparent',
                padding: '0.5rem 1.1rem',
                borderRadius: '0.625rem',
                fontSize: '0.875rem',
                fontWeight: isActive('/pricing') ? 600 : 500,
                textDecoration: 'none',
                border: isActive('/pricing') ? '1px solid rgba(0,170,255,0.22)' : '1px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                if (!isActive('/pricing')) {
                  Object.assign(e.currentTarget.style, { color: '#e0f2fe', backgroundColor: 'rgba(255,255,255,0.06)' });
                }
              }}
              onMouseLeave={e => {
                if (!isActive('/pricing')) {
                  Object.assign(e.currentTarget.style, { color: 'rgba(147,197,253,0.75)', backgroundColor: 'transparent' });
                }
              }}
            >
              <GoldCoin size={14} />
              Plans
            </Link>
          </div>

          {/* ── Right Side Auth / Token ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            {token ? (
              <>
                {/* Token badge */}
                {tokens !== null && tokenStyle && (
                  <Link
                    to="/pricing"
                    title="Buy more tokens"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '0.38rem 0.85rem',
                      borderRadius: '50rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: tokenStyle.color,
                      backgroundColor: tokenStyle.bg,
                      border: `1px solid ${tokenStyle.border}`,
                      textDecoration: 'none',
                      transition: 'all 0.25s',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => Object.assign(e.currentTarget.style, { filter: 'brightness(1.2)', transform: 'translateY(-1px)' })}
                    onMouseLeave={e => Object.assign(e.currentTarget.style, { filter: 'brightness(1)', transform: 'translateY(0)' })}
                  >
                    <GoldCoin size={14} />
                    {tokens} token{tokens !== 1 ? 's' : ''}
                  </Link>
                )}

                {/* Sign Out */}
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    color: 'rgba(147,197,253,0.8)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    padding: '0.42rem 1rem',
                    borderRadius: '0.625rem',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseOver={e => Object.assign(e.currentTarget.style, {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: '#e0f2fe',
                    borderColor: 'rgba(255,255,255,0.16)',
                  })}
                  onMouseOut={e => Object.assign(e.currentTarget.style, {
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    color: 'rgba(147,197,253,0.8)',
                    borderColor: 'rgba(255,255,255,0.10)',
                  })}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/login"
                  className="btn-ghost"
                  style={{ fontSize: '0.875rem' }}
                >
                  Sign In
                </Link>
                <Link to="/signup"
                  className="btn-primary"
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
                >
                  Get Started →
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="show-mobile"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.625rem',
                padding: '0.5rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '1.2rem',
                lineHeight: 1,
              }}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div style={{
            borderTop: '1px solid rgba(0,229,255,0.08)',
            background: 'rgba(0, 5, 20, 0.97)',
            backdropFilter: 'blur(24px)',
            padding: '1rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: 'fade-in-down 0.2s ease forwards',
          }}>
            {navLinks.map(link => {
              if (link.authRequired && !token) return null;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.875rem',
                    textDecoration: 'none',
                    color: isActive(link.to) ? '#7dd3fc' : 'var(--text-secondary)',
                    background: isActive(link.to) ? 'rgba(0,170,255,0.1)' : 'transparent',
                    border: '1px solid',
                    borderColor: isActive(link.to) ? 'rgba(0,170,255,0.2)' : 'transparent',
                    fontWeight: 500,
                    fontSize: '0.95rem',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{link.icon}</span> {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
