import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function MatoAppearsScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#87ceeb"/>
        <rect x="0" y="170" width="320" height="50" fill="#7bc97b"/>
        <ellipse cx="80" cy="168" rx="55" ry="18" fill="#5a9a5a"/>
        <ellipse cx="240" cy="172" rx="60" ry="16" fill="#5a9a5a"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#87ceeb"/>
        <rect x="0" y="170" width="320" height="50" fill="#5cb85c"/>
        <ellipse cx="80" cy="168" rx="55" ry="18" fill="#3d8a3d"/>
        <ellipse cx="240" cy="172" rx="60" ry="16" fill="#3d8a3d"/>
        {/* target pole */}
        <rect x="157" y="90" width="6" height="82" fill="#8b6340" rx="2"/>
        {/* target rings */}
        <circle cx="160" cy="90" r="48" fill="#dc2626" stroke="#991b1b" strokeWidth="3"/>
        <circle cx="160" cy="90" r="36" fill="white" stroke="#991b1b" strokeWidth="2"/>
        <circle cx="160" cy="90" r="24" fill="#dc2626" stroke="#991b1b" strokeWidth="2"/>
        <circle cx="160" cy="90" r="12" fill="white" stroke="#991b1b" strokeWidth="2"/>
        <circle cx="160" cy="90" r="6" fill="#dc2626"/>
        {/* arrow */}
        <line x1="80" y1="88" x2="154" y2="90" stroke="#4a3010" strokeWidth="4" strokeLinecap="round"/>
        <polygon points="154,84 168,90 154,96" fill="#4a3010"/>
        <path d="M80,85 Q74,87 74,91 Q74,95 80,93" fill="#cc2200"/>
        {/* sparkle on bullseye */}
        <circle cx="160" cy="90" r="8" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1.5" opacity="0.9"/>
      </g>
    </svg>
  )
}
