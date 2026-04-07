const conditionInfo = {
  Normal: { icon: '✅', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34,197,94,0.25)' },
  Cataract: { icon: '🌫️', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245,158,11,0.25)' },
  Glaucoma: { icon: '🔴', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239,68,68,0.25)' },
  'Diabetic Retinopathy': { icon: '🩸', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)', border: 'rgba(220,38,38,0.25)' },
  Uveitis: { icon: '💜', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168,85,247,0.25)' },
  Keratoconus: { icon: '🌀', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6,182,212,0.25)' },
};

const getConfidenceClass = (confidence) => {
  if (confidence > 0.8) return { cls: 'confidence-high', label: 'High', badge: 'badge-success' };
  if (confidence > 0.6) return { cls: 'confidence-medium', label: 'Medium', badge: 'badge-warning' };
  return { cls: 'confidence-low', label: 'Low', badge: 'badge-danger' };
};

const ResultCard = ({ prediction, confidence, explanation }) => {
  const ci = conditionInfo[prediction] || conditionInfo.Normal;
  const conf = getConfidenceClass(confidence);
  const pct = (confidence * 100).toFixed(1);

  return (
    <div className="glass-card-elevated animate-fade-in" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <p className="section-label">Diagnosis Result</p>
        <span className={`badge ${conf.badge}`}>{conf.label} Confidence</span>
      </div>

      {/* Prediction badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem',
        borderRadius: '1rem',
        background: ci.bg,
        border: `1px solid ${ci.border}`,
      }}>
        <span style={{ fontSize: '2.5rem' }}>{ci.icon}</span>
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: ci.color, marginBottom: '0.2rem' }}>
            Detected Condition
          </p>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>
            {prediction}
          </p>
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Model Confidence</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            {pct}%
          </span>
        </div>
        <div className="confidence-track">
          <div
            className={`confidence-fill ${conf.cls}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* AI Explanation */}
      <div style={{
        flex: 1,
        padding: '1.25rem',
        borderRadius: '1rem',
        background: 'rgba(59, 130, 246, 0.06)',
        border: '1px solid var(--border-subtle)',
        minHeight: '150px',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
          <span style={{ fontSize: '1.1rem' }}>🤖</span>
          <span style={{ fontWeight: 700, color: 'var(--iris-400)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            AI Medical Explanation
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, fontStyle: 'italic' }}>
          {explanation}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
