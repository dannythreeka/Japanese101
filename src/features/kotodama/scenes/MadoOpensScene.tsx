import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function MadoOpensScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#c8c0b8"/>
        <rect x="80" y="50" width="160" height="130" fill="#b8b0a8" stroke="#9a9288" strokeWidth="4" rx="4"/>
        <rect x="88" y="58" width="144" height="114" fill="#a8a09a" rx="3"/>
        <line x1="160" y1="58" x2="160" y2="172" stroke="#9a9288" strokeWidth="4"/>
        <line x1="88" y1="115" x2="232" y2="115" stroke="#9a9288" strokeWidth="4"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#d0c8c0"/>
        {/* sky through window */}
        <rect x="88" y="58" width="144" height="114" fill="#87ceeb" rx="3"/>
        <ellipse cx="120" cy="80" rx="20" ry="12" fill="white"/>
        <ellipse cx="108" cy="85" rx="14" ry="10" fill="white"/>
        <ellipse cx="132" cy="85" rx="12" ry="9" fill="white"/>
        <ellipse cx="200" cy="75" rx="22" ry="13" fill="white"/>
        <ellipse cx="185" cy="80" rx="14" ry="10" fill="white"/>
        <ellipse cx="212" cy="80" rx="13" ry="9" fill="white"/>
        {/* window frame open */}
        <rect x="80" y="50" width="160" height="130" fill="none" stroke="#9a9288" strokeWidth="4" rx="4"/>
        {/* left panel swung open */}
        <rect x="28" y="52" width="58" height="126" fill="#e8e0d8" stroke="#a8a098" strokeWidth="3" rx="3" transform="skewY(-3)"/>
        <line x1="28" y1="115" x2="86" y2="115" stroke="#a8a098" strokeWidth="2"/>
        {/* right panel swung open */}
        <rect x="234" y="52" width="58" height="126" fill="#e8e0d8" stroke="#a8a098" strokeWidth="3" rx="3" transform="skewY(3)"/>
        <line x1="234" y1="115" x2="292" y2="115" stroke="#a8a098" strokeWidth="2"/>
        {/* curtains */}
        <path d="M88,58 Q95,85 90,115 Q85,145 88,172" fill="#fde68a" stroke="#f59e0b" strokeWidth="2"/>
        <path d="M232,58 Q225,85 230,115 Q235,145 232,172" fill="#fde68a" stroke="#f59e0b" strokeWidth="2"/>
        <line x1="160" y1="58" x2="160" y2="172" stroke="#9a9288" strokeWidth="3"/>
      </g>
    </svg>
  )
}
