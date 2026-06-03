import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function NekoWalksScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#f0ebe0"/>
        <rect x="0" y="175" width="320" height="45" fill="#c8b898" rx="4"/>
        <rect x="40" y="80" width="100" height="90" fill="#e8e0d8" stroke="#c8c0b8" strokeWidth="3" rx="6"/>
        <rect x="180" y="90" width="80" height="80" fill="#e8e0d8" stroke="#c8c0b8" strokeWidth="3" rx="6"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#f0ebe0"/>
        <rect x="0" y="175" width="320" height="45" fill="#c8b898" rx="4"/>
        <rect x="40" y="80" width="100" height="90" fill="#e0d8cc" stroke="#c8c0b8" strokeWidth="3" rx="6"/>
        <rect x="180" y="90" width="80" height="80" fill="#e0d8cc" stroke="#c8c0b8" strokeWidth="3" rx="6"/>
        {/* cat body */}
        <ellipse cx="160" cy="158" rx="36" ry="22" fill="#e8a050" stroke="#c87828" strokeWidth="2.5"/>
        {/* head */}
        <circle cx="185" cy="138" r="22" fill="#e8a050" stroke="#c87828" strokeWidth="2.5"/>
        {/* ears */}
        <polygon points="172,120 166,108 178,112" fill="#e8a050" stroke="#c87828" strokeWidth="2"/>
        <polygon points="196,118 202,108 208,116" fill="#e8a050" stroke="#c87828" strokeWidth="2"/>
        <polygon points="173,119 168,111 177,113" fill="#f0b870" opacity="0.6"/>
        <polygon points="197,117 202,111 207,116" fill="#f0b870" opacity="0.6"/>
        {/* eyes closed (satisfied) */}
        <path d="M177,135 Q181,132 185,135" fill="none" stroke="#5a3010" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M185,135 Q189,132 193,135" fill="none" stroke="#5a3010" strokeWidth="2.5" strokeLinecap="round"/>
        {/* nose + mouth */}
        <path d="M185,140 Q182,144 180,143" fill="none" stroke="#c87828" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M185,140 Q188,144 190,143" fill="none" stroke="#c87828" strokeWidth="1.5" strokeLinecap="round"/>
        <ellipse cx="185" cy="139" rx="3" ry="2" fill="#d86090"/>
        {/* whiskers */}
        <line x1="162" y1="140" x2="175" y2="141" stroke="#c87828" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="160" y1="144" x2="174" y2="143" stroke="#c87828" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="196" y1="140" x2="209" y2="141" stroke="#c87828" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="196" y1="144" x2="210" y2="143" stroke="#c87828" strokeWidth="1.5" strokeLinecap="round"/>
        {/* paw lick */}
        <ellipse cx="155" cy="164" rx="14" ry="10" fill="#e8a050" stroke="#c87828" strokeWidth="2"/>
        <path d="M148,170 Q155,175 162,170" fill="none" stroke="#c87828" strokeWidth="2" strokeLinecap="round"/>
        {/* tail */}
        <path d="M124,155 Q100,148 88,158 Q80,168 90,175" fill="none" stroke="#e8a050" strokeWidth="7" strokeLinecap="round"/>
        {/* stripes */}
        <line x1="138" y1="150" x2="145" y2="165" stroke="#c87828" strokeWidth="2" strokeLinecap="round"/>
        <line x1="150" y1="148" x2="155" y2="164" stroke="#c87828" strokeWidth="2" strokeLinecap="round"/>
        <line x1="170" y1="148" x2="172" y2="162" stroke="#c87828" strokeWidth="2" strokeLinecap="round"/>
      </g>
    </svg>
  )
}
