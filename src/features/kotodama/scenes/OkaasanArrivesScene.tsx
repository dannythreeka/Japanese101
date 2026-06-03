import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function OkaasanArrivesScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#f8f0e8"/>
        {/* kitchen counter */}
        <rect x="0" y="148" width="320" height="72" fill="#e8dcc8" rx="4"/>
        <rect x="0" y="148" width="320" height="18" fill="#d4c8a8" rx="4"/>
        {/* sink */}
        <rect x="90" y="155" width="60" height="35" fill="#c8c0b0" rx="4" stroke="#b0a898" strokeWidth="2"/>
        <ellipse cx="120" cy="168" rx="20" ry="12" fill="#a8a098" stroke="#989080" strokeWidth="1.5"/>
        {/* faucet */}
        <rect x="116" y="152" width="8" height="15" fill="#b8b0a0" rx="2"/>
        <rect x="108" y="152" width="24" height="5" fill="#b8b0a0" rx="2"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#f8f0e8"/>
        <rect x="0" y="148" width="320" height="72" fill="#e8dcc8" rx="4"/>
        <rect x="0" y="148" width="320" height="18" fill="#d4c8a8" rx="4"/>
        <rect x="90" y="155" width="60" height="35" fill="#c8c0b0" rx="4" stroke="#b0a898" strokeWidth="2"/>
        <ellipse cx="120" cy="168" rx="20" ry="12" fill="#a8a098" stroke="#989080" strokeWidth="1.5"/>
        <rect x="116" y="152" width="8" height="15" fill="#b8b0a0" rx="2"/>
        <rect x="108" y="152" width="24" height="5" fill="#b8b0a0" rx="2"/>
        {/* mom figure */}
        <ellipse cx="190" cy="140" rx="20" ry="24" fill="#e05090" stroke="#c03070" strokeWidth="2"/>
        <circle cx="190" cy="110" r="18" fill="#f5c5a0" stroke="#e0a870" strokeWidth="2"/>
        <path d="M176,106 Q180,96 190,96 Q200,96 204,106" fill="#3a2a1a" stroke="#2a1a0a" strokeWidth="1.5"/>
        <path d="M174,106 Q172,102 168,106" fill="#3a2a1a"/>
        {/* apron */}
        <path d="M175,130 Q190,122 205,130 Q210,148 190,155 Q170,148 175,130Z" fill="white" stroke="#ddd" strokeWidth="2"/>
        {/* eyes smile */}
        <path d="M183,108 Q187,105 191,108" fill="none" stroke="#3a2010" strokeWidth="2" strokeLinecap="round"/>
        <path d="M189,108 Q193,105 197,108" fill="none" stroke="#3a2010" strokeWidth="2" strokeLinecap="round"/>
        <path d="M185,115 Q190,119 195,115" fill="none" stroke="#c87040" strokeWidth="1.5" strokeLinecap="round"/>
        {/* arms putting on apron */}
        <path d="M172,132 Q155,135 148,148" fill="none" stroke="#e05090" strokeWidth="7" strokeLinecap="round"/>
        <path d="M208,132 Q225,135 232,148" fill="none" stroke="#e05090" strokeWidth="7" strokeLinecap="round"/>
        <circle cx="148" cy="148" r="9" fill="#f5c5a0" stroke="#e0a870" strokeWidth="2"/>
        <circle cx="232" cy="148" r="9" fill="#f5c5a0" stroke="#e0a870" strokeWidth="2"/>
        {/* legs */}
        <rect x="178" y="163" width="12" height="30" fill="#e05090" rx="4"/>
        <rect x="194" y="163" width="12" height="30" fill="#e05090" rx="4"/>
      </g>
    </svg>
  )
}
