import { useEffect, useRef, useState } from 'react'

interface PetStageProps {
  stage: number          // 0-6  (6 same as 5)
  animate?: boolean      // enable float/blink etc. (default true)
  onShake?: boolean      // trigger shake once
  size?: number          // rendered pixel size (default 200)
}

export default function PetStage({ stage, animate = true, onShake, size = 200 }: PetStageProps) {
  const s = Math.min(Math.max(stage, 0), 5)  // clamp
  const floatClass = animate ? 'pet-float' : ''
  const [blink, setBlink] = useState(false)
  const [shaking, setShaking] = useState(false)
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Blink every 5s for stages 2-5
  useEffect(() => {
    if (!animate || s < 2) return
    const schedule = () => {
      blinkTimer.current = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); schedule() }, 200)
      }, 5000 + Math.random() * 2000)
    }
    schedule()
    return () => clearTimeout(blinkTimer.current)
  }, [animate, s])

  // Shake when onShake prop changes to true
  useEffect(() => {
    if (!onShake) return
    setShaking(true)
    const t = setTimeout(() => setShaking(false), 500)
    return () => clearTimeout(t)
  }, [onShake])

  const shakeClass = shaking ? 'pet-shake' : ''

  return (
    <div
      style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}
      className={`${s < 2 ? floatClass : ''} ${shakeClass}`}
      aria-label={`pet stage ${s}`}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ overflow: s >= 4 ? 'visible' : 'hidden', display: 'block' }}
      >
        <defs>
          <radialGradient id={`egg-${s}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FDDEA0"/>
            <stop offset="100%" stopColor="#F4A261"/>
          </radialGradient>
          <radialGradient id={`chibi-${s}`} cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#C8DFFF"/>
            <stop offset="100%" stopColor="#7EB8FF"/>
          </radialGradient>
          <linearGradient id={`dragon-${s}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8EAFF"/>
            <stop offset="50%" stopColor="#DDB4FF"/>
            <stop offset="100%" stopColor="#B890E8"/>
          </linearGradient>
          <filter id={`glow-${s}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id={`goldglow-${s}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" result="blur"/>
            <feColorMatrix in="blur" type="matrix"
              values="1 0.8 0 0 0  0.8 0.6 0 0 0  0 0 0 0 0  0 0 0 1 0" result="colored"/>
            <feMerge><feMergeNode in="colored"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ── STAGE 0: complete egg ─────────────────────────────── */}
        {s === 0 && (
          <g className={floatClass}>
            <ellipse cx="100" cy="112" rx="62" ry="78" fill={`url(#egg-${s})`}/>
            {/* spots */}
            <ellipse cx="76" cy="150" rx="7" ry="4" fill="#C07A40" opacity="0.35"/>
            <ellipse cx="110" cy="158" rx="5.5" ry="3.5" fill="#C07A40" opacity="0.3"/>
            <ellipse cx="128" cy="145" rx="5" ry="3" fill="#C07A40" opacity="0.25"/>
            {/* shine */}
            <ellipse cx="80" cy="82" rx="15" ry="9" fill="white" opacity="0.22" transform="rotate(-20 80 82)"/>
          </g>
        )}

        {/* ── STAGE 1: cracked egg ──────────────────────────────── */}
        {s === 1 && (
          <g className={floatClass}>
            <ellipse cx="100" cy="112" rx="62" ry="78" fill={`url(#egg-${s})`}/>
            <ellipse cx="76" cy="150" rx="7" ry="4" fill="#C07A40" opacity="0.35"/>
            <ellipse cx="110" cy="158" rx="5.5" ry="3.5" fill="#C07A40" opacity="0.3"/>
            <ellipse cx="128" cy="145" rx="5" ry="3" fill="#C07A40" opacity="0.25"/>
            <ellipse cx="80" cy="82" rx="15" ry="9" fill="white" opacity="0.22" transform="rotate(-20 80 82)"/>
            {/* left crack "eye" */}
            <path d="M75 82 L80 91 L70 100 L80 108" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
            {/* right crack "eye" */}
            <path d="M118 80 L124 90 L115 99 L125 106" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </g>
        )}

        {/* ── STAGE 2: チビ影 (chick with egg-hat) ─────────────── */}
        {s === 2 && (
          <g>
            {/* Body */}
            <ellipse cx="100" cy="122" rx="56" ry="62" fill={`url(#chibi-${s})`} className={floatClass}/>
            {/* Egg-shell hat */}
            <g className={floatClass}>
              <path d="M68 80 Q100 48 132 80 L128 88 Q100 72 72 88 Z" fill="#F8F4EE" stroke="#D8CEC0" strokeWidth="1.5"/>
              <path d="M96 52 L93 72" stroke="#C0B098" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M112 58 L110 76" stroke="#C0B098" strokeWidth="1" strokeLinecap="round"/>
            </g>
            {/* Eyes */}
            <ellipse cx="78" cy="111" rx="13" ry={blink ? 2 : 14} fill="#1C1C2E" className={floatClass}/>
            <ellipse cx="122" cy="111" rx="13" ry={blink ? 2 : 14} fill="#1C1C2E" className={floatClass}/>
            {!blink && <>
              <circle cx="82" cy="107" r="4.5" fill="white" className={floatClass}/>
              <circle cx="126" cy="107" r="4.5" fill="white" className={floatClass}/>
            </>}
          </g>
        )}

        {/* ── STAGE 3: 魔力チビ影 (wings + antenna) ───────────── */}
        {s === 3 && (
          <g>
            {/* Wings */}
            <g style={{ transformOrigin: '48px 115px' }} className="wing-flap">
              <path d="M48 115 Q15 85 22 55 Q35 28 70 80 Q60 98 48 115" fill="#BDB2FF" opacity="0.9"/>
              <path d="M48 115 Q22 88 26 62 Q36 40 62 82" fill="#A090F0" opacity="0.55"/>
            </g>
            <g style={{ transformOrigin: '152px 115px' }} className="wing-flap">
              <path d="M152 115 Q185 85 178 55 Q165 28 130 80 Q140 98 152 115" fill="#BDB2FF" opacity="0.9"/>
              <path d="M152 115 Q178 88 174 62 Q164 40 138 82" fill="#A090F0" opacity="0.55"/>
            </g>
            {/* Body */}
            <ellipse cx="100" cy="122" rx="56" ry="62" fill={`url(#chibi-${s})`}/>
            {/* Lightning antenna */}
            <path d="M100 42 L93 62 L104 59 L96 80" stroke="#FFEE80" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M100 42 L93 62 L104 59 L96 80" stroke="#E0C830" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Eyes */}
            <ellipse cx="78" cy="111" rx="13" ry={blink ? 2 : 14} fill="#1C1C2E"/>
            <ellipse cx="122" cy="111" rx="13" ry={blink ? 2 : 14} fill="#1C1C2E"/>
            {!blink && <>
              <circle cx="82" cy="107" r="4.5" fill="white"/>
              <circle cx="126" cy="107" r="4.5" fill="white"/>
            </>}
          </g>
        )}

        {/* ── STAGE 4: 鳳羽幻獸 カゲマル ──────────────────────── */}
        {s === 4 && (
          <g>
            {/* Left wing (overflows circle) */}
            <g style={{ transformOrigin: '55px 105px' }} className="wing-slow">
              <path d="M55 105 Q-15 55 5 15 Q25 -10 75 60 Q65 82 55 105" fill="#E5D0FF" opacity="0.88"/>
              <path d="M55 105 Q0 65 12 30 Q26 8 68 65" fill="#C8A8F0" opacity="0.55"/>
              {/* wing feather lines */}
              <path d="M50 100 Q20 65 15 35" stroke="#B090D8" strokeWidth="1.2" fill="none" opacity="0.5"/>
              <path d="M58 90 Q35 58 28 30" stroke="#B090D8" strokeWidth="1" fill="none" opacity="0.4"/>
            </g>
            {/* Right wing */}
            <g style={{ transformOrigin: '145px 105px' }} className="wing-slow">
              <path d="M145 105 Q215 55 195 15 Q175 -10 125 60 Q135 82 145 105" fill="#E5D0FF" opacity="0.88"/>
              <path d="M145 105 Q200 65 188 30 Q174 8 132 65" fill="#C8A8F0" opacity="0.55"/>
              <path d="M150 100 Q180 65 185 35" stroke="#B090D8" strokeWidth="1.2" fill="none" opacity="0.5"/>
              <path d="M142 90 Q165 58 172 30" stroke="#B090D8" strokeWidth="1" fill="none" opacity="0.4"/>
            </g>
            {/* Body */}
            <ellipse cx="100" cy="122" rx="46" ry="54" fill={`url(#dragon-${s})`}/>
            {/* Head */}
            <ellipse cx="100" cy="85" rx="40" ry="38" fill={`url(#dragon-${s})`}/>
            {/* Ears */}
            <polygon points="65,62 54,28 78,56" fill="#D0A8F0"/>
            <polygon points="135,62 146,28 122,56" fill="#D0A8F0"/>
            <polygon points="66,60 58,33 76,55" fill="#F0DCFF"/>
            <polygon points="134,60 142,33 124,55" fill="#F0DCFF"/>
            {/* Eyes */}
            <ellipse cx="85" cy="88" rx="9" ry={blink ? 2 : 10} fill="#3A2060"/>
            <ellipse cx="115" cy="88" rx="9" ry={blink ? 2 : 10} fill="#3A2060"/>
            {!blink && <>
              <circle cx="87.5" cy="85.5" r="3.5" fill="white"/>
              <circle cx="117.5" cy="85.5" r="3.5" fill="white"/>
            </>}
            {/* Gold star chest mark */}
            <polygon
              points="100,112 103,121 113,121 106,127 108,136 100,130 92,136 94,127 87,121 97,121"
              fill="#FFD700" stroke="#E0A800" strokeWidth="0.8"/>
            {/* Tail */}
            <path d="M88 170 Q100 188 112 170 Q108 178 100 183 Q92 178 88 170" fill="#D0A8F0"/>
            {/* Particle sparkles */}
            {[...Array(5)].map((_, i) => (
              <circle
                key={i}
                cx={100 + Math.cos(i * 72 * Math.PI / 180) * 85}
                cy={100 + Math.sin(i * 72 * Math.PI / 180) * 85}
                r="2.5"
                fill="#FFD700"
                opacity="0.7"
                className="gold-pulse"
                style={{ animationDelay: `${i * 0.36}s` }}
              />
            ))}
          </g>
        )}

        {/* ── STAGE 5 / 6: 神獸覚醒 カゲマル ─────────────────── */}
        {s >= 5 && (
          <g>
            {/* Gold glow backdrop */}
            <ellipse cx="100" cy="110" rx="80" ry="85" fill="#FFD700" opacity="0.12" filter={`url(#goldglow-${s})`} className="gold-pulse"/>
            {/* Wings (same as stage 4 but golden tint) */}
            <g style={{ transformOrigin: '55px 105px' }} className="wing-slow">
              <path d="M55 105 Q-15 55 5 15 Q25 -10 75 60 Q65 82 55 105" fill="#F0E0FF" opacity="0.9"/>
              <path d="M55 105 Q0 65 12 30 Q26 8 68 65" fill="#D4B8FF" opacity="0.55"/>
            </g>
            <g style={{ transformOrigin: '145px 105px' }} className="wing-slow">
              <path d="M145 105 Q215 55 195 15 Q175 -10 125 60 Q135 82 145 105" fill="#F0E0FF" opacity="0.9"/>
              <path d="M145 105 Q200 65 188 30 Q174 8 132 65" fill="#D4B8FF" opacity="0.55"/>
            </g>
            {/* Body */}
            <ellipse cx="100" cy="122" rx="46" ry="54" fill={`url(#dragon-${s})`}/>
            {/* Head */}
            <ellipse cx="100" cy="85" rx="40" ry="38" fill={`url(#dragon-${s})`}/>
            {/* Ears */}
            <polygon points="65,62 54,28 78,56" fill="#D4B060"/>
            <polygon points="135,62 146,28 122,56" fill="#D4B060"/>
            <polygon points="66,60 58,33 76,55" fill="#FFF0C0"/>
            <polygon points="134,60 142,33 124,55" fill="#FFF0C0"/>
            {/* Happy ^^ eyes */}
            <path d="M75 88 Q85 80 95 88" stroke="#3A2060" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <path d="M105 88 Q115 80 125 88" stroke="#3A2060" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            {/* Open laughing mouth */}
            <path d="M84 106 Q100 122 116 106" fill="#FF9090" stroke="#3A2060" strokeWidth="2.5" strokeLinecap="round"/>
            <rect x="90" y="107" width="8" height="7" rx="2" fill="white"/>
            <rect x="102" y="107" width="8" height="7" rx="2" fill="white"/>
            {/* Gold star chest */}
            <polygon
              points="100,112 103,121 113,121 106,127 108,136 100,130 92,136 94,127 87,121 97,121"
              fill="#FFD700" stroke="#C89000" strokeWidth="0.8"/>
            {/* Orbiting energy orbs */}
            <circle cx="0" cy="0" r="7" fill="#FFE860" opacity="0.9" style={{ animation: 'orb-orbit 3.5s linear infinite', transformOrigin: '100px 105px' }}/>
            <circle cx="0" cy="0" r="5" fill="#A0FFDD" opacity="0.9" style={{ animation: 'orb-orbit 3.5s linear infinite reverse', transformOrigin: '100px 105px', animationDelay: '1.75s' }}/>
            {/* Gold particles */}
            {[...Array(8)].map((_, i) => (
              <circle key={i}
                cx={100 + Math.cos(i * 45 * Math.PI / 180) * 88}
                cy={100 + Math.sin(i * 45 * Math.PI / 180) * 88}
                r="2.5" fill="#FFD700" opacity="0.75"
                className="gold-pulse"
                style={{ animationDelay: `${i * 0.22}s` }}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  )
}
