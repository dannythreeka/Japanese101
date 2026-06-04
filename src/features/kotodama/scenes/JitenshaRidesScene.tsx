import type { CSSProperties } from 'react'

const fade = (v: boolean): CSSProperties => ({
  opacity: v ? 1 : 0,
  transition: 'opacity 0.9s ease',
})

export default function JitenshaRidesScene({ success }: { success: boolean }) {
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
      {/* Initial: empty road */}
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#E3F2FD" />
        {/* sky gradient suggestion */}
        <rect x="0" y="0" width="320" height="130" fill="#B3D9F7" />
        {/* road */}
        <rect x="0" y="150" width="320" height="70" fill="#78909C" />
        <rect x="0" y="148" width="320" height="6" fill="#607D8B" />
        {/* dashed centre line */}
        <line x1="0"   y1="183" x2="50"  y2="183" stroke="#FFE082" strokeWidth="4" strokeDasharray="20 15" />
        <line x1="50"  y1="183" x2="320" y2="183" stroke="#FFE082" strokeWidth="4" strokeDasharray="20 15" />
        {/* ground hills */}
        <ellipse cx="60"  cy="152" rx="80" ry="30" fill="#A5D6A7" />
        <ellipse cx="270" cy="152" rx="70" ry="28" fill="#C8E6C9" />
      </g>

      {/* Success: red bicycle rides in */}
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#E3F2FD" />
        <rect x="0" y="0" width="320" height="130" fill="#B3D9F7" />
        {/* road */}
        <rect x="0" y="150" width="320" height="70" fill="#78909C" />
        <rect x="0" y="148" width="320" height="6" fill="#607D8B" />
        <line x1="0" y1="183" x2="320" y2="183" stroke="#FFE082" strokeWidth="4" strokeDasharray="20 15" />
        <ellipse cx="60"  cy="152" rx="80" ry="30" fill="#A5D6A7" />
        <ellipse cx="270" cy="152" rx="70" ry="28" fill="#C8E6C9" />
        {/* bicycle - wheels */}
        <circle cx="120" cy="150" r="22" fill="none" stroke="#E53935" strokeWidth="4.5" />
        <circle cx="200" cy="150" r="22" fill="none" stroke="#E53935" strokeWidth="4.5" />
        {/* wheel spokes */}
        <line x1="120" y1="128" x2="120" y2="172" stroke="#E53935" strokeWidth="2.5" />
        <line x1="98"  y1="150" x2="142" y2="150" stroke="#E53935" strokeWidth="2.5" />
        <line x1="200" y1="128" x2="200" y2="172" stroke="#E53935" strokeWidth="2.5" />
        <line x1="178" y1="150" x2="222" y2="150" stroke="#E53935" strokeWidth="2.5" />
        {/* frame */}
        <polyline points="120,150 160,150 185,118 145,118 120,150" fill="none" stroke="#E53935" strokeWidth="4" strokeLinejoin="round" />
        <line x1="200" y1="150" x2="185" y2="118" stroke="#E53935" strokeWidth="4" />
        {/* handlebar */}
        <line x1="185" y1="118" x2="196" y2="108" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        <line x1="193" y1="104" x2="202" y2="110" stroke="#333" strokeWidth="4" strokeLinecap="round" />
        {/* seat */}
        <rect x="150" y="113" width="22" height="6" rx="3" fill="#333" />
        {/* bell sparkle */}
        <circle cx="200" cy="104" r="5" fill="#FFD54F" stroke="#F9A825" strokeWidth="2" />
        <line x1="207" y1="97"  x2="213" y2="91"  stroke="#FFD54F" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="210" y1="104" x2="218" y2="104" stroke="#FFD54F" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="207" y1="111" x2="213" y2="117" stroke="#FFD54F" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}
