import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import PetStage from '../../components/PetStage'
import { getStageInfo } from '../../lib/petEvolution'

interface Props {
  evolvedToStage: number
  petName: string       // stage name_ja
  onComplete: () => void
}

type Phase = 'boss-shake' | 'evolve' | 'victory'

export default function VictoryCutscene({ evolvedToStage, petName: _petName, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('boss-shake')
  const [showCard, setShowCard] = useState(false)
  const confettiRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [sunRotate, setSunRotate] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    // Phase 1 → Phase 2 after 1.5s
    const t1 = setTimeout(() => setPhase('evolve'), 1500)
    // Phase 2 → Phase 3 after 3.5s
    const t2 = setTimeout(() => {
      setPhase('victory')
      setShowCard(true)
      // Launch confetti bursts
      let burst = 0
      confettiRef.current = setInterval(() => {
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { x: Math.random(), y: 0.2 },
          colors: ['#FFD700', '#FF80CC', '#80FFCC', '#8080FF', '#FF8040'],
        })
        burst++
        if (burst >= 5 && confettiRef.current) {
          clearInterval(confettiRef.current)
          confettiRef.current = null
        }
      }, 600)
    }, 3500)

    // Sunburst rotation
    let rot = 0
    const animSun = () => {
      rot += 0.4
      setSunRotate(rot)
      rafRef.current = requestAnimationFrame(animSun)
    }
    rafRef.current = requestAnimationFrame(animSun)

    return () => {
      clearTimeout(t1); clearTimeout(t2)
      if (confettiRef.current) clearInterval(confettiRef.current)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const stageInfo = getStageInfo(evolvedToStage)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>

      {/* Phase 1: boss shake overlay */}
      {phase === 'boss-shake' && (
        <div className="flex flex-col items-center gap-6" style={{ animation: 'pet-shake 0.3s ease-in-out infinite' }}>
          {/* Boss silhouette dissolving */}
          <div style={{
            width: 180, height: 160,
            background: 'radial-gradient(ellipse at 50% 50%, #FFFFFF, #CCCCFF)',
            borderRadius: '50% 50% 40% 40% / 60% 60% 40% 40%',
            opacity: 0.7,
            filter: 'blur(2px)',
          }}/>
          <p className="text-4xl font-bold text-white" style={{ textShadow: '0 0 20px #FFFFFF' }}>
            ✨ 浄化！
          </p>
        </div>
      )}

      {/* Phase 2: evolution */}
      {phase === 'evolve' && (
        <div className="flex flex-col items-center gap-6">
          {/* Sunburst */}
          <div style={{ position: 'relative', width: 280, height: 280 }}>
            {/* Rotating rays */}
            <svg viewBox="0 0 280 280" style={{
              position: 'absolute', inset: 0,
              transform: `rotate(${sunRotate}deg)`,
              transformOrigin: '50% 50%',
            }}>
              {[...Array(12)].map((_, i) => (
                <line key={i}
                  x1={140 + Math.cos(i * 30 * Math.PI / 180) * 80}
                  y1={140 + Math.sin(i * 30 * Math.PI / 180) * 80}
                  x2={140 + Math.cos(i * 30 * Math.PI / 180) * 135}
                  y2={140 + Math.sin(i * 30 * Math.PI / 180) * 135}
                  stroke="#FFD700" strokeWidth="8" strokeLinecap="round" opacity="0.7"/>
              ))}
              <circle cx="140" cy="140" r="72" fill="#FFD700" opacity="0.12"/>
            </svg>
            {/* Pet centered */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'bounce-in 0.6s ease-out',
            }}>
              <div style={{
                width: 180, height: 180,
                background: '#FFFFFF',
                borderRadius: '50%',
                boxShadow: '0 0 40px #FFD700, 0 0 80px rgba(255,215,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'visible',
              }}>
                <PetStage stage={evolvedToStage} animate size={180}/>
              </div>
            </div>
          </div>
          <p className="text-5xl font-black text-yellow-300 tracking-widest"
            style={{ textShadow: '0 0 20px rgba(255,215,0,0.8)', animation: 'star-pop 0.5s ease-out' }}>
            しんか！
          </p>
          <p className="text-2xl font-bold text-white">
            {stageInfo.name_ja}
          </p>
        </div>
      )}

      {/* Phase 3: victory card */}
      {phase === 'victory' && showCard && (
        <div style={{
          width: '90%', maxWidth: 380,
          background: 'linear-gradient(135deg, #1a1060, #3a2080)',
          borderRadius: 28,
          border: '2px solid rgba(255,215,0,0.5)',
          boxShadow: '0 0 40px rgba(255,215,0,0.3)',
          padding: 32,
          animation: 'victory-slide-up 0.5s ease-out',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}>
          {/* Pet preview */}
          <div style={{
            width: 140, height: 140,
            background: '#FFFFFF',
            borderRadius: '50%',
            boxShadow: '0 0 30px #FFD700',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'visible',
          }}>
            <PetStage stage={evolvedToStage} animate size={140}/>
          </div>
          <p className="text-4xl font-black text-yellow-300">👑 MISSION CLEAR</p>
          <p className="text-xl font-bold text-white/90">✨ 成長能量全滿！</p>
          <p className="text-lg text-yellow-200/80">{stageInfo.name_ja} が仲間になった！</p>
          <button
            type="button"
            onClick={onComplete}
            className="mt-2 px-10 py-4 rounded-3xl text-white text-2xl font-bold shadow-lg active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', minWidth: 200, minHeight: 64 }}
          >
            つぎへ →
          </button>
        </div>
      )}
    </div>
  )
}
