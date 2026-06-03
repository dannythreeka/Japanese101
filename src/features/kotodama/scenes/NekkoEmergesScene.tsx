import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function NekkoEmergesScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#87ceeb"/>
        <rect x="0" y="140" width="320" height="80" fill="#a08060" rx="4"/>
        <rect x="135" y="30" width="50" height="115" fill="#8b6340" rx="8"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#87ceeb"/>
        <rect x="0" y="140" width="320" height="80" fill="#a08060" rx="4"/>
        <rect x="135" y="30" width="50" height="115" fill="#6b4320" rx="8"/>
        {/* ground crack */}
        <path d="M130,140 Q150,130 160,140 Q170,150 190,140" fill="none" stroke="#7a5030" strokeWidth="4" strokeLinecap="round"/>
        <path d="M100,145 Q120,135 140,140" fill="none" stroke="#7a5030" strokeWidth="3" strokeLinecap="round"/>
        <path d="M180,140 Q200,135 220,145" fill="none" stroke="#7a5030" strokeWidth="3" strokeLinecap="round"/>
        {/* roots */}
        <path d="M155,140 Q130,155 100,160 Q70,163 50,175" fill="none" stroke="#5a3820" strokeWidth="8" strokeLinecap="round"/>
        <path d="M160,145 Q160,165 155,185" fill="none" stroke="#5a3820" strokeWidth="7" strokeLinecap="round"/>
        <path d="M165,140 Q190,155 220,158 Q250,160 270,175" fill="none" stroke="#5a3820" strokeWidth="8" strokeLinecap="round"/>
        <path d="M140,148 Q110,165 90,185" fill="none" stroke="#6b4320" strokeWidth="5" strokeLinecap="round"/>
        <path d="M178,148 Q205,163 225,183" fill="none" stroke="#6b4320" strokeWidth="5" strokeLinecap="round"/>
        {/* root texture bumps */}
        <circle cx="105" cy="158" r="6" fill="#5a3820"/>
        <circle cx="220" cy="157" r="6" fill="#5a3820"/>
        <circle cx="155" cy="175" r="5" fill="#5a3820"/>
      </g>
    </svg>
  )
}
