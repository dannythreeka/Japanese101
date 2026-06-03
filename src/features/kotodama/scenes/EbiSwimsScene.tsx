import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 1s ease' })
export default function EbiSwimsScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#7a9ab0"/>
        <ellipse cx="80" cy="185" rx="50" ry="20" fill="#5a7a6a" stroke="#3a5a4a" strokeWidth="2"/>
        <ellipse cx="230" cy="190" rx="40" ry="15" fill="#4a6a5a" stroke="#3a5a4a" strokeWidth="2"/>
        {[60,120,180,240,300].map(x => <rect key={x} x={x-4} y="190" width="8" height="30" fill="#8a7a6a" rx="2"/>)}
        <ellipse cx="130" cy="175" rx="18" ry="12" fill="#6a8a7a" stroke="#4a6a5a" strokeWidth="2"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#4a9ec0"/>
        {[30,80,130,180,230,280].map((y,i) => <ellipse key={i} cx={50+i*20} cy={y} rx="6" ry="6" fill="white" opacity="0.3"/>)}
        <ellipse cx="80" cy="185" rx="50" ry="20" fill="#3a6a5a" stroke="#2a4a3a" strokeWidth="2"/>
        <ellipse cx="230" cy="190" rx="40" ry="15" fill="#3a5a4a" stroke="#2a4a3a" strokeWidth="2"/>
        {[60,120,180,240,300].map(x => <rect key={x} x={x-4} y="190" width="8" height="30" fill="#7a6a5a" rx="2"/>)}
        {/* shrimp body */}
        <path d="M140,130 Q165,110 185,120 Q200,128 195,145 Q188,160 170,162 Q150,162 140,148 Z" fill="#e53935" stroke="#b71c1c" strokeWidth="2.5"/>
        {/* segments */}
        {[148,156,164].map((y,i) => <path key={i} d={`M${145+i*8},${y} Q${175+i*4},${y-5} ${190-i*3},${y}`} fill="none" stroke="#b71c1c" strokeWidth="1.5"/>)}
        {/* head */}
        <ellipse cx="188" cy="125" rx="14" ry="12" fill="#e53935" stroke="#b71c1c" strokeWidth="2"/>
        {/* eye */}
        <circle cx="195" cy="120" r="4" fill="#212121"/>
        <circle cx="196" cy="119" r="1.5" fill="white"/>
        {/* antennae */}
        <line x1="195" y1="116" x2="212" y2="100" stroke="#e53935" strokeWidth="2" strokeLinecap="round"/>
        <line x1="197" y1="113" x2="218" y2="102" stroke="#e53935" strokeWidth="1.5" strokeLinecap="round"/>
        {/* tail fan */}
        <path d="M140,148 Q125,155 118,168" fill="none" stroke="#e53935" strokeWidth="3" strokeLinecap="round"/>
        <path d="M140,148 Q128,162 126,175" fill="none" stroke="#c62828" strokeWidth="3" strokeLinecap="round"/>
        <path d="M140,148 Q134,165 136,180" fill="none" stroke="#e53935" strokeWidth="3" strokeLinecap="round"/>
        {/* bubbles */}
        <circle cx="210" cy="108" r="4" fill="none" stroke="white" strokeWidth="1.5"/>
        <circle cx="220" cy="96" r="3" fill="none" stroke="white" strokeWidth="1.5"/>
        <circle cx="205" cy="90" r="2" fill="none" stroke="white" strokeWidth="1"/>
      </g>
    </svg>
  )
}
