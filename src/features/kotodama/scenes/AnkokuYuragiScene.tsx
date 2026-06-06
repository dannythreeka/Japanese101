import type { CSSProperties } from 'react'

const fade = (v: boolean): CSSProperties => ({
  opacity: v ? 1 : 0,
  transition: 'opacity 1.2s ease',
})

export default function AnkokuYuragiScene({ success }: { success: boolean }) {
  return (
    <svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', width: '100%', animation: success ? 'none' : 'boss-blob 2s ease-in-out infinite' }}>
      <defs>
        <radialGradient id="ankoku-bg" cx="50%" cy="60%" r="70%">
          <stop offset="0%" stopColor="#1a0030"/>
          <stop offset="100%" stopColor="#060010"/>
        </radialGradient>
        <filter id="flame-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="turbulence" baseFrequency="0.025" numOctaves="3" result="noise">
            <animate attributeName="baseFrequency" values="0.025;0.04;0.025" dur="4s" repeatCount="indefinite"/>
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="eye-glow">
          <feGaussianBlur stdDeviation="5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Idle: dark swirling nebula boss */}
      <g style={fade(!success)}>
        <rect width="320" height="220" fill="url(#ankoku-bg)"/>
        {/* Nebula body */}
        <ellipse cx="160" cy="110" rx="95" ry="80" fill="#28004A" filter="url(#flame-blur)"
          style={{ animation: 'hue-spin 6s linear infinite' }}/>
        <ellipse cx="160" cy="110" rx="75" ry="65" fill="#3A0060" filter="url(#flame-blur)"
          style={{ animation: 'hue-spin 4s linear infinite reverse' }}/>
        {/* Kana fragments floating around */}
        {[
          { x: 70,  y: 55,  char: 'ざ', delay: '0s' },
          { x: 235, y: 62,  char: 'づ', delay: '0.8s' },
          { x: 48,  y: 148, char: 'ぱ', delay: '1.4s' },
          { x: 250, y: 150, char: 'ぼ', delay: '0.4s' },
          { x: 155, y: 38,  char: 'ぎ', delay: '1.8s' },
        ].map(({ x, y, char, delay }) => (
          <text key={char} x={x} y={y} fontSize="22" fill="#9060C0" opacity="0.7"
            style={{ animation: `boss-blob 3s ${delay} ease-in-out infinite` }}>
            {char}
          </text>
        ))}
        {/* Eyes */}
        <g filter="url(#eye-glow)" style={{ animation: 'eye-flicker 2.8s ease-in-out infinite' }}>
          <circle cx="136" cy="108" r="16" fill="#8B0050" opacity="0.3"/>
          <circle cx="184" cy="108" r="16" fill="#8B0050" opacity="0.3"/>
          <circle cx="136" cy="108" r="11" fill="#CC0066"/>
          <circle cx="184" cy="108" r="11" fill="#CC0066"/>
          <circle cx="136" cy="108" r="6"  fill="#FF40AA"/>
          <circle cx="184" cy="108" r="6"  fill="#FF40AA"/>
          <circle cx="138" cy="110" r="3"  fill="#FFFFFF"/>
          <circle cx="186" cy="110" r="3"  fill="#FFFFFF"/>
        </g>
      </g>

      {/* Success: nebula disperses into light */}
      <g style={fade(success)}>
        <rect width="320" height="220" fill="#0e0820"/>
        <ellipse cx="160" cy="220" rx="220" ry="90" fill="#7040C0" opacity="0.3"/>
        <ellipse cx="160" cy="220" rx="140" ry="55" fill="#9060E0" opacity="0.2"/>
        {/* Scattered kana fading */}
        {[70, 235, 48, 250, 155].map((x, i) => (
          <circle key={i} cx={x} cy={[55,62,148,150,38][i]} r="3"
            fill="#D080FF" opacity="0.5"/>
        ))}
        {/* Central light burst */}
        <circle cx="160" cy="108" r="30" fill="#FFD0FF" opacity="0.6"/>
        <circle cx="160" cy="108" r="15" fill="white" opacity="0.8"/>
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <line key={i}
            x1={160 + Math.cos(deg*Math.PI/180)*30}
            y1={108 + Math.sin(deg*Math.PI/180)*30}
            x2={160 + Math.cos(deg*Math.PI/180)*55}
            y2={108 + Math.sin(deg*Math.PI/180)*55}
            stroke="#FFD0FF" strokeWidth="3" opacity="0.6"/>
        ))}
      </g>
    </svg>
  )
}
