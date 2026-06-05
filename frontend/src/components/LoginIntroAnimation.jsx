import { useEffect, useState, useRef } from 'react';

/**
 * LoginIntroAnimation — Premium Holographic Iris Scanner
 *
 * Cinematic sequence (~3.8s total):
 *  0ms        : Pure black
 *  80ms       : Background nebula fades in
 *  200ms      : SVG iris expands from center with spring bounce
 *  200→2600ms : Dual counter-rotating scan arcs, pupil breathes,
 *               iris texture spokes radiate, data-stream HUD ticks,
 *               floating hex grid particles drift outward
 *  800ms      : "IRISAI" glitch-reveals letter by letter
 *  1400ms     : Subtitle + status bar type-on
 *  2600ms     : Everything compresses → cyan supernova flash
 *  3800ms     : onComplete → navigate to /dashboard
 */

const TOTAL_MS = 3800;
const LETTERS  = ['I','R','I','S','A','I'];

export default function LoginIntroAnimation({ onComplete }) {
  const [phase,       setPhase]       = useState(0);
  const [revealed,    setRevealed]    = useState(0);   // how many letters shown
  const [showSub,     setShowSub]     = useState(false);
  const [progress,    setProgress]    = useState(0);   // 0-100 HUD progress bar
  const rafRef = useRef(null);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1),    80),           // bg in
      setTimeout(() => setPhase(2),    200),           // iris in
      setTimeout(() => setPhase(3),    2600),          // converge
      setTimeout(() => onComplete?.(), TOTAL_MS),
    ];

    // letter-by-letter reveal with micro glitch delay
    LETTERS.forEach((_, i) =>
      t.push(setTimeout(() => setRevealed(i + 1), 800 + i * 120))
    );

    // subtitle
    t.push(setTimeout(() => setShowSub(true), 1600));

    // HUD progress bar sweeps 0→100 over ~1.8s starting at 400ms
    const start = Date.now();
    const DURATION = 1800;
    const tick = () => {
      const elapsed = Date.now() - start - 400;
      if (elapsed < 0) { rafRef.current = requestAnimationFrame(tick); return; }
      const p = Math.min(100, Math.round((elapsed / DURATION) * 100));
      setProgress(p);
      if (p < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      t.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  const isActive = phase === 2;
  const isGone   = phase >= 3;

  return (
    <div className="holo-overlay">

      {/* ── Nebula background ── */}
      <div className={`holo-nebula ${phase >= 1 ? 'holo-nebula--in' : ''}`} />

      {/* ── Starfield dots ── */}
      <div className="holo-stars" aria-hidden="true">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="holo-star" style={{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--d': `${(Math.random() * 3).toFixed(2)}s`,
            '--s': `${(0.5 + Math.random() * 2).toFixed(1)}px`,
          }} />
        ))}
      </div>

      {/* ── Main iris stage ── */}
      <div className={`holo-stage ${isActive ? 'holo-stage--in' : ''} ${isGone ? 'holo-stage--gone' : ''}`}>

        {/* Outer halo glow ring */}
        <div className="holo-halo" />

        {/* ── SVG iris ── */}
        <svg className="holo-iris-svg" viewBox="0 0 320 320" width="320" height="320">
          <defs>
            <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#001830" />
              <stop offset="35%"  stopColor="#002a50" />
              <stop offset="70%"  stopColor="#001020" />
              <stop offset="100%" stopColor="#000508" />
            </radialGradient>
            <radialGradient id="pupilGrad" cx="42%" cy="38%" r="50%">
              <stop offset="0%"   stopColor="#0088cc" stopOpacity="0.3" />
              <stop offset="40%"  stopColor="#001030" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="softglow">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <clipPath id="irisClip">
              <circle cx="160" cy="160" r="118" />
            </clipPath>
          </defs>

          {/* Base iris disc */}
          <circle cx="160" cy="160" r="118" fill="url(#irisGrad)" />

          {/* Iris texture — radiating spokes */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i / 36) * 360;
            const rad   = (angle * Math.PI) / 180;
            const x1 = 160 + Math.cos(rad) * 32;
            const y1 = 160 + Math.sin(rad) * 32;
            const x2 = 160 + Math.cos(rad) * 115;
            const y2 = 160 + Math.sin(rad) * 115;
            const opacity = 0.06 + (i % 3 === 0 ? 0.1 : 0) + (i % 9 === 0 ? 0.08 : 0);
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={`rgba(0,${160 + (i % 4) * 20},255,${opacity})`}
                strokeWidth={i % 9 === 0 ? 1.2 : 0.6}
                clipPath="url(#irisClip)"
              />
            );
          })}

          {/* Concentric iris texture rings */}
          {[48, 64, 80, 96].map((r, i) => (
            <circle key={r} cx="160" cy="160" r={r}
              fill="none"
              stroke={`rgba(0,${180 + i * 15},255,${0.08 + i * 0.04})`}
              strokeWidth="0.8"
              strokeDasharray={`${3 + i} ${4 - i * 0.5}`}
            />
          ))}

          {/* Pupil */}
          <circle cx="160" cy="160" r="30" fill="url(#pupilGrad)" />
          <circle cx="160" cy="160" r="30" fill="none"
            stroke="rgba(0,200,255,0.6)" strokeWidth="1.5" />
          {/* Pupil highlight */}
          <circle cx="153" cy="153" r="6"
            fill="rgba(0,200,255,0.15)" filter="url(#softglow)" />
          <circle cx="151" cy="151" r="2.5"
            fill="rgba(180,240,255,0.7)" />

          {/* Limbal ring */}
          <circle cx="160" cy="160" r="118"
            fill="none" stroke="rgba(0,200,255,0.35)" strokeWidth="2" />
          <circle cx="160" cy="160" r="115"
            fill="none" stroke="rgba(0,100,200,0.15)" strokeWidth="1" />

          {/* Outer decorative ring with dashes */}
          <circle cx="160" cy="160" r="140"
            fill="none" stroke="rgba(0,200,255,0.18)" strokeWidth="1"
            strokeDasharray="4 8" />
          <circle cx="160" cy="160" r="148"
            fill="none" stroke="rgba(0,150,255,0.1)" strokeWidth="0.5" />
          <circle cx="160" cy="160" r="156"
            fill="none" stroke="rgba(0,200,255,0.07)" strokeWidth="0.5" />

          {/* Cardinal tick marks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
            const r = (deg * Math.PI) / 180;
            const big = deg % 90 === 0;
            return (
              <line key={deg}
                x1={160 + Math.cos(r) * 143} y1={160 + Math.sin(r) * 143}
                x2={160 + Math.cos(r) * (big ? 133 : 138)} y2={160 + Math.sin(r) * (big ? 133 : 138)}
                stroke={big ? 'rgba(0,220,255,0.8)' : 'rgba(0,180,255,0.4)'}
                strokeWidth={big ? 2 : 1}
                filter={big ? 'url(#glow)' : undefined}
              />
            );
          })}

          {/* Glowing accent dots on limbal ring */}
          {[30, 150, 210, 330].map(deg => {
            const r = (deg * Math.PI) / 180;
            return (
              <circle key={deg}
                cx={160 + Math.cos(r) * 118} cy={160 + Math.sin(r) * 118}
                r="3" fill="rgba(0,220,255,0.9)" filter="url(#glow)" />
            );
          })}
        </svg>

        {/* ── Dual counter-rotating scan arcs ── */}
        <div className="holo-arc holo-arc--outer holo-arc--cw"  />
        <div className="holo-arc holo-arc--mid   holo-arc--ccw" />
        <div className="holo-arc holo-arc--inner holo-arc--cw"  style={{ animationDuration: '0.9s' }} />

        {/* ── Horizontal scan beam ── */}
        <div className="holo-hbeam" />

        {/* ── HUD corner brackets ── */}
        {['tl','tr','bl','br'].map(pos => (
          <div key={pos} className={`holo-bracket holo-bracket--${pos}`}>
            <div className="holo-bracket-h" />
            <div className="holo-bracket-v" />
          </div>
        ))}

        {/* ── HUD side data readouts ── */}
        <div className="holo-hud holo-hud--left">
          <div className="holo-hud-line">SCAN MODE · ACTIVE</div>
          <div className="holo-hud-line">RES · 8192×8192</div>
          <div className="holo-hud-line">AI ENGINE · v4.2</div>
          <div className="holo-hud-line holo-hud-line--accent">STATUS · VERIFYING</div>
        </div>
        <div className="holo-hud holo-hud--right">
          <div className="holo-hud-line">LAYER · STROMA</div>
          <div className="holo-hud-line">DEPTH · 0.42mm</div>
          <div className="holo-hud-line">SNR · 98.7 dB</div>
          <div className="holo-hud-line holo-hud-line--accent">MATCH · {progress}%</div>
        </div>

        {/* ── Progress bar ── */}
        <div className="holo-progress-wrap">
          <div className="holo-progress-track">
            <div className="holo-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="holo-progress-label">BIOMETRIC SCAN · {progress}%</span>
        </div>
      </div>

      {/* ── IRISAI wordmark ── */}
      <div className={`holo-wordmark ${phase >= 2 ? 'holo-wordmark--in' : ''} ${isGone ? 'holo-wordmark--gone' : ''}`}>
        <div className="holo-logo-row">
          {LETTERS.map((ch, i) => (
            <span
              key={i}
              className={`holo-letter ${i < revealed ? 'holo-letter--on' : ''}`}
              style={{ '--i': i }}
            >
              {ch}
            </span>
          ))}
        </div>
        {showSub && (
          <div className="holo-subtitle">
            <span className="holo-subtitle-text">Advanced Eye Intelligence System</span>
          </div>
        )}
      </div>

      {/* ── Supernova flash ── */}
      <div className={`holo-nova ${isGone ? 'holo-nova--active' : ''}`} />
    </div>
  );
}
