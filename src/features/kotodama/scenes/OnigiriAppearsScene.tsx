import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.8s ease' })
export default function OnigiriAppearsScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#f5f0e8"/>
        <rect x="0" y="155" width="320" height="65" fill="#d2c4a8" rx="4"/>
        <ellipse cx="160" cy="158" rx="75" ry="22" fill="#c4b69a" stroke="#b0a080" strokeWidth="3"/>
        <ellipse cx="160" cy="150" rx="70" ry="10" fill="#e8dcc8"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#f5f0e8"/>
        <rect x="0" y="155" width="320" height="65" fill="#d2c4a8" rx="4"/>
        <ellipse cx="160" cy="158" rx="75" ry="22" fill="#c4b69a" stroke="#b0a080" strokeWidth="3"/>
        {/* glow */}
        <ellipse cx="160" cy="150" rx="72" ry="18" fill="#fffde7" opacity="0.7"/>
        {/* onigiri triangle */}
        <path d="M160,75 L105,162 L215,162 Z" fill="white" stroke="#e0e0e0" strokeWidth="3"/>
        {/* nori band */}
        <rect x="108" y="140" width="104" height="26" fill="#2d2d2d" rx="4"/>
        {/* nori texture lines */}
        <line x1="120" y1="140" x2="120" y2="166" stroke="#1a1a1a" strokeWidth="1"/>
        <line x1="135" y1="140" x2="135" y2="166" stroke="#1a1a1a" strokeWidth="1"/>
        <line x1="150" y1="140" x2="150" y2="166" stroke="#1a1a1a" strokeWidth="1"/>
        <line x1="165" y1="140" x2="165" y2="166" stroke="#1a1a1a" strokeWidth="1"/>
        <line x1="180" y1="140" x2="180" y2="166" stroke="#1a1a1a" strokeWidth="1"/>
        <line x1="195" y1="140" x2="195" y2="166" stroke="#1a1a1a" strokeWidth="1"/>
        {/* shine */}
        <path d="M138,90 Q148,82 155,88" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        {/* sparkles */}
        <text x="92" y="105" fontSize="18" fill="#fbbf24">✦</text>
        <text x="218" y="110" fontSize="14" fill="#fbbf24">✦</text>
      </g>
    </svg>
  )
}
