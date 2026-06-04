import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrCreatePet, getProfiles } from '../../db';
import { getOrCreateAdventureProgress } from '../../db';
import { useAppStore } from '../../store/useAppStore';
import { xpProgress, xpToNextLevel } from '../../lib/pet';
import PetAvatar from '../../components/PetAvatar';
import { useT } from '../../hooks/useT';
import { getFirstLevelId } from '../adventure/adventureEngine';
import { getAvatarEmoji } from '../../types/profile';
import type { PetState } from '../../types';
import type { AdventureProgress } from '../../types/adventure';
import type { Profile } from '../../types/profile';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { uiLang, setUiLang, activeProfileId } = useAppStore();
  const t = useT();
  const [pet, setPet] = useState<PetState | null>(null);
  const [adventureProgress, setAdventureProgress] =
    useState<AdventureProgress | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const firstId = getFirstLevelId();
    Promise.all([getOrCreatePet(), getOrCreateAdventureProgress(firstId)]).then(
      ([p, adv]) => {
        setPet(p);
        setAdventureProgress(adv);
      },
    );
    if (activeProfileId) {
      getProfiles().then((ps) => {
        setProfile(ps.find((p) => p.profile_id === activeProfileId) ?? null);
      });
    }
  }, [activeProfileId]);

  const hasStarted = adventureProgress
    ? Object.keys(adventureProgress.completed_levels).length > 0
    : false;

  const progressPct = pet ? Math.round(xpProgress(pet.xp) * 100) : 0;
  const toNext = pet ? xpToNextLevel(pet.xp) : 0;
  const xpLabel = t('xpToNext').replace('{n}', String(toNext));

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center px-4 pt-8 pb-6 gap-6">
      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-emerald-700">
            {t('appTitle')}
          </span>
          {profile && (
            <span className="text-sm text-emerald-600 font-medium">
              {getAvatarEmoji(profile.avatar_id)} {profile.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="言語切替 / 語言切換"
            onClick={() => setUiLang(uiLang === 'ja' ? 'zh' : 'ja')}
            className="h-10 px-3 rounded-full bg-white/70 text-sm font-bold flex items-center justify-center shadow hover:bg-white transition-colors text-gray-700"
          >
            {uiLang === 'ja' ? '繁中' : 'JP'}
          </button>
          <button
            type="button"
            aria-label={t('homeSettingsAria')}
            onClick={() => navigate('/parent')}
            className="w-10 h-10 rounded-full bg-white/70 text-xl flex items-center justify-center shadow hover:bg-white transition-colors"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Pet + XP */}
      <div className="flex flex-col items-center gap-3">
        {pet ? (
          <PetAvatar pet={pet} size="lg" animate />
        ) : (
          <div className="w-36 h-36 rounded-full bg-white/50 animate-pulse" />
        )}
        {pet && (
          <div className="w-full max-w-xs flex flex-col items-center gap-1">
            <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-emerald-700 font-medium">
              {xpLabel}
            </span>
          </div>
        )}
      </div>

      {/* Main action buttons */}
      <div className="w-full max-w-sm flex flex-col gap-4 mt-2">
        <button
          type="button"
          onClick={() => navigate('/adventure')}
          className="w-full py-5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-xl font-bold shadow-lg transition-all"
        >
          {hasStarted ? t('homeContinueAdventure') : t('homeStartAdventure')}
        </button>

        <button
          type="button"
          onClick={() => navigate('/play')}
          className="w-full py-4 rounded-2xl bg-white/70 hover:bg-white active:scale-95 text-gray-700 text-lg font-semibold shadow transition-all"
        >
          {t('homeFreePlay')}
        </button>

        <button
          type="button"
          onClick={() => navigate('/profiles')}
          className="w-full py-3 rounded-2xl bg-white/50 hover:bg-white/80 active:scale-95 text-gray-500 text-base font-medium shadow-sm transition-all"
        >
          ほかのプレイヤー
        </button>
      </div>
    </div>
  );
}
