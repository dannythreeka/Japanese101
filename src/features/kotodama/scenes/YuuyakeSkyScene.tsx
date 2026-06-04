import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 1.2s ease' })
export default function YuuyakeSkyScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#87ceeb"/>
        <rect x="0" y="178" width="320" height="42" fill="#6aaa6a"/>
        <ellipse cx="258" cy="55" rx="30" ry="30" fill="#fef9c3" stroke="#fde047" strokeWidth="2"/>
        <ellipse cx="80" cy="68" rx="45" ry="24" fill="white"/>
        <ellipse cx="58" cy="76" rx="30" ry="19" fill="white"/>
        <ellipse cx="108" cy="76" rx="28" ry="18" fill="white"/>
        <ellipse cx="200" cy="58" rx="38" ry="20" fill="white"/>
        <ellipse cx="178" cy="66" rx="26" ry="16" fill="white"/>
        <ellipse cx="225" cy="66" rx="24" ry="16" fill="white"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#f97316"/>
        <rect x="0" y="60" width="320" height="120" fill="#fb923c" opacity="0.6"/>
        <rect x="0" y="130" width="320" height="50" fill="#dc2626" opacity="0.4"/>
        <rect x="0" y="178" width="320" height="42" fill="#2d4a2d"/>
        {/* sun on horizon */}
        <ellipse cx="160" cy="178" rx="44" ry="22" fill="#fbbf24" opacity="0.9"/>
        {/* reflection on ground */}
        <ellipse cx="160" cy="185" rx="30" ry="8" fill="#fcd34d" opacity="0.5"/>
        {/* dramatic clouds - dyed red */}
        <ellipse cx="80" cy="70" rx="48" ry="22" fill="#c2410c"/>
        <ellipse cx="55" cy="80" rx="30" ry="18" fill="#dc2626"/>
        <ellipse cx="112" cy="80" rx="30" ry="17" fill="#c2410c"/>
        <ellipse cx="230" cy="62" rx="40" ry="20" fill="#9a3412"/>
        <ellipse cx="208" cy="72" rx="28" ry="16" fill="#c2410c"/>
        <ellipse cx="255" cy="72" rx="26" ry="15" fill="#9a3412"/>
        {/* mountain silhouettes */}
        <polygon points="0,178 80,120 160,178" fill="#1a2a1a" opacity="0.8"/>
        <polygon points="120,178 220,105 320,178" fill="#1a2a1a" opacity="0.8"/>
        {/* horizon glow */}
        <rect x="0" y="170" width="320" height="12" fill="#fbbf24" opacity="0.3"/>
      </g>
    </svg>
  )
}
