import type { CSSProperties } from 'react'
interface Props { success: boolean }
const fade = (v: boolean): CSSProperties => ({ opacity: v ? 1 : 0, transition: 'opacity 0.9s ease' })
export default function IchigoAppearsScene({ success }: Props) {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: 'block' }} aria-hidden="true">
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="#c8e6c9"/>
        <rect x="0" y="160" width="320" height="60" fill="#5a8a5a"/>
        {[40,100,160,220,280].map(x => <ellipse key={x} cx={x} cy="148" rx="30" ry="22" fill="#4a7a4a" stroke="#3a6a3a" strokeWidth="2"/>)}
        {[40,100,160,220,280].map(x => <ellipse key={x} cx={x} cy="138" rx="22" ry="18" fill="#5a8a5a"/>)}
      </g>
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#e8f5e9"/>
        <rect x="0" y="160" width="320" height="60" fill="#4caf50"/>
        {[40,100,160,220,280].map(x => <ellipse key={x} cx={x} cy="148" rx="30" ry="22" fill="#388e3c" stroke="#2e7d32" strokeWidth="2"/>)}
        {[55,115,175,235].map((x,i) => (
          <g key={i}>
            <path d={`M${x},148 Q${x-8},138 ${x-4},130 Q${x},125 ${x+4},130 Q${x+8},138 ${x},148`} fill="#e53935" stroke="#b71c1c" strokeWidth="1.5"/>
            {[0,1,2].map(j => <circle key={j} cx={x-4+j*4} cy={134+j*4} r="1.5" fill="white"/>)}
            <line x1={x} y1="125" x2={x} y2="118" stroke="#4caf50" strokeWidth="2" strokeLinecap="round"/>
            <path d={`M${x},118 Q${x-5},114 ${x-7},116`} fill="none" stroke="#4caf50" strokeWidth="1.5" strokeLinecap="round"/>
            <path d={`M${x},118 Q${x+5},114 ${x+7},116`} fill="none" stroke="#4caf50" strokeWidth="1.5" strokeLinecap="round"/>
          </g>
        ))}
      </g>
    </svg>
  )
}
