import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrCreateAdventureProgress } from '../../db';
import { useT } from '../../hooks/useT';
import { useAppStore } from '../../store/useAppStore';
import { playSfx } from '../../lib/audio';
import {
  getSortedLevels,
  getLevelStatus,
  getFirstLevelId,
} from './adventureEngine';
import { levelsData } from '../../data/loaders';
import type {
  Level,
  LevelStatus,
  AdventureProgress,
} from '../../types/adventure';

function IslandBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="bg-ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
        </defs>
        {/* Ocean */}
        <rect width="1200" height="400" fill="url(#bg-ocean)" opacity="0.45" />
        {/* Island silhouettes */}
        <ellipse
          cx="600"
          cy="260"
          rx="490"
          ry="120"
          fill="#86efac"
          opacity="0.35"
        />
        <ellipse
          cx="600"
          cy="270"
          rx="430"
          ry="90"
          fill="#4ade80"
          opacity="0.25"
        />
        <ellipse
          cx="240"
          cy="310"
          rx="180"
          ry="60"
          fill="#86efac"
          opacity="0.2"
        />
        <ellipse
          cx="960"
          cy="305"
          rx="170"
          ry="55"
          fill="#86efac"
          opacity="0.2"
        />
        {/* Clouds */}
        <g opacity="0.75">
          <circle cx="100" cy="55" r="28" fill="white" />
          <circle cx="138" cy="48" r="22" fill="white" />
          <circle cx="82" cy="60" r="18" fill="white" />
          <circle cx="880" cy="50" r="32" fill="white" />
          <circle cx="928" cy="44" r="26" fill="white" />
          <circle cx="858" cy="56" r="20" fill="white" />
          <circle cx="500" cy="35" r="20" fill="white" />
          <circle cx="528" cy="30" r="16" fill="white" />
        </g>
        {/* Tree dots */}
        <circle cx="190" cy="220" r="11" fill="#16a34a" opacity="0.35" />
        <circle cx="350" cy="200" r="9" fill="#16a34a" opacity="0.35" />
        <circle cx="700" cy="210" r="9" fill="#16a34a" opacity="0.35" />
        <circle cx="870" cy="215" r="11" fill="#16a34a" opacity="0.35" />
        <circle cx="1020" cy="225" r="8" fill="#16a34a" opacity="0.35" />
        {/* Water glints */}
        <ellipse
          cx="80"
          cy="370"
          rx="70"
          ry="10"
          fill="#e0f2fe"
          opacity="0.4"
        />
        <ellipse
          cx="1100"
          cy="360"
          rx="80"
          ry="10"
          fill="#e0f2fe"
          opacity="0.4"
        />
        <ellipse
          cx="580"
          cy="380"
          rx="100"
          ry="8"
          fill="#e0f2fe"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

function levelNodeClass(status: LevelStatus, isBoss: boolean): string {
  const base =
    'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg transition-all select-none border-4';
  if (status === 'completed')
    return `${base} bg-amber-400 border-amber-600 text-white cursor-pointer hover:scale-110`;
  if (status === 'next') {
    const bossStyle = isBoss
      ? 'bg-purple-600 border-purple-800'
      : 'bg-indigo-500 border-indigo-700';
    return `${base} ${bossStyle} text-white animate-pulse cursor-pointer`;
  }
  return `${base} bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed opacity-60`;
}

function levelEmoji(level: Level, status: LevelStatus): string {
  if (level.level_type === 'boss') return '👹';
  if (level.level_type === 'tutorial') return '⭐';
  if (status === 'completed') return '✓';
  return String(level.level_number);
}

function starsDisplay(stars: 1 | 2 | 3): string {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars);
}

export default function AdventureMap() {
  const navigate = useNavigate();
  const t = useT();
  const { uiLang } = useAppStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLButtonElement | null>(null);
  const [progress, setProgress] = useState<AdventureProgress | null>(null);

  const levels = getSortedLevels();
  const { regions } = levelsData();

  useEffect(() => {
    getOrCreateAdventureProgress(getFirstLevelId()).then(setProgress);
  }, []);

  useEffect(() => {
    if (progress && currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [progress]);

  function handleLevelClick(level: Level, status: LevelStatus) {
    if (status === 'locked') {
      alert(t('mapLockedHint'));
      return;
    }
    playSfx('tap');
    navigate(`/adventure/level/${level.level_id}`);
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex items-center justify-center">
        <span className="text-emerald-700 text-lg">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col relative">
      <IslandBackground />

      {/* Top bar */}
      <div className="relative flex items-center gap-3 px-4 pt-6 pb-3 z-10">
        <button
          type="button"
          aria-label={t('mapBackAria')}
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-full bg-white/70 hover:bg-white text-emerald-700 font-bold shadow transition-colors text-sm"
        >
          {t('mapBack')}
        </button>
        <h1 className="text-2xl font-bold text-emerald-700">{t('mapTitle')}</h1>
      </div>

      {/* Horizontal scroll map */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-x-auto overflow-y-hidden px-6 py-4 z-10"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex items-center gap-0 min-w-max pb-8">
          {regions.map((region, rIdx) => {
            const regionLevels = levels.filter(
              (l) => l.region_id === region.region_id,
            );
            const regionUnlocked = regionLevels.some(
              (l) => getLevelStatus(l, progress) !== 'locked',
            );
            const regionName =
              uiLang === 'ja' && region.name_jp
                ? region.name_jp
                : region.name_zh;

            return (
              <div key={region.region_id} className="flex items-center gap-0">
                {/* Region label */}
                <div className="flex flex-col items-center mr-3 ml-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full mb-2 whitespace-nowrap ${
                      regionUnlocked
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    {regionUnlocked ? regionName : t('mapRegionLocked')}
                  </span>
                </div>

                {/* Level nodes for this region */}
                {regionLevels.map((level, lIdx) => {
                  const status = getLevelStatus(level, progress);
                  const isBoss = level.level_type === 'boss';
                  const completedRecord =
                    progress.completed_levels[level.level_id];
                  const isCurrentNode = status === 'next';
                  const titleDisplay =
                    uiLang === 'ja' && level.title_jp
                      ? level.title_jp
                      : level.title_zh;

                  return (
                    <div key={level.level_id} className="flex items-center">
                      {/* Connector path */}
                      {(lIdx > 0 || rIdx > 0) && (
                        <div className="w-8 h-1 bg-gray-300 rounded-full mx-1" />
                      )}

                      {/* Level node + label */}
                      <div className="flex flex-col items-center gap-1">
                        {/* Boss label */}
                        {isBoss && (
                          <span className="text-xs font-bold text-purple-700 mb-1">
                            {t('mapBossLabel')}
                          </span>
                        )}

                        <button
                          ref={isCurrentNode ? currentNodeRef : null}
                          type="button"
                          aria-label={titleDisplay}
                          className={levelNodeClass(status, isBoss)}
                          onClick={() => handleLevelClick(level, status)}
                        >
                          {levelEmoji(level, status)}
                        </button>

                        {/* Stars below completed node */}
                        {completedRecord && (
                          <span className="text-amber-500 text-xs leading-none">
                            {starsDisplay(completedRecord.stars)}
                          </span>
                        )}

                        {/* Level title */}
                        <span className="text-xs text-center text-gray-600 max-w-[72px] leading-tight">
                          {titleDisplay}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

