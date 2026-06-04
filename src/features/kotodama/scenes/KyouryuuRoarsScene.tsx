import type { CSSProperties } from 'react'

const fade = (v: boolean): CSSProperties => ({
  opacity: v ? 1 : 0,
  transition: 'opacity 0.9s ease',
})

export default function KyouryuuRoarsScene({ success }: { success: boolean }) {
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%' }}>
      {/* Initial: still mountain, no dinosaur */}
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#E3F2FD" />
        {/* sky */}
        <rect x="0" y="0" width="320" height="140" fill="#B3D9F7" />
        {/* distant mountain */}
        <polygon points="50,140 160,30 270,140" fill="#78909C" />
        <polygon points="50,140 160,55 270,140" fill="#90A4AE" />
        {/* snow cap */}
        <polygon points="130,55 160,30 190,55 175,60 145,60" fill="#ECEFF1" />
        {/* ground */}
        <rect x="0" y="140" width="320" height="80" fill="#558B2F" />
        <ellipse cx="160" cy="140" rx="200" ry="15" fill="#689F38" />
        {/* trees */}
        <polygon points="50,140 65,100 80,140" fill="#2E7D32" />
        <polygon points="240,140 255,100 270,140" fill="#388E3C" />
        <rect x="62" y="130" width="6" height="12" fill="#5D4037" />
        <rect x="252" y="130" width="6" height="12" fill="#5D4037" />
      </g>

      {/* Success: green dinosaur peeks over mountain */}
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#E3F2FD" />
        <rect x="0" y="0" width="320" height="140" fill="#B3D9F7" />
        <polygon points="50,140 160,30 270,140" fill="#78909C" />
        <polygon points="50,140 160,55 270,140" fill="#90A4AE" />
        <polygon points="130,55 160,30 190,55 175,60 145,60" fill="#ECEFF1" />
        <rect x="0" y="140" width="320" height="80" fill="#558B2F" />
        <ellipse cx="160" cy="140" rx="200" ry="15" fill="#689F38" />
        <polygon points="50,140 65,100 80,140" fill="#2E7D32" />
        <polygon points="240,140 255,100 270,140" fill="#388E3C" />
        <rect x="62" y="130" width="6" height="12" fill="#5D4037" />
        <rect x="252" y="130" width="6" height="12" fill="#5D4037" />

        {/* dinosaur head + neck peeking over mountain */}
        {/* neck */}
        <path d="M 145 140 Q 150 90 160 72" stroke="#66BB6A" strokeWidth="28" strokeLinecap="round" fill="none" />
        <path d="M 145 140 Q 150 90 160 72" stroke="#81C784" strokeWidth="22" strokeLinecap="round" fill="none" />
        {/* head */}
        <ellipse cx="160" cy="58" rx="28" ry="22" fill="#66BB6A" stroke="#388E3C" strokeWidth="3" />
        {/* snout */}
        <ellipse cx="182" cy="65" rx="14" ry="10" fill="#81C784" stroke="#388E3C" strokeWidth="2.5" />
        {/* eye */}
        <circle cx="154" cy="50" r="7" fill="white" stroke="#2E2E2E" strokeWidth="2" />
        <circle cx="156" cy="51" r="3.5" fill="#2E2E2E" />
        <circle cx="157" cy="50" r="1.2" fill="white" />
        {/* nostril */}
        <circle cx="186" cy="62" r="2.5" fill="#388E3C" />
        {/* mouth open to roar */}
        <path d="M 172 68 Q 182 78 192 68" fill="none" stroke="#388E3C" strokeWidth="2.5" strokeLinecap="round" />
        {/* back spikes */}
        <polygon points="140,80 133,60 148,78" fill="#A5D6A7" stroke="#388E3C" strokeWidth="1.5" />
        <polygon points="148,72 140,52 155,70" fill="#A5D6A7" stroke="#388E3C" strokeWidth="1.5" />
        {/* roar sound lines */}
        <path d="M 198 55 Q 210 50 220 55" fill="none" stroke="#FFD54F" strokeWidth="3" strokeLinecap="round" />
        <path d="M 202 64 Q 216 64 226 60" fill="none" stroke="#FFD54F" strokeWidth="3" strokeLinecap="round" />
        <path d="M 198 74 Q 210 78 218 72" fill="none" stroke="#FFD54F" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}
