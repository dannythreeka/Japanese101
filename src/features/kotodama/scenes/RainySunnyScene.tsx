import type { CSSProperties } from 'react'

interface Props { success: boolean }

const on = (cond: boolean): CSSProperties => ({
  opacity: cond ? 1 : 0,
  transition: 'opacity 0.8s ease',
})

export default function RainySunnyScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      {/* ── Initial: rainy day ─────────────────────────── */}
      <g style={on(!success)}>
        <rect width="320" height="220" fill="#9bb5c8"/>
        <rect x="0" y="178" width="320" height="42" fill="#72b472"/>
        {/* Dark clouds */}
        <ellipse cx="95" cy="55" rx="55" ry="30" fill="#8c9fae"/>
        <ellipse cx="65" cy="67" rx="36" ry="24" fill="#8c9fae"/>
        <ellipse cx="130" cy="66" rx="32" ry="23" fill="#8c9fae"/>
        <ellipse cx="238" cy="71" rx="46" ry="25" fill="#96a8b6"/>
        <ellipse cx="207" cy="81" rx="30" ry="19" fill="#96a8b6"/>
        <ellipse cx="268" cy="80" rx="26" ry="18" fill="#96a8b6"/>
        {/* Rain */}
        <g stroke="#7ab0cc" strokeWidth="2.5" strokeLinecap="round">
          <line x1="30"  y1="100" x2="24"  y2="124"/>
          <line x1="58"  y1="94"  x2="52"  y2="118"/>
          <line x1="86"  y1="102" x2="80"  y2="126"/>
          <line x1="114" y1="96"  x2="108" y2="120"/>
          <line x1="142" y1="101" x2="136" y2="125"/>
          <line x1="170" y1="94"  x2="164" y2="118"/>
          <line x1="198" y1="103" x2="192" y2="127"/>
          <line x1="226" y1="108" x2="220" y2="132"/>
          <line x1="254" y1="99"  x2="248" y2="123"/>
          <line x1="44"  y1="128" x2="38"  y2="152"/>
          <line x1="100" y1="126" x2="94"  y2="150"/>
          <line x1="156" y1="122" x2="150" y2="146"/>
          <line x1="212" y1="128" x2="206" y2="152"/>
          <line x1="270" y1="122" x2="264" y2="146"/>
        </g>
        {/* Open umbrella */}
        <path d="M105,162 Q160,122 215,162" fill="#e05858" stroke="#c03030" strokeWidth="2.5"/>
        <path d="M105,162 Q160,154 215,162" fill="#e05858"/>
        <g stroke="#b82828" strokeWidth="1.5">
          <line x1="160" y1="126" x2="105" y2="162"/>
          <line x1="160" y1="126" x2="215" y2="162"/>
          <line x1="160" y1="126" x2="160" y2="162"/>
          <line x1="160" y1="126" x2="132" y2="159"/>
          <line x1="160" y1="126" x2="188" y2="159"/>
        </g>
        <line x1="160" y1="162" x2="160" y2="196" stroke="#7a4810" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M160,196 Q160,208 148,208" fill="none" stroke="#7a4810" strokeWidth="3.5" strokeLinecap="round"/>
        {/* Puddle */}
        <ellipse cx="220" cy="186" rx="26" ry="7" fill="#8abcda" opacity="0.65"/>
      </g>

      {/* ── Success: sunny day ─────────────────────────── */}
      <g style={on(success)}>
        <rect width="320" height="220" fill="#5bb8f5"/>
        <rect x="0" y="178" width="320" height="42" fill="#5cc85c"/>
        {/* Bright sky gradient overlay */}
        <rect x="0" y="100" width="320" height="78" fill="#a8dff8" opacity="0.45"/>
        {/* Sun */}
        <circle cx="258" cy="58" r="28" fill="#f9d72f"/>
        <g stroke="#f9d72f" strokeWidth="4" strokeLinecap="round">
          <line x1="258" y1="16" x2="258" y2="8"/>
          <line x1="282" y1="23" x2="289" y2="16"/>
          <line x1="290" y1="47" x2="298" y2="47"/>
          <line x1="282" y1="71" x2="289" y2="78"/>
          <line x1="258" y1="82" x2="258" y2="90"/>
          <line x1="234" y1="71" x2="227" y2="78"/>
          <line x1="226" y1="47" x2="218" y2="47"/>
          <line x1="234" y1="23" x2="227" y2="16"/>
        </g>
        {/* White clouds */}
        <ellipse cx="88"  cy="65" rx="50" ry="28" fill="white"/>
        <ellipse cx="58"  cy="76" rx="32" ry="22" fill="white"/>
        <ellipse cx="120" cy="76" rx="30" ry="21" fill="white"/>
        {/* Closed umbrella leaning */}
        <g transform="rotate(-22 215 190)">
          <ellipse cx="215" cy="163" rx="9" ry="28" fill="#e05858"/>
          <line x1="215" y1="189" x2="215" y2="205" stroke="#7a4810" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M215,205 Q215,215 205,215" fill="none" stroke="#7a4810" strokeWidth="3.5" strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  )
}
