import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrCreateAdventureProgress, saveAdventureProgress } from '../../db'
import { useT } from '../../hooks/useT'
import { getSortedLevels, getLevelStatus, getFirstLevelId, ensureValidProgress } from './adventureEngine'
import { levelsData } from '../../data/loaders'
import IslandMapBg from './IslandMapBg'
import type { Level, LevelStatus, AdventureProgress } from '../../types/adventure'

// ── Layout constants ────────────────────────────────────────────────────────
const COLS     = 4    // nodes per row
const COL_W    = 110  // horizontal spacing (center-to-center)
const ROW_H    = 160  // vertical spacing
const PAD_X    = 80   // left/right padding
const PAD_Y    = 100  // top/bottom padding
const NODE_SZ  = 64   // button diameter
const MIN_SCALE = 0.35
const MAX_SCALE = 2.5
const DRAG_THRESHOLD = 6

function nodePos(index: number) {
  const row = Math.floor(index / COLS)
  const col = index % COLS
  // Even rows: left→right; odd rows: right→left (snake path)
  const xCol = row % 2 === 0 ? col : (COLS - 1 - col)
  return { x: PAD_X + xCol * COL_W, y: PAD_Y + row * ROW_H }
}

// ── Styling helpers ─────────────────────────────────────────────────────────
function levelNodeClass(status: LevelStatus, isBoss: boolean): string {
  const base = 'flex items-center justify-center text-2xl font-bold shadow-lg transition-transform select-none border-4 rounded-full'
  if (status === 'completed') return `${base} bg-amber-400 border-amber-600 text-white`
  if (status === 'next')
    return `${base} ${isBoss ? 'bg-purple-600 border-purple-800' : 'bg-indigo-500 border-indigo-700'} text-white animate-pulse`
  return `${base} bg-gray-300/80 border-gray-400 text-gray-500 opacity-60`
}

function levelEmoji(level: Level, status: LevelStatus): string {
  if (level.level_type === 'boss')     return '👹'
  if (level.level_type === 'tutorial') return '⭐'
  if (status === 'completed')          return '✓'
  return String(level.level_number)
}

function starsStr(stars: 1 | 2 | 3) {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars)
}

interface View { x: number; y: number; scale: number }

// ── Component ───────────────────────────────────────────────────────────────
export default function AdventureMap() {
  const navigate = useNavigate()
  const t = useT()
  const [progress, setProgress] = useState<AdventureProgress | null>(null)
  const [view, setView] = useState<View>({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)

  const levels  = useMemo(() => getSortedLevels(), [])
  const { regions } = levelsData()

  const containerRef = useRef<HTMLDivElement>(null)
  // Single-touch drag state
  const drag = useRef({ active: false, moved: false, startX: 0, startY: 0, viewX: 0, viewY: 0 })
  // Two-finger pinch state
  const pinch = useRef<{
    startDist: number; startScale: number
    midX: number; midY: number
    viewX: number; viewY: number
  } | null>(null)

  const totalRows = Math.ceil(levels.length / COLS)
  const MAP_W = PAD_X * 2 + (COLS - 1) * COL_W   // 490
  const MAP_H = PAD_Y * 2 + (totalRows - 1) * ROW_H

  function clamp(s: number) { return Math.max(MIN_SCALE, Math.min(MAX_SCALE, s)) }

  function viewCenteredOn(idx: number): View {
    const pos = nodePos(Math.max(0, idx))
    const vw = containerRef.current?.clientWidth  ?? window.innerWidth
    const vh = containerRef.current?.clientHeight ?? window.innerHeight - 60
    return { x: vw / 2 - pos.x, y: vh / 2 - pos.y, scale: 1 }
  }

  // ── Load progress + initial centering ──────────────────────────────────────
  useEffect(() => {
    getOrCreateAdventureProgress(getFirstLevelId()).then(async (p) => {
      const fixed = ensureValidProgress(levels, p)
      if (fixed !== p) await saveAdventureProgress(fixed)
      setProgress(fixed)
    })
  }, [levels])

  useEffect(() => {
    if (!progress) return
    const idx = levels.findIndex((l) => getLevelStatus(l, progress) === 'next')
    setView(viewCenteredOn(idx >= 0 ? idx : 0))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress])

  // ── Pointer drag ────────────────────────────────────────────────────────────
  function onPointerDown(e: React.PointerEvent) {
    if (pinch.current) return // pinch in progress
    drag.current = {
      active: true, moved: false,
      startX: e.clientX, startY: e.clientY,
      viewX: view.x,     viewY: view.y,
    }
    setIsDragging(true)
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    if (!drag.current.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) drag.current.moved = true
    if (drag.current.moved)
      setView((v) => ({ ...v, x: drag.current.viewX + dx, y: drag.current.viewY + dy }))
  }

  function onPointerUp() {
    drag.current.active = false
    setIsDragging(false)
  }

  // ── Mouse-wheel zoom ────────────────────────────────────────────────────────
  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    const factor = Math.pow(0.999, e.deltaY)
    const rect = containerRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    setView((v) => {
      const ns = clamp(v.scale * factor)
      const r  = ns / v.scale
      return { scale: ns, x: mx - r * (mx - v.x), y: my - r * (my - v.y) }
    })
  }

  // ── Pinch zoom ──────────────────────────────────────────────────────────────
  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 2) return
    e.preventDefault()
    drag.current.active = false
    setIsDragging(false)
    const t0 = e.touches[0], t1 = e.touches[1]
    const rect = containerRef.current?.getBoundingClientRect()
    pinch.current = {
      startDist:  Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY),
      startScale: view.scale,
      midX: (t0.clientX + t1.clientX) / 2 - (rect?.left ?? 0),
      midY: (t0.clientY + t1.clientY) / 2 - (rect?.top  ?? 0),
      viewX: view.x,
      viewY: view.y,
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (e.touches.length !== 2 || !pinch.current) return
    e.preventDefault()
    const t0 = e.touches[0], t1 = e.touches[1]
    const rect = containerRef.current?.getBoundingClientRect()
    const newDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY)
    const midX = (t0.clientX + t1.clientX) / 2 - (rect?.left ?? 0)
    const midY = (t0.clientY + t1.clientY) / 2 - (rect?.top  ?? 0)
    const { startDist, startScale, midX: pMidX, midY: pMidY, viewX, viewY } = pinch.current
    const ns = clamp(startScale * newDist / startDist)
    const r  = ns / startScale
    setView({ scale: ns, x: midX - r * (pMidX - viewX), y: midY - r * (pMidY - viewY) })
  }

  function onTouchEnd() { pinch.current = null }

  // ── Level tap ───────────────────────────────────────────────────────────────
  function handleLevelTap(level: Level, status: LevelStatus) {
    if (drag.current.moved) return   // was a pan, not a tap
    if (status === 'locked') return
    navigate(`/adventure/level/${level.level_id}`)
  }

  // Re-center on active level
  function centerOnCurrent() {
    if (!progress) return
    const idx = levels.findIndex((l) => getLevelStatus(l, progress) === 'next')
    setView(viewCenteredOn(idx >= 0 ? idx : 0))
  }

  // ── SVG path (snake polyline) ───────────────────────────────────────────────
  const pathStr = levels.map((_, i) => { const p = nodePos(i); return `${p.x},${p.y}` }).join(' ')

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!progress) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <IslandMapBg />
        <span className="relative z-10 text-emerald-700 text-lg bg-white/60 px-4 py-2 rounded-full">
          {t('loading')}
        </span>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <IslandMapBg />

      {/* Top bar — fixed, outside pan area */}
      <div className="relative z-20 flex items-center gap-3 px-4 pt-6 pb-3">
        <button
          type="button"
          aria-label={t('mapBackAria')}
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-full bg-white/80 hover:bg-white text-emerald-700 font-bold shadow transition-colors text-sm"
        >
          {t('mapBack')}
        </button>
        <h1 className="text-2xl font-bold text-emerald-800 drop-shadow">{t('mapTitle')}</h1>
      </div>

      {/* ── Pan / zoom viewport ─────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative z-10 flex-1 overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none', userSelect: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Transform layer */}
        <div
          style={{
            position: 'absolute',
            transformOrigin: '0 0',
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            width: MAP_W,
            height: MAP_H,
          }}
        >
          {/* SVG connector path */}
          <svg
            width={MAP_W}
            height={MAP_H}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            aria-hidden="true"
          >
            {/* glow */}
            <polyline points={pathStr} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            {/* dashed indigo path */}
            <polyline points={pathStr} fill="none" stroke="#a5b4fc" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="10 7" />
          </svg>

          {/* Region labels */}
          {regions.map((region) => {
            const firstIdx = levels.findIndex((l) => l.region_id === region.region_id)
            if (firstIdx < 0) return null
            const pos = nodePos(firstIdx)
            const unlocked = levels
              .filter((l) => l.region_id === region.region_id)
              .some((l) => getLevelStatus(l, progress) !== 'locked')
            return (
              <div
                key={region.region_id}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y - NODE_SZ / 2 - 30,
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm ${
                  unlocked ? 'bg-emerald-500 text-white' : 'bg-white/50 text-gray-400'
                }`}>
                  {unlocked ? (region.name_ja ?? region.name_zh) : t('mapRegionLocked')}
                </span>
              </div>
            )
          })}

          {/* Level nodes */}
          {levels.map((level, i) => {
            const pos    = nodePos(i)
            const status = getLevelStatus(level, progress)
            const isBoss = level.level_type === 'boss'
            const rec    = progress.completed_levels[level.level_id]

            return (
              <div
                key={level.level_id}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                {/* Boss label above node */}
                {isBoss && (
                  <span className="text-xs font-bold text-purple-700 bg-white/85 px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm"
                    style={{ marginBottom: 2 }}>
                    {t('mapBossLabel')}
                  </span>
                )}

                <button
                  type="button"
                  aria-label={level.title_ja ?? level.title_zh}
                  className={levelNodeClass(status, isBoss)}
                  style={{ width: NODE_SZ, height: NODE_SZ, flexShrink: 0 }}
                  onClick={() => handleLevelTap(level, status)}
                >
                  {levelEmoji(level, status)}
                </button>

                {rec && (
                  <span className="text-amber-500 text-xs leading-none">{starsStr(rec.stars)}</span>
                )}

                <span className="text-xs text-center text-gray-700 font-medium leading-tight bg-white/65 rounded-md px-1.5 py-0.5"
                  style={{ maxWidth: 84, pointerEvents: 'none' }}>
                  {level.title_ja ?? level.title_zh}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Re-center button */}
      <button
        type="button"
        aria-label={t('mapCenterAria')}
        onClick={centerOnCurrent}
        className="absolute bottom-6 right-5 z-20 w-12 h-12 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center text-xl transition-all active:scale-90"
      >
        🎯
      </button>
    </div>
  )
}
