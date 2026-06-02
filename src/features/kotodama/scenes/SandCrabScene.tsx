import type { CSSProperties } from 'react'

interface Props { success: boolean }

const on = (cond: boolean): CSSProperties => ({
  opacity: cond ? 1 : 0,
  transition: 'opacity 0.8s ease',
})

export default function SandCrabScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      {/* Always: sky + ocean + sand */}
      <rect width="320" height="220" fill="#5bb8f5"/>
      {/* Ocean strip */}
      <rect y="148" width="320" height="22" fill="#3a90d8" opacity="0.8"/>
      <rect y="160" width="320" height="10" fill="#5aaae8" opacity="0.6"/>
      {/* Sand */}
      <rect y="165" width="320" height="55" fill="#e8d49c"/>
      {/* Sand ripple lines */}
      <g stroke="#d4bc88" strokeWidth="1.2" strokeLinecap="round" opacity="0.65">
        <path d="M10,182 Q80,177 150,182 Q220,187 290,182 Q308,180 318,183" fill="none"/>
        <path d="M8,198 Q80,192 150,198 Q220,204 290,198 Q308,195 318,199" fill="none"/>
      </g>
      {/* Ocean wave foam */}
      <path d="M0,156 Q40,151 80,156 Q120,161 160,156 Q200,151 240,156 Q280,161 320,156" fill="none" stroke="white" strokeWidth="2.5" opacity="0.6"/>
      {/* Clouds */}
      <ellipse cx="96"  cy="55" rx="46" ry="25" fill="white"/>
      <ellipse cx="70"  cy="65" rx="30" ry="20" fill="white"/>
      <ellipse cx="126" cy="65" rx="28" ry="19" fill="white"/>
      {/* Sun */}
      <circle cx="272" cy="42" r="24" fill="#f9d72f"/>

      {/* Shells (always visible) */}
      <ellipse cx="82"  cy="190" rx="12" ry="8" fill="#e8c890" stroke="#c0a060" strokeWidth="1.5" transform="rotate(-15 82 190)"/>
      <path d="M78,188 Q84,186 89,190 Q85,194 80,192" fill="none" stroke="#c0a060" strokeWidth="1" opacity="0.65"/>
      <ellipse cx="240" cy="206" rx="9"  ry="6" fill="#f0c870" stroke="#c0a060" strokeWidth="1.5" transform="rotate(20 240 206)"/>

      {/* ── Initial: quiet beach ────────────────────────── */}
      <g style={on(!success)}>
        <ellipse cx="175" cy="202" rx="20" ry="6" fill="#dfc88a" opacity="0.6"/>
        <polygon points="152,182 144,202 160,202" fill="#d4a878" stroke="#b88848" strokeWidth="1.5"/>
        <line x1="152" y1="182" x2="152" y2="202" stroke="#b88848" strokeWidth="1" opacity="0.5"/>
      </g>

      {/* ── Success: crab emerges ───────────────────────── */}
      <g style={on(success)}>
        {/* Sand disturbance / hole */}
        <ellipse cx="160" cy="183" rx="26" ry="10" fill="#b89860" opacity="0.8"/>
        <ellipse cx="160" cy="183" rx="18" ry="7"  fill="#a07848" opacity="0.6"/>
        {/* Sand particles flying up */}
        <g fill="#d4b878" opacity="0.8">
          <circle cx="140" cy="170" r="3"/>
          <circle cx="146" cy="162" r="2"/>
          <circle cx="178" cy="168" r="3"/>
          <circle cx="173" cy="160" r="2.2"/>
          <circle cx="155" cy="155" r="2.5"/>
          <circle cx="132" cy="175" r="2"/>
          <circle cx="186" cy="174" r="2.2"/>
        </g>
        {/* Crab body */}
        <ellipse cx="160" cy="163" rx="30" ry="20" fill="#e83820"/>
        {/* Shell dome highlight */}
        <ellipse cx="160" cy="160" rx="20" ry="13" fill="#c84020" opacity="0.45"/>
        {/* Eye stalks */}
        <line x1="150" y1="147" x2="146" y2="137" stroke="#c84020" strokeWidth="3" strokeLinecap="round"/>
        <line x1="170" y1="147" x2="174" y2="137" stroke="#c84020" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="146" cy="135" r="5" fill="#1a1a1a"/>
        <circle cx="174" cy="135" r="5" fill="#1a1a1a"/>
        <circle cx="145" cy="134" r="2" fill="white"/>
        <circle cx="173" cy="134" r="2" fill="white"/>
        {/* Smile */}
        <path d="M152,169 Q160,175 168,169" fill="none" stroke="#a83018" strokeWidth="2" strokeLinecap="round"/>
        {/* Left claw (raised) */}
        <path d="M132,158 Q114,142 106,130" stroke="#c84020" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <ellipse cx="102" cy="127" rx="11" ry="8" fill="#e05030" transform="rotate(-30 102 127)"/>
        <path d="M95,122 Q102,118 107,124" fill="none" stroke="#c82810" strokeWidth="3" strokeLinecap="round"/>
        {/* Right claw (raised) */}
        <path d="M188,158 Q206,142 214,130" stroke="#c84020" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <ellipse cx="218" cy="127" rx="11" ry="8" fill="#e05030" transform="rotate(30 218 127)"/>
        <path d="M225,122 Q218,118 213,124" fill="none" stroke="#c82810" strokeWidth="3" strokeLinecap="round"/>
        {/* Walking legs */}
        <g stroke="#d03018" strokeWidth="3" strokeLinecap="round">
          <line x1="143" y1="175" x2="128" y2="188"/>
          <line x1="138" y1="180" x2="124" y2="195"/>
          <line x1="145" y1="183" x2="132" y2="198"/>
          <line x1="177" y1="175" x2="192" y2="188"/>
          <line x1="182" y1="180" x2="196" y2="195"/>
          <line x1="175" y1="183" x2="188" y2="198"/>
        </g>
      </g>
    </svg>
  )
}
