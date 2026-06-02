import type { CSSProperties } from 'react'

interface Props { success: boolean }

const on = (cond: boolean): CSSProperties => ({
  opacity: cond ? 1 : 0,
  transition: 'opacity 0.8s ease',
})

export default function DayNightMoonScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      {/* ── Initial: daytime ───────────────────────────── */}
      <g style={on(!success)}>
        <rect width="320" height="220" fill="#5bb8f5"/>
        <rect y="100" width="320" height="120" fill="#a8dff8" opacity="0.4"/>
        {/* Green hills */}
        <ellipse cx="80"  cy="220" rx="130" ry="55" fill="#5cc85c"/>
        <ellipse cx="260" cy="226" rx="110" ry="50" fill="#66c866"/>
        {/* Sun */}
        <circle cx="200" cy="68" r="32" fill="#f9d72f"/>
        <g stroke="#f9d72f" strokeWidth="5" strokeLinecap="round">
          <line x1="200" y1="22" x2="200" y2="12"/>
          <line x1="237" y1="31" x2="244" y2="24"/>
          <line x1="248" y1="68" x2="258" y2="68"/>
          <line x1="237" y1="105" x2="244" y2="112"/>
          <line x1="200" y1="116" x2="200" y2="126"/>
          <line x1="163" y1="105" x2="156" y2="112"/>
          <line x1="152" y1="68"  x2="142" y2="68"/>
          <line x1="163" y1="31"  x2="156" y2="24"/>
        </g>
        {/* White clouds */}
        <ellipse cx="75"  cy="88" rx="44" ry="25" fill="white"/>
        <ellipse cx="50"  cy="98" rx="28" ry="20" fill="white"/>
        <ellipse cx="102" cy="98" rx="26" ry="19" fill="white"/>
      </g>

      {/* ── Success: night with moon ───────────────────── */}
      <g style={on(success)}>
        <rect width="320" height="220" fill="#0c1a40"/>
        <rect y="90"  width="320" height="130" fill="#1a2f60" opacity="0.7"/>
        <rect y="165" width="320" height="55"  fill="#2a4888" opacity="0.5"/>
        {/* Dark hills */}
        <ellipse cx="80"  cy="220" rx="130" ry="55" fill="#1a3822"/>
        <ellipse cx="260" cy="226" rx="110" ry="50" fill="#1e3e28"/>
        {/* Moon (crescent) */}
        <circle cx="198" cy="72" r="34" fill="#f5e060"/>
        <circle cx="212" cy="65" r="30" fill="#1e3060"/>
        {/* Moon glow */}
        <circle cx="198" cy="72" r="42" fill="#f5e060" opacity="0.1"/>
        {/* Stars */}
        <g fill="#ffe880">
          <circle cx="36"  cy="32" r="2.5"/>
          <circle cx="60"  cy="52" r="2"/>
          <circle cx="78"  cy="22" r="3"/>
          <circle cx="108" cy="44" r="2.5"/>
          <circle cx="130" cy="28" r="2"/>
          <circle cx="270" cy="40" r="2.5"/>
          <circle cx="288" cy="24" r="3"/>
          <circle cx="306" cy="48" r="2"/>
          <circle cx="50"  cy="76" r="1.8"/>
          <circle cx="90"  cy="66" r="1.8"/>
          <circle cx="280" cy="64" r="1.8"/>
          <circle cx="314" cy="70" r="2"/>
        </g>
        {/* Star twinkles on brightest */}
        <g stroke="#ffe880" strokeWidth="1" fill="none" opacity="0.7">
          <line x1="78" y1="17" x2="78" y2="12"/>
          <line x1="78" y1="27" x2="78" y2="32"/>
          <line x1="73" y1="22" x2="68" y2="22"/>
          <line x1="83" y1="22" x2="88" y2="22"/>
          <line x1="288" y1="19" x2="288" y2="14"/>
          <line x1="288" y1="29" x2="288" y2="34"/>
          <line x1="283" y1="24" x2="278" y2="24"/>
          <line x1="293" y1="24" x2="298" y2="24"/>
        </g>
      </g>
    </svg>
  )
}
