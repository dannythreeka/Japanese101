import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function SaruSwingsScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#a8d5a2"/>
        <rect x="0" y="175" width="320" height="45" fill="#5a8a5a"/>
        {[40,130,210,290].map(x => <ellipse key={x} cx={x} cy="170" rx="35" ry="60" fill="#3d7a3d" stroke="#2d6a2d" strokeWidth="2"/>)}
        <line x1="60" y1="0" x2="80" y2="100" stroke="#6b4320" strokeWidth="4"/>
        <line x1="240" y1="0" x2="230" y2="100" stroke="#6b4320" strokeWidth="4"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#7ec87e"/>
        <rect x="0" y="175" width="320" height="45" fill="#4caf50"/>
        {[40,130,210,290].map(x => <ellipse key={x} cx={x} cy="170" rx="35" ry="60" fill="#2e7d32" stroke="#1b5e20" strokeWidth="2"/>)}
        {/* vines */}
        <path d="M60,0 Q80,30 90,80 Q95,120 90,155" fill="none" stroke="#4a7a1a" strokeWidth="5" strokeLinecap="round"/>
        <path d="M240,0 Q225,30 220,80 Q215,120 225,155" fill="none" stroke="#4a7a1a" strokeWidth="5" strokeLinecap="round"/>
        {/* monkey body */}
        <ellipse cx="160" cy="140" rx="22" ry="18" fill="#c8874a" stroke="#a06030" strokeWidth="2.5"/>
        {/* head */}
        <circle cx="160" cy="115" r="18" fill="#c8874a" stroke="#a06030" strokeWidth="2.5"/>
        <ellipse cx="160" cy="120" rx="11" ry="9" fill="#f0b87a"/>
        {/* ears */}
        <circle cx="142" cy="112" r="7" fill="#c8874a" stroke="#a06030" strokeWidth="2"/>
        <circle cx="178" cy="112" r="7" fill="#c8874a" stroke="#a06030" strokeWidth="2"/>
        {/* eyes */}
        <circle cx="154" cy="110" r="3.5" fill="#2a1a0a"/>
        <circle cx="166" cy="110" r="3.5" fill="#2a1a0a"/>
        <circle cx="155" cy="109" r="1.2" fill="white"/>
        <circle cx="167" cy="109" r="1.2" fill="white"/>
        {/* smile wave */}
        <path d="M152,120 Q160,126 168,120" fill="none" stroke="#8a5020" strokeWidth="2" strokeLinecap="round"/>
        {/* arms holding vine */}
        <path d="M138,133 Q110,118 95,100" fill="none" stroke="#c8874a" strokeWidth="6" strokeLinecap="round"/>
        <path d="M182,133 Q200,120 215,105" fill="none" stroke="#c8874a" strokeWidth="6" strokeLinecap="round"/>
        {/* wave hand */}
        <circle cx="95" cy="100" r="9" fill="#c8874a" stroke="#a06030" strokeWidth="2"/>
        <circle cx="215" cy="105" r="9" fill="#c8874a" stroke="#a06030" strokeWidth="2"/>
      </g>
    </svg>
  )
}
