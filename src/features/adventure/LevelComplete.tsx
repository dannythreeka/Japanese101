import { getActiveProfileId } from '../../db'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPetState, getAdventureProgress } from '../../db'
import { finishLevel } from '../../db/level-sessions'
import { levelsData } from '../../data/loaders'
import { useAppStore } from '../../store/useAppStore'
import { useT } from '../../hooks/useT'
import PetAvatar from '../../components/PetAvatar'
import VictoryCutscene from './VictoryCutscene'
import { getStageInfo } from '../../lib/petEvolution'
import type { PetState } from '../../types'


export default function LevelComplete() {
  const [profileId] = useState(getActiveProfileId)
  const { levelId } = useParams<{ levelId: string }>()
  const navigate = useNavigate()
  const t = useT()
  const { adventureSession, clearAdventureSession } = useAppStore()
  const [pet, setPet] = useState<PetState | null>(null)
  const [stars, setStars] = useState<1 | 2 | 3>(1)
  const [bonusXp, setBonusXp] = useState(0)
  const level = levelsData().levels.find(l=>l.level_id===levelId) ?? null
  const [loadError, setLoadError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [revision, setRevision] = useState(0)
  const [hasNextLevel, setHasNextLevel] = useState(false)
  const [evolvedToStage, setEvolvedToStage] = useState<number | null>(null)
  const [showEvolutionAnim, setShowEvolutionAnim] = useState(false)
  const [showVictoryCutscene, setShowVictoryCutscene] = useState(false)
  const sessionId = adventureSession?.id
  useEffect(() => {
    let active = true
    void (async () => {
      if (!level || !levelId || !sessionId) throw new Error('No verified level session')
      const previous = await getPetState(profileId)
      const result = await finishLevel(profileId, sessionId, levelId)
      const [nextPet, progress] = await Promise.all([getPetState(profileId), getAdventureProgress(profileId)])
      if (!active) return
      setStars(result.stars); setBonusXp(result.receipt.xp); setPet(nextPet)
      setHasNextLevel(progress?.current_level_id !== levelId)
      if (!result.alreadyCompleted) {
        if (level.level_type === 'boss') setShowVictoryCutscene(true)
        if (nextPet && nextPet.evolutionStage > (previous?.evolutionStage ?? 0)) { setEvolvedToStage(nextPet.evolutionStage); setShowEvolutionAnim(level.level_type !== 'boss') }
      }
      setLoaded(true); setLoadError(false)
    })().catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [level, levelId, profileId, sessionId, revision])

  useEffect(() => {
    if (!showEvolutionAnim) return
    const timer = setTimeout(() => setShowEvolutionAnim(false), 2500)
    return () => clearTimeout(timer)
  }, [showEvolutionAnim])

  function goToMap() {
    clearAdventureSession()
    navigate('/adventure')
  }

  function goToNext() {
    clearAdventureSession()
    navigate('/adventure')
  }

  if (loadError) return <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"><p>{t('questionUnavailable')}</p><button className="min-h-16 px-6" onClick={() => { setLoadError(false); setRevision(r=>r+1) }}>{t('retry')}</button><button className="min-h-16 px-6" onClick={goToMap}>{t('levelCompleteBack')}</button></div>
  if (!loaded) return <p role="status">{t('loading')}</p>
  const starsDisplay = '★'.repeat(stars) + '☆'.repeat(3 - stars)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-200 to-sky-100 flex flex-col items-center justify-center px-4 gap-6">
      {showVictoryCutscene && (
        <VictoryCutscene
          evolvedToStage={evolvedToStage ?? (pet?.evolutionStage ?? 0)}
          petName={evolvedToStage !== null ? getStageInfo(evolvedToStage).name_ja : ''}
          onComplete={() => setShowVictoryCutscene(false)}
        />
      )}


      {/* Title */}
      <h1 className="text-4xl font-bold text-indigo-700">{t('levelCompleteTitle')}</h1>

      {/* Stars */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-5xl text-amber-400 tracking-widest">{starsDisplay}</span>
        <span className="text-lg font-bold text-amber-600">
          {t('levelCompleteStars').replace('{n}', String(stars))}
        </span>
        {stars === 3 && (
          <span className="text-sm text-indigo-600 font-semibold">{t('levelCompletePerfect')}</span>
        )}
      </div>

      {/* Pet */}
      {pet && (
        <div className="flex flex-col items-center gap-2">
          <PetAvatar pet={pet} size="lg" animate />
        </div>
      )}

      {/* XP bonus */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-gray-500">{t('levelCompleteBonus')}</span>
        <span className="text-3xl font-bold text-emerald-600">
          {t('levelCompleteXp').replace('{n}', String(bonusXp))}
        </span>
      </div>

      {/* Level name */}
      {level && <p className="text-base text-gray-600 text-center">{level.title_ja ?? level.title_zh}</p>}

      {/* Evolution animation overlay — unskippable, auto-dismiss 2.5s */}
      {showEvolutionAnim && evolvedToStage !== null && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 gap-4">
          <span className="text-9xl animate-bounce-in">
            {pet ? (
              <PetAvatar pet={pet} size="lg" animate />
            ) : null}
          </span>
          <p className="text-5xl font-black text-yellow-300 tracking-widest">{t('evolutionAnim')}</p>
          <p className="text-xl font-bold text-white">{getStageInfo(evolvedToStage).name_ja}</p>
          <p className="text-base text-yellow-100">{t('evolutionNewForm')}</p><button className="min-h-16 px-6 rounded-2xl bg-white" onClick={()=>setShowEvolutionAnim(false)}>{t('nextQuestion')}</button>
        </div>
      )}

      {/* Actions */}
      <div className="w-full max-w-sm flex flex-col gap-3 mt-2">
        {hasNextLevel && (
          <button
            type="button"
            onClick={goToNext}
            className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-xl font-bold shadow-lg transition-all"
          >
            {t('levelCompleteNext')}
          </button>
        )}
        <button
          type="button"
          aria-label={t('levelCompleteBackAria')}
          onClick={goToMap}
          className="w-full py-4 rounded-2xl bg-white/70 hover:bg-white active:scale-95 text-emerald-700 text-lg font-semibold shadow transition-all"
        >
          {t('levelCompleteBack')}
        </button>
      </div>
    </div>
  )
}
