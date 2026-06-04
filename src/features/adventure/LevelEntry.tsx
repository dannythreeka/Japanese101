import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrCreateAdventureProgress } from '../../db';
import { levelsData } from '../../data/loaders';
import { useAppStore } from '../../store/useAppStore';
import { useT } from '../../hooks/useT';
import { getFirstLevelId, getLevelStatus } from './adventureEngine';
import { SCENE_REGISTRY } from '../kotodama/scenes';
import type { Level, AdventureProgress } from '../../types/adventure';
import type { GameModeId } from '../../types';

const GAME_MODE_LABEL: Record<string, string> = {
  kana_catch_listen: '🫧 かな キャッチ (きく)',
  kana_catch_minimal_pair: '🫧 かな キャッチ (くらべ)',
  kana_catch_word_to_image: '🫧 かな キャッチ (えあわせ)',
  dakuten_drag: '✏️ だくてん ドラッグ',
  kotodama_summon: '✨ ことだま しょうかん',
  karaoke_rhythm: '🎤 カラオケ リズム',
  echo_record: '🎙️ エコー レコード',
  write_canvas: '✍️ かな かいてみよう',
};

const GAME_ROUTES: Record<string, string> = {
  kana_catch_listen: '/play/kana-catch',
  kana_catch_minimal_pair: '/play/kana-catch',
  kana_catch_word_to_image: '/play/kana-catch',
  dakuten_drag: '/play/dakuten-drag',
  kotodama_summon: '/play/kotodama',
  write_canvas: '/play/kana-write',
  karaoke_rhythm: '/play/kana-catch',
  echo_record: '/play/kana-catch',
};

export default function LevelEntry() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { uiLang } = useAppStore();
  const t = useT();
  const { adventureSession, initAdventureSession, launchChallenge } =
    useAppStore();
  const [level, setLevel] = useState<Level | null>(null);
  const [progress, setProgress] = useState<AdventureProgress | null>(null);

  useEffect(() => {
    const { levels } = levelsData();
    const found = levels.find((l) => l.level_id === levelId) ?? null;
    setLevel(found);
    getOrCreateAdventureProgress(getFirstLevelId()).then((adv) => {
      setProgress(adv);
      if (found && levelId) initAdventureSession(levelId);
    });
  }, [levelId, initAdventureSession]);

  if (!level || !progress) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex items-center justify-center">
        <span className="text-emerald-700 text-lg">{t('loading')}</span>
      </div>
    );
  }

  const status = getLevelStatus(level, progress);
  const completedRecord = progress.completed_levels[level.level_id];
  const BossScene =
    level.level_type === 'boss' ? SCENE_REGISTRY['shizuka_kage'] : null;
  const sessionResults =
    adventureSession && adventureSession.levelId === levelId
      ? adventureSession.results
      : {};

  const requiredChallenges = level.challenges.filter(
    (c) => c.required_for_completion !== false,
  );
  const allRequiredDone = requiredChallenges.every(
    (c) => sessionResults[c.challenge_id] !== undefined,
  );

  function startChallenge(
    challengeId: string,
    gameMode: GameModeId,
    configOverrides: Record<string, unknown>,
  ) {
    launchChallenge(challengeId, gameMode, configOverrides);
    const route = GAME_ROUTES[gameMode] ?? '/play';
    navigate(route);
  }

  function finishLevel() {
    navigate(`/adventure/level/${levelId}/complete`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center px-4 pt-6 pb-8 gap-4">
      {/* Back */}
      <div className="w-full max-w-sm flex items-center">
        <button
          type="button"
          aria-label={t('levelBackAria')}
          onClick={() => navigate('/adventure')}
          className="px-4 py-2 rounded-full bg-white/70 hover:bg-white text-emerald-700 font-bold shadow transition-colors text-sm"
        >
          {t('levelBack')}
        </button>
      </div>

      {/* Boss scene illustration */}
      {BossScene && (
        <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg">
          <BossScene success={status === 'completed'} />
        </div>
      )}

      {/* Level header */}
      <div className="w-full max-w-sm bg-white/80 rounded-2xl p-5 shadow flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {level.level_type === 'boss' && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {t('mapBossLabel')}
            </span>
          )}
          <h1 className="text-xl font-bold text-gray-800">
            {uiLang === 'ja' && level.title_jp
              ? level.title_jp
              : level.title_zh}
          </h1>
        </div>
        {(uiLang === 'ja'
          ? (level.subtitle_jp ?? level.subtitle_zh)
          : level.subtitle_zh) && (
          <p className="text-sm text-gray-500">
            {uiLang === 'ja' && level.subtitle_jp
              ? level.subtitle_jp
              : level.subtitle_zh}
          </p>
        )}
        {(uiLang === 'ja'
          ? (level.story_intro_jp ?? level.story_intro_zh)
          : level.story_intro_zh) && (
          <p className="text-sm text-indigo-700 italic border-l-2 border-indigo-300 pl-3 mt-1">
            {uiLang === 'ja' && level.story_intro_jp
              ? level.story_intro_jp
              : level.story_intro_zh}
          </p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          <span>
            {t('levelXpLabel')}:{' '}
            <strong className="text-emerald-600">+{level.xp_reward}</strong>
          </span>
          {completedRecord && (
            <span>
              {t('levelStarsLabel')}:{' '}
              <strong className="text-amber-500">
                {'★'.repeat(completedRecord.stars)}
                {'☆'.repeat(3 - completedRecord.stars)}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {level.challenges.length > 0 && (
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
            <span>{t('levelChallengesTitle')}</span>
            <span>
              {Object.keys(sessionResults).length} / {level.challenges.length}
            </span>
          </div>
          <div className="h-2 bg-white/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-400 rounded-full transition-all duration-500"
              style={{
                width: `${(Object.keys(sessionResults).length / level.challenges.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Challenges list */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        {level.challenges.map((ch) => {
          const done = sessionResults[ch.challenge_id] !== undefined;
          const accuracy = sessionResults[ch.challenge_id]?.accuracy;

          return (
            <div
              key={ch.challenge_id}
              className={`bg-white/80 rounded-xl px-4 py-3 shadow flex items-center justify-between gap-3 ${done ? 'opacity-80' : ''}`}
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-sm text-gray-700 truncate">
                  {GAME_MODE_LABEL[ch.game_mode] ?? ch.game_mode}
                </span>
                {done && accuracy !== undefined && (
                  <span className="text-xs text-emerald-600">
                    {Math.round(accuracy * 100)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    ch.required_for_completion !== false
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {ch.required_for_completion !== false
                    ? t('levelChallengeRequired')
                    : t('levelChallengeOptional')}
                </span>
                {done ? (
                  <span className="text-emerald-600 font-bold text-sm">
                    {t('levelChallengeDone')}
                  </span>
                ) : ch.game_mode === 'echo_record' ? (
                  <span className="text-xs text-gray-400 px-3 py-1.5 rounded-lg bg-gray-100">
                    {t('comingSoon')}
                  </span>
                ) : status !== 'locked' ? (
                  <button
                    type="button"
                    onClick={() =>
                      startChallenge(
                        ch.challenge_id,
                        ch.game_mode as GameModeId,
                        ch.config_overrides ?? {},
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-sm font-bold transition-all"
                  >
                    {t('levelChallengePlay')}
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">🔒</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Finish Level button */}
      <div className="w-full max-w-sm mt-auto">
        {allRequiredDone ? (
          <button
            type="button"
            onClick={finishLevel}
            className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xl font-bold shadow-lg transition-all"
          >
            {t('levelFinishBtn')}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-4 rounded-2xl bg-indigo-300 text-white text-xl font-bold shadow transition-all opacity-50 cursor-not-allowed"
          >
            {t('levelStartBtn')}
          </button>
        )}
      </div>
    </div>
  );
}
