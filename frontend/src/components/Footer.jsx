import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-base)',
      borderTop: '0.5px solid rgba(255, 255, 255, 0.07)',
      paddingTop: '3rem',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
      }}>
        {/* Main Footer Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          paddingBottom: '3rem',
        }}>
          {/* Left side */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '0.5rem' }}>
              <Logo width={140} height={40} style={{ marginLeft: '-10px' }} />
            </Link>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: '500',
              marginTop: '0.5rem'
            }}>
              AI-Powered Eye Health Screening
            </p>
          </div>

          {/* Center */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flex: '2', minWidth: '350px' }}>
            {['Home', 'Screening', 'About', 'Contact'].map((link) => (
              <Link
                key={link}
                to={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flex: '1', minWidth: '150px' }}>
            <SocialIcon type="twitter" />
            <SocialIcon type="linkedin" />
            <SocialIcon type="github" />
          </div>
        </div>

        {/* Divider & Bottom Strip */}
        <div style={{
          borderTop: '0.5px solid rgba(255, 255, 255, 0.07)',
          padding: '1.5rem 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '500' }}>
            © 2025 IRISAI. All rights reserved.
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '500', display: 'flex', gap: '1rem' }}>
            <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}>Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'} onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}>Terms of Service</Link>
            <span>·</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>HIPAA Compliant</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

// Simple styled wrapper for social SVGs
const SocialIcon = ({ type }) => {
  const getIcon = () => {
    switch(type) {
      case 'twitter': return <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
      case 'linkedin': return <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
      case 'github': return <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1.3-.5-2.5-1.4-3.4 3.7-.4 7.6-1.9 7.6-8.2 0-1.8-.7-3.4-1.9-4.7.5-1.2.6-2.5-.2-4.1 0 0-1.5-.5-4.8 2.3A17.1 17.1 0 0 0 12 3c-1.9 0-3.8.3-5.5.8-3.3-2.8-4.8-2.3-4.8-2.3-.8 1.6-.7 2.9-.2 4.1-1.2 1.3-1.9 2.9-1.9 4.7 0 6.3 3.9 7.8 7.6 8.2-.9.8-1.4 2-1.4 3.4V22"></path></svg>;
      default: return null;
    }
  };

  return (
    <a href="#" style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      borderRadius: '50rem',
      color: 'var(--text-muted)',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      textDecoration: 'none'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.color = 'var(--text-primary)';
      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.color = 'var(--text-muted)';
      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
    }}
    >
      {getIcon()}
    </a>
  );
};

export default Footer;
