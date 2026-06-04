import type { CSSProperties } from 'react'

const fade = (v: boolean): CSSProperties => ({
  opacity: v ? 1 : 0,
  transition: 'opacity 0.9s ease',
})

export default function OmochaAppearsScene({ success }: { success: boolean }) {
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
      {/* Initial: closed gift box */}
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#FFF0F5" />
        {/* box body */}
        <rect x="100" y="100" width="120" height="90" rx="6" fill="#FF8A80" stroke="#E53935" strokeWidth="3.5" />
        {/* box lid */}
        <rect x="90" y="80" width="140" height="28" rx="6" fill="#EF5350" stroke="#E53935" strokeWidth="3.5" />
        {/* ribbon vertical */}
        <rect x="152" y="80" width="16" height="110" fill="#FFD54F" />
        {/* ribbon horizontal on lid */}
        <rect x="90" y="89" width="140" height="12" fill="#FFD54F" />
        {/* bow */}
        <ellipse cx="160" cy="80" rx="22" ry="12" fill="#FFD54F" stroke="#F9A825" strokeWidth="2.5" />
        <circle cx="160" cy="80" r="6" fill="#FF8A80" stroke="#F9A825" strokeWidth="2" />
      </g>

      {/* Success: box open, teddy bear pops out with streamers */}
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#FFF0F5" />
        {/* streamers */}
        <path d="M 160 80 Q 120 50 90 30" stroke="#FF5252" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 160 80 Q 200 45 230 20" stroke="#4CAF50" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 160 80 Q 140 40 110 15" stroke="#FFD54F" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 160 80 Q 180 35 215 10" stroke="#AB47BC" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* confetti dots */}
        <circle cx="95"  cy="35" r="4" fill="#FF5252" />
        <circle cx="230" cy="22" r="4" fill="#4CAF50" />
        <circle cx="112" cy="18" r="4" fill="#FFD54F" />
        <circle cx="218" cy="12" r="4" fill="#AB47BC" />
        {/* box body */}
        <rect x="100" y="120" width="120" height="72" rx="6" fill="#FF8A80" stroke="#E53935" strokeWidth="3.5" />
        {/* open lid flaps */}
        <rect x="90"  y="90" width="60" height="28" rx="4" fill="#EF5350" stroke="#E53935" strokeWidth="3" transform="rotate(-30 90 90)" />
        <rect x="170" y="90" width="60" height="28" rx="4" fill="#EF5350" stroke="#E53935" strokeWidth="3" transform="rotate(30 230 90)" />
        {/* teddy bear head (peeking out) */}
        <circle cx="160" cy="92" r="30" fill="#D7A26B" stroke="#8D6E63" strokeWidth="3.5" />
        <circle cx="146" cy="80" r="10" fill="#D7A26B" stroke="#8D6E63" strokeWidth="2.5" />
        <circle cx="174" cy="80" r="10" fill="#D7A26B" stroke="#8D6E63" strokeWidth="2.5" />
        <ellipse cx="160" cy="98" rx="10" ry="8" fill="#C4854A" />
        <circle cx="151" cy="88" r="3.5" fill="#3E2723" />
        <circle cx="169" cy="88" r="3.5" fill="#3E2723" />
        <path d="M 152 104 Q 160 110 168 104" fill="none" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}
