import type { CSSProperties } from 'react'

const fade = (v: boolean): CSSProperties => ({
  opacity: v ? 1 : 0,
  transition: 'opacity 0.9s ease',
})

export default function ChouFliesScene({ success }: { success: boolean }) {
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
      {/* Initial: clear sky, petals on ground */}
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#E8F5E9" />
        <rect x="0" y="0" width="320" height="140" fill="#E3F2FD" />
        {/* ground */}
        <ellipse cx="160" cy="210" rx="200" ry="40" fill="#A5D6A7" />
        {/* fallen petals */}
        <ellipse cx="80"  cy="196" rx="10" ry="5" fill="#F48FB1" transform="rotate(-20 80 196)" />
        <ellipse cx="155" cy="200" rx="8"  ry="4" fill="#CE93D8" transform="rotate(10 155 200)" />
        <ellipse cx="240" cy="194" rx="10" ry="5" fill="#FFE082" transform="rotate(30 240 194)" />
      </g>

      {/* Success: butterflies fly up from below */}
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#E8F5E9" />
        <rect x="0" y="0" width="320" height="140" fill="#E3F2FD" />
        <ellipse cx="160" cy="210" rx="200" ry="40" fill="#A5D6A7" />

        {/* Yellow butterfly */}
        <g transform="translate(80, 80)">
          <path d="M 0 0 Q -24 -20 -18 10 Q -24 30 0 16 Z" fill="#FFD54F" stroke="#F9A825" strokeWidth="2" />
          <path d="M 0 0 Q 24 -20 18 10 Q 24 30 0 16 Z"  fill="#FFD54F" stroke="#F9A825" strokeWidth="2" />
          <path d="M 0 0 Q -14 10 -10 22 Q -4 30 0 16 Z" fill="#FFCA28" stroke="#F9A825" strokeWidth="1.5" />
          <path d="M 0 0 Q 14 10 10 22 Q 4 30 0 16 Z"   fill="#FFCA28" stroke="#F9A825" strokeWidth="1.5" />
          <line x1="0" y1="0" x2="0" y2="18" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Blue butterfly */}
        <g transform="translate(170, 55)">
          <path d="M 0 0 Q -28 -24 -20 8 Q -26 32 0 18 Z"  fill="#64B5F6" stroke="#1976D2" strokeWidth="2" />
          <path d="M 0 0 Q 28 -24 20 8 Q 26 32 0 18 Z"    fill="#64B5F6" stroke="#1976D2" strokeWidth="2" />
          <path d="M 0 0 Q -16 12 -12 26 Q -4 34 0 18 Z"  fill="#42A5F5" stroke="#1976D2" strokeWidth="1.5" />
          <path d="M 0 0 Q 16 12 12 26 Q 4 34 0 18 Z"     fill="#42A5F5" stroke="#1976D2" strokeWidth="1.5" />
          <line x1="0" y1="0" x2="0" y2="20" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Purple butterfly */}
        <g transform="translate(255, 90)">
          <path d="M 0 0 Q -22 -18 -16 8 Q -22 28 0 14 Z"  fill="#CE93D8" stroke="#7B1FA2" strokeWidth="2" />
          <path d="M 0 0 Q 22 -18 16 8 Q 22 28 0 14 Z"    fill="#CE93D8" stroke="#7B1FA2" strokeWidth="2" />
          <path d="M 0 0 Q -12 8 -8 20 Q -3 26 0 14 Z"    fill="#BA68C8" stroke="#7B1FA2" strokeWidth="1.5" />
          <path d="M 0 0 Q 12 8 8 20 Q 3 26 0 14 Z"       fill="#BA68C8" stroke="#7B1FA2" strokeWidth="1.5" />
          <line x1="0" y1="0" x2="0" y2="16" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* floating petals */}
        <ellipse cx="130" cy="120" rx="7" ry="3" fill="#F48FB1" transform="rotate(-30 130 120)" opacity="0.85" />
        <ellipse cx="215" cy="105" rx="6" ry="3" fill="#F48FB1" transform="rotate(20 215 105)" opacity="0.85" />
        <ellipse cx="50"  cy="130" rx="7" ry="3" fill="#CE93D8" transform="rotate(15 50 130)" opacity="0.85" />
      </g>
    </svg>
  )
}
