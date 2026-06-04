import type { CSSProperties } from 'react'

const fade = (v: boolean): CSSProperties => ({
  opacity: v ? 1 : 0,
  transition: 'opacity 0.9s ease',
})

export default function ShizukaKageScene({ success }: { success: boolean }) {
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
      {/* Initial: dark sky, shadow looms */}
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#0c0a1e" />
        {/* dim stars */}
        <circle cx="30"  cy="20"  r="1.2" fill="white" opacity="0.4" />
        <circle cx="90"  cy="12"  r="1"   fill="white" opacity="0.35" />
        <circle cx="200" cy="18"  r="1.2" fill="white" opacity="0.4" />
        <circle cx="280" cy="30"  r="1"   fill="white" opacity="0.3" />
        <circle cx="50"  cy="50"  r="1"   fill="white" opacity="0.25" />
        <circle cx="260" cy="55"  r="1.2" fill="white" opacity="0.3" />
        {/* cloud blob */}
        <ellipse cx="160" cy="112" rx="85" ry="68" fill="#161024" />
        <ellipse cx="112" cy="95"  rx="58" ry="46" fill="#161024" />
        <ellipse cx="208" cy="95"  rx="58" ry="46" fill="#161024" />
        <ellipse cx="145" cy="75"  rx="48" ry="40" fill="#161024" />
        <ellipse cx="178" cy="72"  rx="50" ry="42" fill="#161024" />
        <ellipse cx="98"  cy="142" rx="32" ry="22" fill="#161024" />
        <ellipse cx="222" cy="142" rx="32" ry="22" fill="#161024" />
        <ellipse cx="160" cy="162" rx="26" ry="18" fill="#161024" />
        {/* glowing red eyes */}
        <circle cx="136" cy="107" r="14" fill="#cc0000" opacity="0.25" />
        <circle cx="184" cy="107" r="14" fill="#cc0000" opacity="0.25" />
        <circle cx="136" cy="107" r="10" fill="#ff2a2a" />
        <circle cx="184" cy="107" r="10" fill="#ff2a2a" />
        <circle cx="136" cy="107" r="6"  fill="white" />
        <circle cx="184" cy="107" r="6"  fill="white" />
        <circle cx="138" cy="109" r="3.5" fill="#990000" />
        <circle cx="186" cy="109" r="3.5" fill="#990000" />
      </g>

      {/* Success: shadow disperses, dawn light */}
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#1a1840" />
        {/* horizon glow */}
        <ellipse cx="160" cy="220" rx="200" ry="80" fill="#6040c0" opacity="0.4" />
        <ellipse cx="160" cy="220" rx="120" ry="50" fill="#9060e0" opacity="0.3" />
        {/* scattered cloud remnants */}
        <ellipse cx="60"  cy="70"  rx="30" ry="16" fill="#2a1a40" opacity="0.45" />
        <ellipse cx="255" cy="65"  rx="26" ry="14" fill="#2a1a40" opacity="0.35" />
        <ellipse cx="160" cy="48"  rx="22" ry="12" fill="#2a1a40" opacity="0.3"  />
        <ellipse cx="40"  cy="140" rx="18" ry="10" fill="#2a1a40" opacity="0.25" />
        <ellipse cx="275" cy="150" rx="18" ry="10" fill="#2a1a40" opacity="0.25" />
        {/* bright stars */}
        <circle cx="160" cy="95"  r="4"   fill="#ffd700" opacity="0.95" />
        <circle cx="160" cy="95"  r="8"   fill="#ffd700" opacity="0.2"  />
        <circle cx="100" cy="55"  r="2.5" fill="white"   opacity="0.9"  />
        <circle cx="220" cy="50"  r="2.5" fill="white"   opacity="0.9"  />
        <circle cx="50"  cy="35"  r="2"   fill="white"   opacity="0.8"  />
        <circle cx="275" cy="40"  r="2"   fill="white"   opacity="0.8"  />
        <circle cx="135" cy="75"  r="2"   fill="#ffe080" opacity="0.85" />
        <circle cx="185" cy="78"  r="2"   fill="#ffe080" opacity="0.85" />
        {/* sparkle at where the eyes were */}
        <circle cx="136" cy="107" r="6"   fill="#ffd700" opacity="0.8" />
        <circle cx="184" cy="107" r="6"   fill="#ffd700" opacity="0.8" />
        <circle cx="136" cy="107" r="12"  fill="#ffd700" opacity="0.15" />
        <circle cx="184" cy="107" r="12"  fill="#ffd700" opacity="0.15" />
      </g>
    </svg>
  )
}
