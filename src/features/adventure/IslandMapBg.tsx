export default function IslandMapBg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 480"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ibg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7EC8E3" />
          <stop offset="100%" stopColor="#C9E8F5" />
        </linearGradient>
        <linearGradient id="ibg-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#29B6F6" />
          <stop offset="100%" stopColor="#0277BD" />
        </linearGradient>
        <radialGradient id="ibg-island" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A5D6A7" />
          <stop offset="100%" stopColor="#66BB6A" />
        </radialGradient>
        <radialGradient id="ibg-kizuna" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C8E6C9" />
          <stop offset="100%" stopColor="#81C784" />
        </radialGradient>
        <radialGradient id="ibg-shinka" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#78909C" />
          <stop offset="100%" stopColor="#455A64" />
        </radialGradient>
        <filter id="ibg-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0277BD" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* Sky */}
      <rect width="800" height="480" fill="url(#ibg-sky)" />

      {/* Ocean */}
      <rect y="220" width="800" height="260" fill="url(#ibg-ocean)" />
      <path
        d="M0 230 Q80 218 160 228 Q240 238 320 225 Q400 212 480 224 Q560 236 640 222 Q720 208 800 220 L800 242 Q720 230 640 242 Q560 254 480 242 Q400 230 320 244 Q240 256 160 246 Q80 236 0 250Z"
        fill="#4FC3F7"
        opacity="0.5"
      />

      {/* Island base */}
      <path
        d="M130 310 C80 260 95 180 170 155 C230 135 280 150 330 138 C390 122 450 118 510 130 C570 142 615 165 640 200 C670 240 665 290 645 325 C620 365 570 390 510 400 C450 410 390 415 330 408 C270 400 220 385 175 358 C140 335 150 330 130 310Z"
        fill="url(#ibg-island)"
        filter="url(#ibg-shadow)"
      />

      {/* Tamago region — gold/amber egg zone */}
      <circle cx="195" cy="255" r="52" fill="#FFE082" opacity="0.9" />
      <circle cx="195" cy="255" r="40" fill="#FFD54F" opacity="0.8" />
      <text x="195" y="264" textAnchor="middle" fontSize="22" fontFamily="sans-serif">🥚</text>

      {/* Kizuna region — bright green plains */}
      <path
        d="M240 155 C290 135 400 132 460 155 C495 172 510 220 505 270 C495 320 445 360 390 368 C335 376 280 355 255 315 C230 280 228 235 238 200 C242 185 240 162 240 155Z"
        fill="url(#ibg-kizuna)"
      />

      {/* Shinka region — mysterious grey-purple */}
      <path
        d="M475 145 C525 128 585 138 625 175 C650 205 655 255 640 295 C620 340 565 375 510 378 C475 370 460 330 462 280 C464 240 467 200 475 145Z"
        fill="url(#ibg-shinka)"
      />

      {/* Kizuna: trees */}
      <ellipse cx="300" cy="195" rx="22" ry="18" fill="#2E7D32" />
      <rect x="296" y="210" width="8" height="14" rx="2" fill="#1B5E20" />
      <ellipse cx="360" cy="178" rx="19" ry="16" fill="#388E3C" />
      <rect x="356" y="192" width="7" height="12" rx="2" fill="#1B5E20" />
      <ellipse cx="430" cy="190" rx="21" ry="17" fill="#2E7D32" />
      <rect x="426" y="204" width="8" height="13" rx="2" fill="#1B5E20" />

      {/* Sun over kizuna side */}
      <circle cx="730" cy="88" r="40" fill="#FFEE58" opacity="0.95" />
      <g stroke="#FDD835" strokeWidth="3.5" strokeLinecap="round" opacity="0.85">
        <line x1="730" y1="38" x2="730" y2="22" />
        <line x1="730" y1="138" x2="730" y2="154" />
        <line x1="680" y1="88" x2="664" y2="88" />
        <line x1="780" y1="88" x2="796" y2="88" />
        <line x1="695" y1="53" x2="683" y2="41" />
        <line x1="765" y1="123" x2="777" y2="135" />
        <line x1="765" y1="53" x2="777" y2="41" />
        <line x1="695" y1="123" x2="683" y2="135" />
      </g>

      {/* Shinka: castle */}
      <rect x="571" y="188" width="36" height="44" fill="#546E7A" rx="2" />
      <rect x="567" y="182" width="12" height="16" fill="#455A64" rx="1" />
      <rect x="593" y="182" width="12" height="16" fill="#455A64" rx="1" />
      <polygon points="567,182 579,168 591,182" fill="#37474F" />
      <polygon points="593,182 605,168 617,182" fill="#37474F" />
      <rect x="579" y="210" width="16" height="22" fill="#37474F" rx="1" />
      {/* mine */}
      <rect x="498" y="278" width="30" height="22" fill="#8D6E63" rx="2" />
      <polygon points="498,278 513,264 528,278" fill="#6D4C41" />
      <rect x="505" y="284" width="16" height="16" fill="#3E2723" rx="1" />
      {/* bridge */}
      <rect x="468" y="248" width="30" height="8" fill="#A1887F" rx="3" />
      <rect x="468" y="240" width="5" height="16" fill="#795548" rx="1" />
      <rect x="493" y="240" width="5" height="16" fill="#795548" rx="1" />
      {/* cave */}
      <ellipse cx="548" cy="350" rx="24" ry="15" fill="#263238" />
      <ellipse cx="548" cy="345" rx="18" ry="10" fill="#37474F" />
      {/* altar */}
      <rect x="590" y="332" width="34" height="14" fill="#B0BEC5" rx="2" />
      <rect x="596" y="320" width="22" height="12" fill="#90A4AE" rx="1" />
      <rect x="601" y="310" width="12" height="10" fill="#78909C" rx="1" />

      {/* Shinka: mystical stars */}
      <g fill="#E0E0E0" opacity="0.75" fontSize="15" fontFamily="sans-serif">
        <text x="540" y="158">✦</text>
        <text x="618" y="148">✧</text>
        <text x="570" y="144">✦</text>
        <text x="648" y="165">✧</text>
      </g>

      {/* Clouds — group 1 */}
      <g opacity="0.92">
        <ellipse cx="115" cy="78" rx="50" ry="24" fill="white" />
        <ellipse cx="145" cy="68" rx="38" ry="22" fill="white" />
        <ellipse cx="85" cy="73" rx="32" ry="20" fill="white" />
      </g>
      {/* Clouds — group 2 */}
      <g opacity="0.85">
        <ellipse cx="430" cy="58" rx="44" ry="20" fill="white" />
        <ellipse cx="458" cy="50" rx="33" ry="18" fill="white" />
        <ellipse cx="405" cy="55" rx="28" ry="17" fill="white" />
      </g>
      {/* Clouds — group 3 (small) */}
      <g opacity="0.78">
        <ellipse cx="255" cy="105" rx="35" ry="16" fill="white" />
        <ellipse cx="277" cy="98" rx="28" ry="15" fill="white" />
      </g>

      {/* Ship trail */}
      <path
        d="M42 430 Q88 390 140 350 Q165 330 178 318"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="9,7"
        opacity="0.65"
      />
      {/* Boat */}
      <path d="M18 442 Q42 432 66 442 Q60 455 24 455Z" fill="#E65100" />
      <path d="M18 442 Q42 426 66 442" fill="#FF8F00" />
      <line x1="42" y1="444" x2="42" y2="416" stroke="#5D4037" strokeWidth="2.5" />
      <polygon points="42,416 42,432 60,424" fill="white" opacity="0.9" />

      {/* Ocean creatures */}
      <text x="68" y="400" textAnchor="middle" fontSize="20" opacity="0.45">🐚</text>
      <text x="710" y="435" textAnchor="middle" fontSize="18" opacity="0.4">🐟</text>

      {/* Region labels */}
      <text x="196" y="318" textAnchor="middle" fill="#E65100" fontSize="11" fontWeight="bold" fontFamily="sans-serif" letterSpacing="1">はじまり</text>
      <text x="375" y="302" textAnchor="middle" fill="#1B5E20" fontSize="13" fontWeight="bold" fontFamily="sans-serif">きずなの里</text>
      <text x="562" y="312" textAnchor="middle" fill="#ECEFF1" fontSize="12" fontWeight="bold" fontFamily="sans-serif">しんかの里</text>
    </svg>
  )
}
