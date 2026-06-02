import type { CSSProperties } from 'react'

interface Props { success: boolean }

const on = (cond: boolean): CSSProperties => ({
  opacity: cond ? 1 : 0,
  transition: 'opacity 0.8s ease',
})

export default function ScrollPaperScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      {/* Always: table surface */}
      <rect width="320" height="220" fill="#d4c4a0"/>
      {/* Table top edge */}
      <rect y="108" width="320" height="112" fill="#c8b488"/>
      <rect y="108" width="320" height="8"   fill="#a09060"/>
      {/* Wood grain lines */}
      <g stroke="#b8a070" strokeWidth="1.2" opacity="0.5">
        <line x1="0" y1="125" x2="320" y2="125"/>
        <line x1="0" y1="148" x2="320" y2="148"/>
        <line x1="0" y1="171" x2="320" y2="171"/>
        <line x1="0" y1="194" x2="320" y2="194"/>
        <line x1="40"  y1="108" x2="50"  y2="220"/>
        <line x1="120" y1="108" x2="128" y2="220"/>
        <line x1="200" y1="108" x2="206" y2="220"/>
        <line x1="280" y1="108" x2="284" y2="220"/>
      </g>
      {/* Wall/background behind table */}
      <rect y="0" width="320" height="108" fill="#e8dcc8"/>

      {/* ── Initial: rolled scroll on table ────────────── */}
      <g style={on(!success)}>
        {/* Scroll body (cylinder) */}
        <rect x="70" y="122" width="180" height="52" rx="26" fill="#c8902a"/>
        {/* Cylinder top highlight */}
        <ellipse cx="160" cy="122" rx="90" ry="18" fill="#d8a040"/>
        {/* Cylinder bottom shadow */}
        <ellipse cx="160" cy="174" rx="90" ry="16" fill="#b07820" opacity="0.7"/>
        {/* Scroll end caps */}
        <ellipse cx="70"  cy="148" rx="18" ry="26" fill="#d8a040"/>
        <ellipse cx="250" cy="148" rx="18" ry="26" fill="#d8a040"/>
        <ellipse cx="70"  cy="148" rx="12" ry="18" fill="#c89030" opacity="0.6"/>
        <ellipse cx="250" cy="148" rx="12" ry="18" fill="#c89030" opacity="0.6"/>
        {/* Ribbon band */}
        <rect x="152" y="122" width="16" height="52" fill="#e04030" opacity="0.8"/>
        {/* Shadow under scroll */}
        <ellipse cx="160" cy="180" rx="100" ry="10" fill="#a08050" opacity="0.3"/>
      </g>

      {/* ── Success: unrolled paper with ink marks ──────── */}
      <g style={on(success)}>
        {/* Unrolled paper */}
        <rect x="28" y="118" width="264" height="74" rx="4" fill="white"/>
        {/* Paper shadow */}
        <rect x="28" y="186" width="264" height="6" rx="3" fill="#a09060" opacity="0.25"/>
        {/* Scroll curl at left end */}
        <ellipse cx="28"  cy="155" rx="14" ry="37" fill="#f4f0e4"/>
        <ellipse cx="28"  cy="155" rx="8"  ry="28" fill="#e8e0c8" opacity="0.7"/>
        {/* Scroll curl at right end */}
        <ellipse cx="292" cy="155" rx="14" ry="37" fill="#f4f0e4"/>
        <ellipse cx="292" cy="155" rx="8"  ry="28" fill="#e8e0c8" opacity="0.7"/>
        {/* Ink brushstrokes on paper */}
        <path d="M70,138 Q120,132 170,140 Q210,147 250,138" fill="none" stroke="#1a1a2e" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M80,155 Q140,148 200,156 Q230,160 252,154" fill="none" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M90,170 Q150,164 210,172" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round"/>
        {/* Small ink dot accent */}
        <circle cx="105" cy="145" r="4" fill="#1a1a2e" opacity="0.7"/>
        <circle cx="220" cy="148" r="3" fill="#1a1a2e" opacity="0.6"/>
      </g>
    </svg>
  )
}
