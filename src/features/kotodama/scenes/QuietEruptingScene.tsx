import type { CSSProperties } from 'react'

interface Props { success: boolean }

const on = (cond: boolean): CSSProperties => ({
  opacity: cond ? 1 : 0,
  transition: 'opacity 0.8s ease',
})

export default function QuietEruptingScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      {/* ── Initial: calm mountain ─────────────────────── */}
      <g style={on(!success)}>
        <rect width="320" height="220" fill="#6ac0f0"/>
        <rect y="185" width="320" height="35" fill="#5ab55a"/>
        {/* Mountain */}
        <polygon points="55,186 160,63 265,186" fill="#7a9060"/>
        <polygon points="148,90 160,63 172,90 163,86 160,76 157,86" fill="white"/>
        {/* Clouds */}
        <ellipse cx="258" cy="72" rx="44" ry="24" fill="white"/>
        <ellipse cx="233" cy="82" rx="28" ry="18" fill="white"/>
        <ellipse cx="283" cy="82" rx="26" ry="17" fill="white"/>
        <ellipse cx="62"  cy="90" rx="34" ry="18" fill="white" opacity="0.9"/>
        <ellipse cx="40"  cy="98" rx="22" ry="14" fill="white" opacity="0.9"/>
        <ellipse cx="84"  cy="98" rx="20" ry="13" fill="white" opacity="0.9"/>
      </g>

      {/* ── Success: erupting ──────────────────────────── */}
      <g style={on(success)}>
        {/* Orange sky */}
        <rect width="320" height="220" fill="#e8a040"/>
        <rect y="120" width="320" height="100" fill="#f0c870" opacity="0.7"/>
        <rect y="180" width="320" height="40"  fill="#b8e4f8" opacity="0.5"/>
        <rect y="185" width="320" height="35"  fill="#5ab55a"/>
        {/* Mountain (same) */}
        <polygon points="55,186 160,63 265,186" fill="#7a9060"/>
        <polygon points="148,90 160,63 172,90 163,86 160,76 157,86" fill="white"/>
        {/* Smoke puffs */}
        <ellipse cx="160" cy="48" rx="28" ry="18" fill="#cccccc" opacity="0.9"/>
        <ellipse cx="140" cy="38" rx="18" ry="14" fill="#cccccc" opacity="0.75"/>
        <ellipse cx="180" cy="36" rx="16" ry="13" fill="#dddddd" opacity="0.8"/>
        <ellipse cx="160" cy="26" rx="14" ry="11" fill="#e0e0e0" opacity="0.65"/>
        {/* Lava sparks */}
        <g fill="#ff5500">
          <circle cx="148" cy="65" r="4"/>
          <circle cx="170" cy="58" r="3"/>
          <circle cx="157" cy="54" r="3.5"/>
        </g>
        <g fill="#ff8800">
          <circle cx="140" cy="72" r="3"/>
          <circle cx="178" cy="68" r="2.5"/>
          <circle cx="153" cy="77" r="2"/>
        </g>
        <g fill="#ffcc00">
          <circle cx="134" cy="80" r="2.5"/>
          <circle cx="184" cy="74" r="2"/>
          <circle cx="163" cy="66" r="2"/>
        </g>
      </g>
    </svg>
  )
}
