import type { CSSProperties } from 'react'

const fade = (v: boolean): CSSProperties => ({
  opacity: v ? 1 : 0,
  transition: 'opacity 0.9s ease',
})

export default function OmochiRoundScene({ success }: { success: boolean }) {
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
      {/* Initial: empty plate */}
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#FFF8E7" />
        {/* table surface */}
        <rect x="0" y="160" width="320" height="60" fill="#D7B89C" />
        <rect x="0" y="158" width="320" height="6" fill="#C49A6C" />
        {/* empty plate */}
        <ellipse cx="160" cy="148" rx="76" ry="22" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="3" />
        <ellipse cx="160" cy="144" rx="68" ry="16" fill="#F5F5F5" />
      </g>

      {/* Success: round white mochi on plate */}
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#FFF8E7" />
        {/* table */}
        <rect x="0" y="160" width="320" height="60" fill="#D7B89C" />
        <rect x="0" y="158" width="320" height="6" fill="#C49A6C" />
        {/* plate with mochi */}
        <ellipse cx="160" cy="152" rx="76" ry="22" fill="#E0E0E0" stroke="#BDBDBD" strokeWidth="3" />
        <ellipse cx="160" cy="148" rx="68" ry="16" fill="#F5F5F5" />
        {/* mochi — two stacked rounds */}
        <ellipse cx="160" cy="138" rx="44" ry="22" fill="white" stroke="#D0D0D0" strokeWidth="2.5" />
        <ellipse cx="160" cy="120" rx="34" ry="18" fill="white" stroke="#D0D0D0" strokeWidth="2.5" />
        {/* highlight */}
        <ellipse cx="150" cy="114" rx="10" ry="6" fill="white" opacity="0.7" />
        {/* subtle pink center */}
        <ellipse cx="160" cy="120" rx="10" ry="8" fill="#FFB3C1" opacity="0.3" />
      </g>
    </svg>
  )
}
