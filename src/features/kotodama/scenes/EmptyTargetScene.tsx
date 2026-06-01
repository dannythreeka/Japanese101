import type { CSSProperties } from 'react'

interface Props { success: boolean }

const on = (cond: boolean): CSSProperties => ({
  opacity: cond ? 1 : 0,
  transition: 'opacity 0.8s ease',
})

export default function EmptyTargetScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      {/* Always: sky + ground */}
      <rect width="320" height="220" fill="#5bb8f5"/>
      <rect y="160" width="320" height="60" fill="#5cc85c"/>
      {/* Horizon fade */}
      <rect y="140" width="320" height="22" fill="#a8dff8" opacity="0.4"/>
      {/* Distant hills */}
      <ellipse cx="80"  cy="165" rx="100" ry="30" fill="#66c866"/>
      <ellipse cx="260" cy="168" rx="90"  ry="28" fill="#5cc85c"/>
      {/* Small tree */}
      <rect x="36" y="133" width="7"  height="25" fill="#8B5014"/>
      <ellipse cx="39" cy="122" rx="18" ry="20" fill="#4a9030"/>
      {/* Clouds */}
      <ellipse cx="96"  cy="52" rx="50" ry="26" fill="white"/>
      <ellipse cx="68"  cy="62" rx="32" ry="20" fill="white"/>
      <ellipse cx="128" cy="62" rx="30" ry="19" fill="white"/>
      <ellipse cx="248" cy="68" rx="38" ry="20" fill="white" opacity="0.9"/>
      <ellipse cx="224" cy="77" rx="24" ry="15" fill="white" opacity="0.9"/>
      <ellipse cx="272" cy="77" rx="22" ry="14" fill="white" opacity="0.9"/>

      {/* ── Initial: empty field ────────────────────────── */}
      <g style={on(!success)}>
        {/* Grass tufts */}
        <g fill="#3a8a30">
          <polygon points="160,162 156,150 164,150"/>
          <polygon points="200,160 196,149 204,149"/>
          <polygon points="140,165 136,154 144,154"/>
          <polygon points="220,163 216,152 224,152"/>
        </g>
      </g>

      {/* ── Success: target appears ─────────────────────── */}
      <g style={on(success)}>
        {/* Wooden post */}
        <rect x="157" y="115" width="10" height="48" rx="3" fill="#c88c40"/>
        <rect x="157" y="110" width="10" height="8"  rx="2" fill="#b07830"/>
        {/* Bullseye target (concentric circles) */}
        <circle cx="162" cy="98"  r="52" fill="#e82020"/>
        <circle cx="162" cy="98"  r="39" fill="white"/>
        <circle cx="162" cy="98"  r="26" fill="#e82020"/>
        <circle cx="162" cy="98"  r="13" fill="white"/>
        <circle cx="162" cy="98"  r="6"  fill="#e82020"/>
        {/* Arrow shaft */}
        <line x1="280" y1="52" x2="170" y2="95" stroke="#c8882a" strokeWidth="4" strokeLinecap="round"/>
        {/* Arrow head */}
        <polygon points="170,95 160,88 162,100" fill="#c8882a"/>
        {/* Arrow feathers */}
        <polygon points="276,54 282,44 288,56" fill="#e05830"/>
        <polygon points="276,54 270,46 280,46" fill="#e8704a"/>
      </g>
    </svg>
  )
}
