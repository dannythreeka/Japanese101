import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 1s ease' })
export default function AjisaiBloumsScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#b0c4d8"/>
        <rect x="0" y="170" width="320" height="50" fill="#6a8f6a"/>
        <ellipse cx="100" cy="120" rx="40" ry="50" fill="#4a7a4a"/>
        <ellipse cx="200" cy="115" rx="45" ry="55" fill="#4a7a4a"/>
        {[30,70,110,150,190,230,270].map(x => (
          <line key={x} x1={x} y1="60" x2={x-4} y2="90" stroke="#8ab4cc" strokeWidth="2.5" strokeLinecap="round"/>
        ))}
        <ellipse cx="100" cy="80" rx="12" ry="10" fill="#7a9a7a" stroke="#5a7a5a" strokeWidth="2"/>
        <ellipse cx="195" cy="75" rx="13" ry="10" fill="#7a9a7a" stroke="#5a7a5a" strokeWidth="2"/>
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#87ceeb"/>
        <rect x="0" y="170" width="320" height="50" fill="#5cb85c"/>
        <ellipse cx="100" cy="120" rx="40" ry="50" fill="#3d7a3d"/>
        <ellipse cx="200" cy="115" rx="45" ry="55" fill="#3d7a3d"/>
        {[55,75,95,115,135,155,175,195,215].map((x,i) => (
          <circle key={i} cx={x} cy={i%2===0?78:86} r="9" fill={i%3===0?'#8b5cf6':i%3===1?'#6d28d9':'#a78bfa'} stroke="#5b21b6" strokeWidth="1.5"/>
        ))}
        <circle cx="87" cy="62" r="11" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2"/>
        <circle cx="103" cy="55" r="10" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2"/>
        <circle cx="119" cy="62" r="11" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="2"/>
        <circle cx="185" cy="57" r="12" fill="#7c3aed" stroke="#5b21b6" strokeWidth="2"/>
        <circle cx="202" cy="50" r="11" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="2"/>
        <circle cx="218" cy="57" r="12" fill="#a78bfa" stroke="#7c3aed" strokeWidth="2"/>
        <ellipse cx="285" cy="35" rx="24" ry="12" fill="#fff9e6"/>
        <polygon points="285,12 290,28 305,28 293,38 298,54 285,44 272,54 277,38 265,28 280,28" fill="#fcd34d" stroke="#f59e0b" strokeWidth="1.5"/>
      </g>
    </svg>
  )
}
