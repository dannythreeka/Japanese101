import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
function Sofa() {
  return (
    <g>
      <rect x="60" y="148" width="200" height="50" fill="#c8a878" rx="8" stroke="#a08858" strokeWidth="3"/>
      <rect x="54" y="138" width="18" height="62" fill="#c8a878" rx="6" stroke="#a08858" strokeWidth="2.5"/>
      <rect x="248" y="138" width="18" height="62" fill="#c8a878" rx="6" stroke="#a08858" strokeWidth="2.5"/>
      <rect x="60" y="138" width="200" height="22" fill="#d4b88a" rx="6" stroke="#a08858" strokeWidth="2"/>
    </g>
  )
}
export default function ObasanArrivesScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#f5f0e8"/>
        <Sofa/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#f5f0e8"/>
        <Sofa/>
        {/* person sitting - younger woman */}
        <ellipse cx="160" cy="138" rx="22" ry="30" fill="#4a6a9a" stroke="#3a5a8a" strokeWidth="2"/>
        <circle cx="160" cy="102" r="20" fill="#f5c5a0" stroke="#e0a870" strokeWidth="2"/>
        <path d="M148,95 Q155,88 168,90 Q175,92 172,98" fill="#5a3a2a" stroke="#4a2a1a" strokeWidth="1.5"/>
        <path d="M148,96 Q142,92 140,98" fill="#5a3a2a" stroke="#4a2a1a" strokeWidth="1.5"/>
        {/* eyes smiling */}
        <path d="M152,101 Q156,98 160,101" fill="none" stroke="#3a2010" strokeWidth="2" strokeLinecap="round"/>
        <path d="M160,101 Q164,98 168,101" fill="none" stroke="#3a2010" strokeWidth="2" strokeLinecap="round"/>
        <path d="M155,108 Q160,112 165,108" fill="none" stroke="#c87040" strokeWidth="1.5" strokeLinecap="round"/>
        {/* wave hand */}
        <path d="M138,130 Q115,125 105,112" fill="none" stroke="#4a6a9a" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="105" cy="112" r="10" fill="#f5c5a0" stroke="#e0a870" strokeWidth="2"/>
        {/* legs */}
        <rect x="145" y="165" width="14" height="28" fill="#4a6a9a" rx="4"/>
        <rect x="161" y="165" width="14" height="28" fill="#4a6a9a" rx="4"/>
      </g>
    </svg>
  )
}
