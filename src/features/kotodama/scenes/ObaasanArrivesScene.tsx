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
export default function ObaasanArrivesScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#f5f0e8"/>
        <Sofa/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#f5f0e8"/>
        <Sofa/>
        {/* elderly woman with cane */}
        <ellipse cx="160" cy="142" rx="20" ry="26" fill="#7a8a9a" stroke="#6a7a8a" strokeWidth="2"/>
        <circle cx="160" cy="110" r="18" fill="#f5d5b5" stroke="#e0b888" strokeWidth="2"/>
        {/* white hair */}
        <path d="M144,107 Q147,95 160,94 Q173,95 176,107" fill="#e8e8e8" stroke="#d0d0d0" strokeWidth="1.5"/>
        <ellipse cx="148" cy="108" rx="8" ry="10" fill="#e8e8e8" stroke="#d0d0d0" strokeWidth="1.5"/>
        <ellipse cx="172" cy="108" rx="8" ry="10" fill="#e8e8e8" stroke="#d0d0d0" strokeWidth="1.5"/>
        {/* eyes smile */}
        <path d="M153,108 Q157,105 161,108" fill="none" stroke="#3a2010" strokeWidth="2" strokeLinecap="round"/>
        <path d="M159,108 Q163,105 167,108" fill="none" stroke="#3a2010" strokeWidth="2" strokeLinecap="round"/>
        <path d="M155,115 Q160,119 165,115" fill="none" stroke="#c87040" strokeWidth="1.5" strokeLinecap="round"/>
        {/* cane */}
        <path d="M185,138 L192,200" stroke="#8b6340" strokeWidth="5" strokeLinecap="round"/>
        <path d="M192,200 Q196,205 200,200" fill="none" stroke="#8b6340" strokeWidth="4" strokeLinecap="round"/>
        {/* arm with cane */}
        <path d="M176,132 Q182,138 192,140" fill="none" stroke="#7a8a9a" strokeWidth="7" strokeLinecap="round"/>
        {/* other arm */}
        <path d="M144,132 Q130,130 122,120" fill="none" stroke="#7a8a9a" strokeWidth="7" strokeLinecap="round"/>
        <circle cx="122" cy="120" r="9" fill="#f5d5b5" stroke="#e0b888" strokeWidth="2"/>
        {/* legs */}
        <rect x="147" y="166" width="12" height="26" fill="#7a8a9a" rx="4"/>
        <rect x="162" y="166" width="12" height="26" fill="#7a8a9a" rx="4"/>
      </g>
    </svg>
  )
}
