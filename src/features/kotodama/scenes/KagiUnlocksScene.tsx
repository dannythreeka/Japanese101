import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function KagiUnlocksScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#f0e6d0"/>
        <rect x="95" y="90" width="130" height="100" fill="#8b6340" rx="8" stroke="#6b4320" strokeWidth="4"/>
        <rect x="100" y="95" width="120" height="90" fill="#a07850" rx="6"/>
        {/* metal bands */}
        <rect x="95" y="120" width="130" height="12" fill="#c8a060" stroke="#a08040" strokeWidth="1.5"/>
        <rect x="95" y="155" width="130" height="12" fill="#c8a060" stroke="#a08040" strokeWidth="1.5"/>
        {/* lock */}
        <rect x="142" y="125" width="36" height="30" fill="#888" rx="4" stroke="#666" strokeWidth="2"/>
        <path d="M150,125 Q150,108 160,108 Q170,108 170,125" fill="none" stroke="#888" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="160" cy="137" r="5" fill="#444"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#f0e6d0"/>
        {/* open chest lid */}
        <path d="M95,90 Q160,60 225,90 L225,95 Q160,68 95,95 Z" fill="#8b6340" stroke="#6b4320" strokeWidth="3"/>
        <rect x="95" y="120" width="130" height="70" fill="#8b6340" rx="8" stroke="#6b4320" strokeWidth="4"/>
        <rect x="100" y="125" width="120" height="62" fill="#a07850" rx="6"/>
        <rect x="95" y="140" width="130" height="10" fill="#c8a060" stroke="#a08040" strokeWidth="1.5"/>
        {/* gold light rays */}
        {[-40,-25,-10,0,10,25,40].map((a,i) => (
          <line key={i} x1="160" y1="108" x2={160+Math.sin(a*Math.PI/180)*80} y2={108-Math.cos(a*Math.PI/180)*80} stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" opacity="0.85"/>
        ))}
        <circle cx="160" cy="108" r="14" fill="#fcd34d" stroke="#f59e0b" strokeWidth="2"/>
        {/* key */}
        <circle cx="220" cy="70" r="12" fill="none" stroke="#fcd34d" strokeWidth="4"/>
        <circle cx="220" cy="70" r="5" fill="#fcd34d"/>
        <line x1="220" y1="82" x2="220" y2="112" stroke="#fcd34d" strokeWidth="4" strokeLinecap="round"/>
        <line x1="220" y1="96" x2="228" y2="104" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round"/>
        <line x1="220" y1="104" x2="228" y2="110" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round"/>
      </g>
    </svg>
  )
}
