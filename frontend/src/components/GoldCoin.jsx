/**
 * GoldCoin — a premium SVG gold coin icon.
 * Props:
 *   size  {number}  — width & height in px   (default 20)
 *   style {object}  — extra inline style
 */
const GoldCoin = ({ size = 20, style = {} }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    {/* Outer ring / shadow */}
    <circle cx="20" cy="21" r="17" fill="#b8860b" opacity="0.5" />

    {/* Main coin body */}
    <circle cx="20" cy="20" r="17" fill="url(#coinGrad)" />

    {/* Inner ring */}
    <circle cx="20" cy="20" r="13.5" fill="none" stroke="url(#innerRing)" strokeWidth="1.2" />

    {/* Shine arc top-left */}
    <ellipse cx="14" cy="12" rx="5" ry="2.5" fill="rgba(255,255,180,0.35)" transform="rotate(-30 14 12)" />

    {/* Dollar / coin letter */}
    <text
      x="20"
      y="25.5"
      textAnchor="middle"
      fontSize="15"
      fontWeight="900"
      fontFamily="'Space Grotesk','Arial Black',sans-serif"
      fill="url(#letterGrad)"
      style={{ userSelect: 'none' }}
    >
      $
    </text>

    {/* Gradient definitions */}
    <defs>
      <radialGradient id="coinGrad" cx="38%" cy="32%" r="68%">
        <stop offset="0%"   stopColor="#fff176" />
        <stop offset="30%"  stopColor="#ffd700" />
        <stop offset="65%"  stopColor="#f5a800" />
        <stop offset="100%" stopColor="#b8860b" />
      </radialGradient>

      <linearGradient id="innerRing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stopColor="#fff9c4" stopOpacity="0.9" />
        <stop offset="50%"  stopColor="#ffd700" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#b8860b" stopOpacity="0.6" />
      </linearGradient>

      <linearGradient id="letterGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#fffde7" />
        <stop offset="100%" stopColor="#b8860b" />
      </linearGradient>
    </defs>
  </svg>
);

export default GoldCoin;
