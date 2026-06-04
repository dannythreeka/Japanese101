import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function UmaRunsInScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#87ceeb"/>
        <rect x="0" y="165" width="320" height="55" fill="#7bc97b"/>
        <ellipse cx="80" cy="155" rx="50" ry="20" fill="#5a9a5a"/>
        <ellipse cx="240" cy="158" rx="60" ry="18" fill="#5a9a5a"/>
        <path d="M0,90 Q60,70 120,80 Q180,90 240,70 Q280,60 320,75 L320,100 L0,100Z" fill="#6ab0d8" opacity="0.4"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#87ceeb"/>
        <rect x="0" y="165" width="320" height="55" fill="#5cb85c"/>
        <path d="M0,90 Q60,70 120,80 Q180,90 240,70 Q280,60 320,75 L320,100 L0,100Z" fill="#6ab0d8" opacity="0.4"/>
        {/* horse body */}
        <ellipse cx="160" cy="148" rx="55" ry="28" fill="#8b6340" stroke="#6b4320" strokeWidth="3"/>
        <ellipse cx="195" cy="130" rx="28" ry="22" fill="#8b6340" stroke="#6b4320" strokeWidth="3"/>
        <ellipse cx="205" cy="118" rx="16" ry="12" fill="#8b6340" stroke="#6b4320" strokeWidth="2.5"/>
        {/* legs */}
        <rect x="118" y="170" width="12" height="30" fill="#7a5230" rx="3"/>
        <rect x="138" y="168" width="12" height="32" fill="#7a5230" rx="3" transform="rotate(-8,144,168)"/>
        <rect x="174" y="168" width="12" height="32" fill="#7a5230" rx="3" transform="rotate(8,180,168)"/>
        <rect x="194" y="170" width="12" height="30" fill="#7a5230" rx="3"/>
        {/* mane */}
        <path d="M182,110 Q190,100 200,105 Q205,108 200,116" fill="#5a3820" stroke="#4a2810" strokeWidth="2"/>
        <path d="M175,108 Q182,96 192,100" fill="none" stroke="#5a3820" strokeWidth="3" strokeLinecap="round"/>
        {/* eye */}
        <circle cx="210" cy="115" r="3" fill="#2a1a0a"/>
        <circle cx="211" cy="114" r="1" fill="white"/>
        {/* nostril */}
        <ellipse cx="216" cy="121" rx="3" ry="2" fill="#5a3820"/>
        {/* tail */}
        <path d="M108,148 Q88,140 78,155 Q70,168 80,175" fill="none" stroke="#5a3820" strokeWidth="4" strokeLinecap="round"/>
        {/* dust */}
        <circle cx="100" cy="175" r="8" fill="#d2b48c" opacity="0.6"/>
        <circle cx="115" cy="180" r="6" fill="#d2b48c" opacity="0.5"/>
        <circle cx="88" cy="180" r="5" fill="#d2b48c" opacity="0.4"/>
      </g>
    </svg>
  )
}
