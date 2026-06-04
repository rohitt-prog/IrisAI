import { Link } from 'react-router-dom';
import Logo from './Logo';

const footerLinks = {
  Product: [
    { label: 'Eye Screening', to: '/upload' },
    { label: 'AI Assistant', to: '/chat' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'History', to: '/history' },
  ],
  Pricing: [
    { label: 'Plans & Tokens', to: '/pricing' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
  ],
};

const SocialLink = ({ href, label, children }) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noreferrer"
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '38px', height: '38px',
      borderRadius: '0.75rem',
      color: 'var(--text-muted)',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.25s',
      cursor: 'pointer', textDecoration: 'none',
    }}
    onMouseOver={e => {
      e.currentTarget.style.color = 'var(--iris-300)';
      e.currentTarget.style.background = 'rgba(0,170,255,0.1)';
      e.currentTarget.style.borderColor = 'rgba(0,170,255,0.25)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--glow-xs)';
    }}
    onMouseOut={e => {
      e.currentTarget.style.color = 'var(--text-muted)';
      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    {children}
  </a>
);

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-base)',
      borderTop: '1px solid rgba(0,229,255,0.06)',
      marginTop: 'auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle top glow */}
      <div style={{
        position: 'absolute',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '600px', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.25), transparent)',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3.5rem 1.5rem 2rem' }}>

        {/* Main row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1rem' }}>
              <Logo width={130} height={40} style={{ marginLeft: '-8px' }} />
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: '260px', marginBottom: '1.5rem' }}>
              AI-powered anterior eye health screening — helping clinicians detect conditions faster and more accurately.
            </p>

            {/* Stats pills */}
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {[
                { label: '94.2% Accuracy', color: 'rgba(0,229,255,0.12)', border: 'rgba(0,229,255,0.2)', text: 'var(--iris-300)' },
                { label: '6 Conditions', color: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.2)', text: '#c4b5fd' },
                { label: '<3s Results', color: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.2)', text: '#fcd34d' },
              ].map(s => (
                <span key={s.label} style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '50rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: s.color,
                  border: `1px solid ${s.border}`,
                  color: s.text,
                }}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p style={{
                fontSize: '0.72rem', fontWeight: 800,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--text-muted)', marginBottom: '1.1rem',
              }}>
                {title}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {links.map(link => (
                  <Link
                    key={link.label}
                    to={link.to}
                    style={{
                      color: 'var(--text-muted)', textDecoration: 'none',
                      fontSize: '0.875rem', fontWeight: 500,
                      transition: 'color 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', marginBottom: '1.75rem' }} />

        {/* Bottom strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
              © 2025 IRISAI · All rights reserved
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.2rem 0.65rem', borderRadius: '50rem',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
              fontSize: '0.68rem', fontWeight: 700, color: '#6ee7b7',
            }}>
              ✅ HIPAA-Aware
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.2rem 0.65rem', borderRadius: '50rem',
              background: 'rgba(0,119,255,0.08)', border: '1px solid rgba(0,119,255,0.2)',
              fontSize: '0.68rem', fontWeight: 700, color: '#93c5fd',
            }}>
              🔒 Encrypted
            </span>
          </div>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <SocialLink href="#" label="Twitter">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </SocialLink>
            <SocialLink href="#" label="LinkedIn">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
              </svg>
            </SocialLink>
            <SocialLink href="#" label="GitHub">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1.3-.5-2.5-1.4-3.4 3.7-.4 7.6-1.9 7.6-8.2 0-1.8-.7-3.4-1.9-4.7.5-1.2.6-2.5-.2-4.1 0 0-1.5-.5-4.8 2.3A17.1 17.1 0 0 0 12 3c-1.9 0-3.8.3-5.5.8-3.3-2.8-4.8-2.3-4.8-2.3-.8 1.6-.7 2.9-.2 4.1-1.2 1.3-1.9 2.9-1.9 4.7 0 6.3 3.9 7.8 7.6 8.2-.9.8-1.4 2-1.4 3.4V22" />
              </svg>
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
