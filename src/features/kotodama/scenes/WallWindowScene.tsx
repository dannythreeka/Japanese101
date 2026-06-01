import type { CSSProperties } from 'react'

interface Props { success: boolean }

const on = (cond: boolean): CSSProperties => ({
  opacity: cond ? 1 : 0,
  transition: 'opacity 0.8s ease',
})

export default function WallWindowScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      {/* Always: warm beige wall + baseboard */}
      <rect width="320" height="220" fill="#f0e4c0"/>
      <rect y="204" width="320" height="16" fill="#e0d4a8"/>
      <line x1="0" y1="204" x2="320" y2="204" stroke="#c8b888" strokeWidth="1.5"/>

      {/* ── Initial: plain wall ─────────────────────────── */}
      <g style={on(!success)}>
        {/* Subtle wall texture */}
        <g stroke="#e8dab0" strokeWidth="0.8" opacity="0.6">
          <line x1="0"   y1="55"  x2="320" y2="55"/>
          <line x1="0"   y1="110" x2="320" y2="110"/>
          <line x1="0"   y1="165" x2="320" y2="165"/>
          <line x1="80"  y1="0"   x2="80"  y2="204"/>
          <line x1="160" y1="0"   x2="160" y2="204"/>
          <line x1="240" y1="0"   x2="240" y2="204"/>
        </g>
      </g>

      {/* ── Success: window opens ───────────────────────── */}
      <g style={on(success)}>
        {/* Sky through window */}
        <rect x="90" y="60" width="140" height="118" fill="#87ceeb"/>
        {/* Clouds through window */}
        <ellipse cx="130" cy="90"  rx="32" ry="18" fill="white"/>
        <ellipse cx="108" cy="98"  rx="20" ry="14" fill="white"/>
        <ellipse cx="152" cy="98"  rx="18" ry="13" fill="white"/>
        <ellipse cx="200" cy="105" rx="24" ry="14" fill="white" opacity="0.85"/>
        {/* Left panel (opened outward, parallelogram) */}
        <polygon points="90,60 90,178 56,184 64,54" fill="#f8f4e8" stroke="#c8b090" strokeWidth="2"/>
        {/* Right panel */}
        <polygon points="230,60 230,178 264,184 256,54" fill="#f8f4e8" stroke="#c8b090" strokeWidth="2"/>
        {/* Curtain edges */}
        <rect x="83"  y="60" width="14" height="118" rx="7" fill="#f0d0b0" opacity="0.85"/>
        <rect x="223" y="60" width="14" height="118" rx="7" fill="#f0d0b0" opacity="0.85"/>
        {/* Window frame */}
        <rect x="90" y="60" width="140" height="118" fill="none" stroke="#8B7050" strokeWidth="5" rx="3"/>
        {/* Mullion (vertical) */}
        <line x1="160" y1="60"  x2="160" y2="178" stroke="#8B7050" strokeWidth="3"/>
        {/* Rail (horizontal) */}
        <line x1="90"  y1="119" x2="230" y2="119" stroke="#8B7050" strokeWidth="3"/>
        {/* Window sill */}
        <rect x="82" y="176" width="156" height="9" rx="3" fill="#9B8060"/>
      </g>
    </svg>
  )
}
