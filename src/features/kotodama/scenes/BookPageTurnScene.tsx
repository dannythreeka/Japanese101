import type { CSSProperties } from 'react'

interface Props { success: boolean }

const on = (cond: boolean): CSSProperties => ({
  opacity: cond ? 1 : 0,
  transition: 'opacity 0.8s ease',
})

export default function BookPageTurnScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      {/* Warm background */}
      <rect width="320" height="220" fill="#f5e8d0"/>
      {/* Table surface */}
      <rect x="0" y="182" width="320" height="38" fill="#c8a060"/>
      <rect x="0" y="182" width="320" height="6"  fill="#b08040"/>

      {/* ── Initial: book with tree on left, text lines on right ── */}
      <g style={on(!success)}>
        {/* Book shadow */}
        <rect x="58" y="72" width="208" height="108" rx="4" fill="#a07830" opacity="0.3"/>
        {/* Book cover/spine */}
        <rect x="55" y="68" width="210" height="112" rx="4" fill="#8B6914"/>
        {/* Left page */}
        <rect x="60" y="72" width="95" height="104" fill="#fffdf5"/>
        {/* Tree on left page */}
        <rect x="101" y="145" width="8" height="20" fill="#8B5014"/>
        <ellipse cx="105" cy="132" rx="20" ry="24" fill="#4a9030"/>
        <ellipse cx="94"  cy="138" rx="12" ry="16" fill="#5aa040"/>
        <ellipse cx="116" cy="138" rx="12" ry="16" fill="#5aa040"/>
        {/* Right page */}
        <rect x="158" y="72" width="103" height="104" fill="#fffdf5"/>
        {/* Text lines */}
        <g stroke="#ddd" strokeWidth="1.5">
          <line x1="168" y1="88"  x2="252" y2="88"/>
          <line x1="168" y1="100" x2="252" y2="100"/>
          <line x1="168" y1="112" x2="252" y2="112"/>
          <line x1="168" y1="124" x2="240" y2="124"/>
          <line x1="168" y1="136" x2="252" y2="136"/>
          <line x1="168" y1="148" x2="236" y2="148"/>
          <line x1="168" y1="160" x2="252" y2="160"/>
        </g>
        {/* Spine line */}
        <line x1="157" y1="72" x2="157" y2="176" stroke="#7a5810" strokeWidth="3"/>
      </g>

      {/* ── Success: new page revealed with bird ─────────── */}
      <g style={on(success)}>
        {/* Book shadow */}
        <rect x="58" y="72" width="208" height="108" rx="4" fill="#a07830" opacity="0.3"/>
        {/* Book cover/spine */}
        <rect x="55" y="68" width="210" height="112" rx="4" fill="#8B6914"/>
        {/* Left page (same) */}
        <rect x="60" y="72" width="95" height="104" fill="#fffdf5"/>
        <rect x="101" y="145" width="8" height="20" fill="#8B5014"/>
        <ellipse cx="105" cy="132" rx="20" ry="24" fill="#4a9030"/>
        <ellipse cx="94"  cy="138" rx="12" ry="16" fill="#5aa040"/>
        <ellipse cx="116" cy="138" rx="12" ry="16" fill="#5aa040"/>
        {/* New right page */}
        <rect x="158" y="72" width="103" height="104" fill="#fffff8"/>
        {/* Turning page corner effect */}
        <polygon points="261,176 241,176 261,156" fill="#e8e0d0"/>
        <line x1="241" y1="176" x2="261" y2="156" stroke="#ccc" strokeWidth="1"/>
        {/* Bird on new page */}
        <ellipse cx="207" cy="128" rx="18" ry="12" fill="#4a7ab5"/>
        <ellipse cx="222" cy="120" rx="10" ry="9"  fill="#4a7ab5"/>
        <polygon points="232,117 242,120 232,123" fill="#f0b030"/>
        <circle cx="224" cy="118" r="3" fill="#222"/>
        <circle cx="223" cy="117" r="1.2" fill="white"/>
        <ellipse cx="197" cy="133" rx="14" ry="8" fill="#5888c4" transform="rotate(-15 197 133)"/>
        <polygon points="190,127 180,122 184,134" fill="#4a7ab5"/>
        <line x1="207" y1="140" x2="202" y2="152" stroke="#4a7ab5" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="217" y1="140" x2="220" y2="152" stroke="#4a7ab5" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Spine line */}
        <line x1="157" y1="72" x2="157" y2="176" stroke="#7a5810" strokeWidth="3"/>
      </g>
    </svg>
  )
}
