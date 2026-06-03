import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function KakekkoRunScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#c8c8c8"/>
        <rect x="0" y="172" width="320" height="48" fill="#a8a8a8"/>
        <line x1="0" y1="128" x2="320" y2="128" stroke="#b8b8b8" strokeWidth="3" strokeDasharray="20,12"/>
        <line x1="0" y1="155" x2="320" y2="155" stroke="#b8b8b8" strokeWidth="3" strokeDasharray="20,12"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#e8e8d8"/>
        <rect x="0" y="172" width="320" height="48" fill="#c8c8a8"/>
        <line x1="0" y1="128" x2="320" y2="128" stroke="#a8a898" strokeWidth="2" strokeDasharray="20,12"/>
        <line x1="0" y1="155" x2="320" y2="155" stroke="#a8a898" strokeWidth="2" strokeDasharray="20,12"/>
        {/* finish line tape */}
        <line x1="220" y1="115" x2="220" y2="175" stroke="#dc2626" strokeWidth="6"/>
        <path d="M220,118 Q235,124 250,118 Q265,112 280,118" fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round"/>
        {/* runner 1 */}
        <g transform="translate(155,140)">
          <circle cx="0" cy="-38" r="12" fill="#fbbf24"/>
          <rect x="-8" y="-26" width="16" height="20" fill="#3b82f6" rx="4"/>
          <line x1="-8" y1="-20" x2="-18" y2="-10" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round"/>
          <line x1="8" y1="-20" x2="20" y2="-8" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round"/>
          <line x1="-4" y1="-6" x2="-14" y2="10" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round"/>
          <line x1="4" y1="-6" x2="16" y2="8" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round"/>
        </g>
        {/* runner 2 */}
        <g transform="translate(188,140)">
          <circle cx="0" cy="-38" r="12" fill="#f9a8d4"/>
          <rect x="-8" y="-26" width="16" height="20" fill="#ec4899" rx="4"/>
          <line x1="-8" y1="-20" x2="-20" y2="-8" stroke="#f9a8d4" strokeWidth="5" strokeLinecap="round"/>
          <line x1="8" y1="-20" x2="18" y2="-12" stroke="#f9a8d4" strokeWidth="5" strokeLinecap="round"/>
          <line x1="-4" y1="-6" x2="-16" y2="8" stroke="#f9a8d4" strokeWidth="5" strokeLinecap="round"/>
          <line x1="4" y1="-6" x2="14" y2="10" stroke="#f9a8d4" strokeWidth="5" strokeLinecap="round"/>
        </g>
        {/* speed lines */}
        {[120,130,140,150,160].map((y,i) => <line key={i} x1={80-i*5} y1={y} x2={145} y2={y} stroke="#d4d4c4" strokeWidth="2" strokeLinecap="round"/>)}
      </g>
    </svg>
  )
}
