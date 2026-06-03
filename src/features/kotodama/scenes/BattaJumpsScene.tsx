import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function BattaJumpsScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#c8e6c9"/>
        <rect x="0" y="168" width="320" height="52" fill="#4caf50"/>
        {[20,60,100,140,180,220,260,300].map(x => (
          <g key={x}>
            <ellipse cx={x} cy="168" rx="15" ry="28" fill="#388e3c"/>
            <ellipse cx={x+6} cy="164" rx="12" ry="22" fill="#4caf50"/>
          </g>
        ))}
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#a8d8a8"/>
        <rect x="0" y="168" width="320" height="52" fill="#388e3c"/>
        {[20,60,140,180,260,300].map(x => (
          <g key={x}>
            <ellipse cx={x} cy="168" rx="15" ry="28" fill="#2e7d32"/>
            <ellipse cx={x+6} cy="164" rx="12" ry="22" fill="#388e3c"/>
          </g>
        ))}
        {/* grasshopper in air */}
        <g transform="translate(160,100) rotate(-20)">
          <ellipse cx="0" cy="0" rx="22" ry="10" fill="#5a9a2a" stroke="#3a7a1a" strokeWidth="2"/>
          <circle cx="18" cy="-3" r="10" fill="#5a9a2a" stroke="#3a7a1a" strokeWidth="2"/>
          <circle cx="22" cy="-6" r="4" fill="#212121"/>
          <circle cx="23" cy="-7" r="1.5" fill="white"/>
          {/* antennae */}
          <line x1="20" y1="-12" x2="30" y2="-22" stroke="#3a7a1a" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="22" y1="-12" x2="34" y2="-20" stroke="#3a7a1a" strokeWidth="1.5" strokeLinecap="round"/>
          {/* hind legs (jumping) */}
          <path d="M-8,-5 Q-20,-25 -30,-20" fill="none" stroke="#3a7a1a" strokeWidth="3" strokeLinecap="round"/>
          <path d="M-8,5 Q-20,-5 -30,5" fill="none" stroke="#3a7a1a" strokeWidth="3" strokeLinecap="round"/>
          {/* front legs */}
          <line x1="10" y1="5" x2="20" y2="16" stroke="#3a7a1a" strokeWidth="2" strokeLinecap="round"/>
          <line x1="4" y1="6" x2="10" y2="18" stroke="#3a7a1a" strokeWidth="2" strokeLinecap="round"/>
          {/* wings */}
          <path d="M-5,-8 Q5,-30 18,-20" fill="#88cc44" stroke="#5a9a2a" strokeWidth="1" opacity="0.7"/>
        </g>
        {/* arc line */}
        <path d="M100,168 Q160,90 220,168" fill="none" stroke="#a8d8a8" strokeWidth="2" strokeDasharray="6,5" opacity="0.7"/>
      </g>
    </svg>
  )
}
