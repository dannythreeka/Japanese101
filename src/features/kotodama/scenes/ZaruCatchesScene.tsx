import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function ZaruCatchesScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#f5f0e8"/>
        <rect x="0" y="155" width="320" height="65" fill="#e8dcc8" rx="4"/>
        <rect x="30" y="148" width="260" height="16" fill="#d4c4a0" rx="4" stroke="#b8a880" strokeWidth="2"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#f5f0e8"/>
        <rect x="0" y="155" width="320" height="65" fill="#e8dcc8" rx="4"/>
        {/* sieve */}
        <ellipse cx="160" cy="148" rx="70" ry="18" fill="#c8a060" stroke="#a08040" strokeWidth="3"/>
        <ellipse cx="160" cy="148" rx="65" ry="15" fill="#d4aa6a"/>
        {/* weave pattern */}
        {[110,125,140,155,170,185,200,215].map(x => <line key={x} x1={x} y1="134" x2={x-4} y2="162" stroke="#a08040" strokeWidth="1"/>)}
        {[136,140,144,148,152,156,160].map(y => <line key={y} x1="96" y1={y} x2="224" y2={y} stroke="#a08040" strokeWidth="1"/>)}
        {/* handle */}
        <line x1="160" y1="148" x2="160" y2="105" stroke="#8b6340" strokeWidth="8" strokeLinecap="round"/>
        {/* vegetables */}
        <ellipse cx="135" cy="143" rx="12" ry="9" fill="#f97316" stroke="#ea580c" strokeWidth="2"/>
        <ellipse cx="165" cy="141" rx="10" ry="8" fill="#22c55e" stroke="#15803d" strokeWidth="2"/>
        <ellipse cx="188" cy="144" rx="11" ry="8" fill="#f97316" stroke="#ea580c" strokeWidth="2"/>
        {/* falling carrot */}
        <ellipse cx="160" cy="80" rx="8" ry="14" fill="#f97316" stroke="#ea580c" strokeWidth="2" transform="rotate(15 160 80)"/>
        <path d="M160,66 Q165,58 170,62" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}
