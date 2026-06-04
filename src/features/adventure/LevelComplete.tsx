import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrCreateAdventureProgress } from '../../db';
import { levelsData } from '../../data/loaders';
import { addXpToPet, evolveToStage } from '../../lib/pet';
import { useAppStore } from '../../store/useAppStore';
import { useT } from '../../hooks/useT';
import {
  computeStars,
  completeLevel,
  getFirstLevelId,
} from './adventureEngine';
import { playSfx } from '../../lib/audio';
import { getStageForLevel } from '../../data/petStages';
import PetAvatar from '../../components/PetAvatar';
import LevelUpModal from '../play/LevelUpModal';
import EvolutionScreen from './EvolutionScreen';
import type { Level } from '../../types/adventure';
import type { PetState } from '../../types';
import type { XpResult } from '../../lib/pet';

const COMPLETION_BONUS = 50;
const PERFECT_BONUS = 30;

/** B2: scale down XP for replays to reward first-time completion more */
function replayXpScale(timesPlayed: number): number {
  if (timesPlayed === 0) return 1.0; // first time
  if (timesPlayed === 1) return 0.5; // first replay
  if (timesPlayed === 2) return 0.25; // second replay
  return 0.1; // third+ replay
}

export default function LevelComplete() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const t = useT();
  const { adventureSession, clearAdventureSession } = useAppStore();
  const [pet, setPet] = useState<PetState | null>(null);
  const [xpResult, setXpResult] = useState<XpResult | null>(null);
  const [stars, setStars] = useState<1 | 2 | 3>(1);
  const [bonusXp, setBonusXp] = useState(0);
  const [level, setLevel] = useState<Level | null>(null);
  const [hasNextLevel, setHasNextLevel] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [evolvingFromStage, setEvolvingFromStage] = useState<number | null>(
    null,
  );
  const [evolvingToStage, setEvolvingToStage] = useState<number | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    const { levels } = levelsData();
    const found = levels.find((l) => l.level_id === levelId) ?? null;
    setLevel(found);
    if (!found) return;

    const results =
      adventureSession && adventureSession.levelId === levelId
        ? adventureSession.results
        : {};
    const earnedStars = computeStars(found, results);
    setStars(earnedStars);

    const bestAccuracy = Object.values(results).reduce(
      (max, r) => Math.max(max, r.accuracy),
      0,
    );

    // B2: load progress first so we can scale XP for replays
    getOrCreateAdventureProgress(getFirstLevelId()).then(async (progress) => {
      const timesPlayed =
        progress.completed_levels[found.level_id]?.times_played ?? 0;
      const rawBonus =
        COMPLETION_BONUS + (earnedStars === 3 ? PERFECT_BONUS : 0);
      const scaledBonus = Math.round(rawBonus * replayXpScale(timesPlayed));
      setBonusXp(scaledBonus);

      const [xpRes, updated] = await Promise.all([
        addXpToPet(scaledBonus),
        completeLevel(progress, found, earnedStars, bestAccuracy),
      ]);
      setPet(xpRes.pet);
      if (xpRes.leveledUp) setXpResult(xpRes);

      // PR5: check if this level triggers an evolution
      if (found.level_id) {
        const stageSpec = getStageForLevel(found.level_id);
        if (stageSpec && xpRes.pet.evolutionStage < stageSpec.stage) {
          const oldStage = xpRes.pet.evolutionStage;
          const evolved = await evolveToStage(stageSpec.stage);
          setPet(evolved);
          setEvolvingFromStage(oldStage);
          setEvolvingToStage(stageSpec.stage);
        }
      }

      const sortedIds = levelsData()
        .levels.sort((a, b) => a.level_number - b.level_number)
        .map((l) => l.level_id);
      const idx = sortedIds.indexOf(found.level_id);
      setHasNextLevel(
        idx >= 0 &&
          idx < sortedIds.length - 1 &&
          updated.current_level_id !== found.level_id,
      );
    });
  }, [levelId, adventureSession]); // eslint-disable-line react-hooks/exhaustive-deps

  function goToMap() {
    clearAdventureSession();
    navigate('/adventure');
  }

  // B3: short transition animation before navigating to next level
  function goToNext() {
    if (isTransitioning) return;
    playSfx('levelup');
    setIsTransitioning(true);
    setTimeout(() => {
      clearAdventureSession();
      navigate('/adventure');
    }, 1100);
  }

  const starsDisplay = '★'.repeat(stars) + '☆'.repeat(3 - stars);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-200 to-sky-100 flex flex-col items-center justify-center px-4 gap-6">
      {/* PR5: Evolution screen (shown before level complete UI) */}
      {evolvingToStage !== null && evolvingFromStage !== null && (
        <EvolutionScreen
          fromStage={evolvingFromStage}
          toStage={evolvingToStage}
          onComplete={() => {
            setEvolvingToStage(null);
            setEvolvingFromStage(null);
          }}
        />
      )}
      {/* B3: full-screen transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-indigo-500/95 pointer-events-none">
          <div className="text-7xl font-black text-white animate-bounce drop-shadow-lg">
            クリア！
          </div>
          <div
            className="text-5xl animate-spin"
            style={{ animationDuration: '0.6s' }}
          >
            ⭐
          </div>
          <div className="flex gap-3 text-4xl">
            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>
              ★
            </span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>
              ★
            </span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>
              ★
            </span>
          </div>
        </div>
      )}
      {xpResult?.leveledUp && (
        <LevelUpModal
          newLevel={xpResult.pet.level}
          evolvedToStage={xpResult.evolvedToStage}
          onClose={() => setXpResult(null)}
        />
      )}

      {/* Title */}
      <h1 className="text-4xl font-bold text-indigo-700">
        {t('levelCompleteTitle')}
      </h1>

      {/* Stars */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-5xl text-amber-400 tracking-widest">
          {starsDisplay}
        </span>
        <span className="text-lg font-bold text-amber-600">
          {t('levelCompleteStars').replace('{n}', String(stars))}
        </span>
        {stars === 3 && (
          <span className="text-sm text-indigo-600 font-semibold">
            {t('levelCompletePerfect')}
          </span>
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
      {level && (
        <p className="text-base text-gray-600 text-center">{level.title_zh}</p>
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
  );
}
