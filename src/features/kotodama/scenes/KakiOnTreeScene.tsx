import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function KakiOnTreeScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#87ceeb"/>
        <rect x="0" y="178" width="320" height="42" fill="#7bc97b"/>
        <rect x="148" y="70" width="24" height="110" fill="#8b6340" rx="5"/>
        <path d="M160,80 Q110,50 90,90 Q80,110 100,125 Q120,140 150,130" fill="#7a9a7a" stroke="#5a7a5a" strokeWidth="2"/>
        <path d="M160,80 Q200,40 225,75 Q240,100 220,120 Q200,138 165,130" fill="#7a9a7a" stroke="#5a7a5a" strokeWidth="2"/>
        <path d="M160,80 Q160,50 165,30 Q170,20 175,35 Q180,50 165,80" fill="#8aaa8a" stroke="#6a8a6a" strokeWidth="2"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#87ceeb"/>
        <rect x="0" y="178" width="320" height="42" fill="#5cb85c"/>
        <rect x="148" y="70" width="24" height="110" fill="#8b6340" rx="5"/>
        <path d="M160,80 Q110,50 90,90 Q80,110 100,125 Q120,140 150,130" fill="#4a7a4a" stroke="#3a6a3a" strokeWidth="2"/>
        <path d="M160,80 Q200,40 225,75 Q240,100 220,120 Q200,138 165,130" fill="#4a7a4a" stroke="#3a6a3a" strokeWidth="2"/>
        <path d="M160,80 Q160,50 165,30 Q170,20 175,35 Q180,50 165,80" fill="#5a8a5a" stroke="#4a7a4a" strokeWidth="2"/>
        {[{cx:105,cy:105},{cx:125,cy:90},{cx:90,cy:115},{cx:200,cy:95},{cx:215,cy:112},{cx:188,cy:108},{cx:158,cy:60},{cx:162,cy:42}].map((p,i)=>(
          <g key={i}>
            <circle cx={p.cx} cy={p.cy} r="13" fill="#f97316" stroke="#ea6700" strokeWidth="2"/>
            <path d={`M${p.cx},${p.cy-13} Q${p.cx-5},${p.cy-18} ${p.cx-8},${p.cy-16}`} fill="none" stroke="#4a7a4a" strokeWidth="2" strokeLinecap="round"/>
          </g>
        ))}
      </g>
    </svg>
  )
}
