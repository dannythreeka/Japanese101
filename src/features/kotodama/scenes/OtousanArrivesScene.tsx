import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function OtousanArrivesScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#f0ece4"/>
        {/* door area */}
        <rect x="0" y="0" width="320" height="220" fill="#e8e4da"/>
        <rect x="110" y="30" width="100" height="190" fill="#c8b898" rx="4" stroke="#a89870" strokeWidth="4"/>
        <rect x="136" y="55" width="32" height="55" fill="#bdb0a0" rx="3"/>
        <rect x="150" y="78" width="4" height="16" fill="#a09080" rx="2"/>
        <circle cx="183" cy="108" r="5" fill="#c8a860" stroke="#a88840" strokeWidth="1.5"/>
        <rect x="0" y="195" width="320" height="25" fill="#d0c8b0"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#f0ece4"/>
        <rect x="0" y="0" width="320" height="220" fill="#e8e4da"/>
        {/* door open */}
        <rect x="110" y="30" width="100" height="190" fill="#c8b898" rx="4" stroke="#a89870" strokeWidth="4" transform="skewY(-2) translate(-30,0)"/>
        <rect x="0" y="195" width="320" height="25" fill="#d0c8b0"/>
        {/* dad figure */}
        <ellipse cx="195" cy="140" rx="22" ry="30" fill="#2a3a5a" stroke="#1a2a4a" strokeWidth="2"/>
        <circle cx="195" cy="106" r="19" fill="#f0c090" stroke="#d8a070" strokeWidth="2"/>
        <path d="M180,100 Q185,90 195,90 Q205,90 210,100" fill="#2a1a0a" stroke="#1a0a00" strokeWidth="1.5"/>
        {/* tie */}
        <path d="M190,124 Q195,118 200,124 L198,148 Q195,152 192,148 Z" fill="#dc2626" stroke="#b91c1c" strokeWidth="1.5"/>
        {/* eyes smile */}
        <path d="M187,104 Q191,101 195,104" fill="none" stroke="#3a2010" strokeWidth="2" strokeLinecap="round"/>
        <path d="M195,104 Q199,101 203,104" fill="none" stroke="#3a2010" strokeWidth="2" strokeLinecap="round"/>
        <path d="M189,112 Q195,116 201,112" fill="none" stroke="#c87040" strokeWidth="1.5" strokeLinecap="round"/>
        {/* wave hand */}
        <path d="M173,132 Q155,128 142,118" fill="none" stroke="#2a3a5a" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="142" cy="118" r="10" fill="#f0c090" stroke="#d8a070" strokeWidth="2"/>
        {/* briefcase arm */}
        <path d="M217,132 Q232,132 240,145" fill="none" stroke="#2a3a5a" strokeWidth="7" strokeLinecap="round"/>
        <rect x="232" y="143" width="26" height="22" fill="#4a3010" rx="4" stroke="#3a2000" strokeWidth="2"/>
        <path d="M238,143 Q238,135 245,135 Q252,135 252,143" fill="none" stroke="#4a3010" strokeWidth="3"/>
        <line x1="245" y1="143" x2="245" y2="165" stroke="#5a4020" strokeWidth="2"/>
        {/* legs */}
        <rect x="183" y="168" width="12" height="30" fill="#2a3a5a" rx="4"/>
        <rect x="200" y="168" width="12" height="30" fill="#2a3a5a" rx="4"/>
      </g>
    </svg>
  )
}
