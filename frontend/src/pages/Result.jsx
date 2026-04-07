import { useLocation, useNavigate } from 'react-router-dom';
import ResultCard from '../components/ResultCard';
import Chart from '../components/Chart';
import ChatBox from '../components/ChatBox';
import { API_URL } from '../config';
import { useTokens } from '../context/TokenContext';
import GoldCoin from '../components/GoldCoin';

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.result;
  const preview = location.state?.preview;
  const { tokens } = useTokens();

  // Derive display token count: prefer the live context value (already updated),
  // but fall back to the value embedded in the result payload on first render.
  const tokensLeft = tokens !== null ? tokens : data?.tokens_left;
  const tokenColor = tokensLeft === 0 ? '#f87171' : tokensLeft <= 5 ? '#fbbf24' : '#34d399';

  if (!data) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem' }}>
        <div style={{ fontSize: '4rem' }}>🔍</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Session Data Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Please perform a screening first to see results.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          ← Go to Screening
        </button>
      </div>
    );
  }

  const handleDownload = () => {
    window.location.href = `${API_URL}/report/download-report?id=${data.report_id}`;
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: '0.625rem', display: 'inline-flex' }}>
            📋 Report #{data.report_id.substring(0, 8).toUpperCase()}
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>
            Screening <span className="gradient-text">Results</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Tokens remaining after scan */}
          {tokensLeft !== undefined && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0.4rem 1rem',
              borderRadius: '50rem',
              fontSize: '0.85rem', fontWeight: 700,
              color: tokenColor,
              background: `${tokenColor}18`,
              border: `1px solid ${tokenColor}44`,
            }}>
              <GoldCoin size={18} /> {tokensLeft} {tokensLeft === 1 ? 'token' : 'tokens'} left
            </div>
          )}
          <button onClick={handleDownload} className="btn-primary" style={{ gap: '0.5rem' }}>
            📄 Download Full Report
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Scanned Image */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <p className="section-label" style={{ marginBottom: '0.875rem' }}>Image Scanned</p>
            {preview && (
              <img
                src={preview}
                alt="Eye scan"
                style={{
                  width: '100%',
                  borderRadius: '0.875rem',
                  objectFit: 'cover',
                  border: '1px solid var(--border-subtle)',
                  maxHeight: '220px',
                }}
              />
            )}
          </div>

          {/* Chart */}
          <Chart probabilities={data.probabilities} />
        </div>

        {/* Right Column */}
        <ResultCard
          prediction={data.prediction}
          confidence={data.confidence}
          explanation={data.explanation}
        />
      </div>

      {/* Chat Section */}
      <div className="glass-card-elevated" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(59, 130, 246, 0.05)',
        }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
            boxShadow: 'var(--glow-sm)',
            flexShrink: 0,
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'Space Grotesk, sans-serif' }}>
              AI Medical Assistant
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Ask anything about your diagnosis or eye health
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse-glow 2s infinite' }} />
              <span style={{ fontSize: '0.75rem', color: '#86efac', fontWeight: 600 }}>Online</span>
            </div>
          </div>
        </div>
        <ChatBox />
      </div>
    </div>
  );
};

export default Result;
