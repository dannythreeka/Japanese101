import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfiles, saveProfile } from '../../db';
import { useAppStore } from '../../store/useAppStore';
import { AVATAR_OPTIONS, getAvatarEmoji } from '../../types/profile';
import type { Profile } from '../../types/profile';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function ProfileSelect() {
  const navigate = useNavigate();
  const { setActiveProfileId } = useAppStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVATAR_OPTIONS[0].id);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfiles().then((ps) => {
      setProfiles(ps);
      setLoading(false);
      if (ps.length === 0) setCreating(true);
    });
  }, []);

  function selectProfile(profile: Profile) {
    const updated: Profile = {
      ...profile,
      last_played: new Date().toISOString(),
    };
    saveProfile(updated).then(() => {
      setActiveProfileId(profile.profile_id);
      navigate('/');
    });
  }

  async function createProfile() {
    const trimmedName = newName.trim();
    if (!trimmedName) return;
    const profile: Profile = {
      profile_id: generateId(),
      name: trimmedName,
      avatar_id: newAvatar,
      created_at: new Date().toISOString(),
      last_played: new Date().toISOString(),
    };
    await saveProfile(profile);
    setActiveProfileId(profile.profile_id);
    navigate('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex items-center justify-center">
        <span className="text-emerald-700 text-lg">よみこみちゅう…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center px-4 pt-10 pb-8 gap-6">
      <h1 className="text-4xl font-bold text-emerald-700 drop-shadow">
        だれですか？
      </h1>

      {/* Existing profiles */}
      {profiles.length > 0 && !creating && (
        <div className="flex flex-wrap justify-center gap-4 w-full max-w-md">
          {profiles.map((p) => (
            <button
              key={p.profile_id}
              type="button"
              onClick={() => selectProfile(p)}
              className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-white/80 shadow-lg hover:scale-105 active:scale-95 transition-all w-36"
            >
              <span className="text-5xl">{getAvatarEmoji(p.avatar_id)}</span>
              <span className="text-xl font-bold text-gray-700 truncate max-w-full">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Create new profile form */}
      {creating ? (
        <div className="w-full max-w-sm bg-white/90 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
          <h2 className="text-2xl font-bold text-gray-700 text-center">
            あたらしいプレイヤー
          </h2>

          {/* Name input */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="profile-name"
              className="text-lg text-gray-600 font-medium"
            >
              なまえ
            </label>
            <input
              id="profile-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void createProfile()}
              placeholder="なまえをいれてね"
              maxLength={12}
              className="w-full px-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-400 outline-none text-xl text-gray-700"
              autoFocus
            />
          </div>

          {/* Avatar selection */}
          <div className="flex flex-col gap-2">
            <p className="text-lg text-gray-600 font-medium">なかま</p>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  aria-label={av.id}
                  onClick={() => setNewAvatar(av.id)}
                  className={`h-16 rounded-2xl text-4xl flex items-center justify-center transition-all ${av.bg} ${
                    newAvatar === av.id
                      ? 'ring-4 ring-emerald-400 scale-110 shadow-md'
                      : 'hover:scale-105'
                  }`}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {profiles.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCreating(false);
                  setNewName('');
                }}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200 transition-colors"
              >
                もどる
              </button>
            )}
            <button
              type="button"
              onClick={() => void createProfile()}
              disabled={!newName.trim()}
              className="flex-1 py-3 rounded-2xl bg-emerald-400 disabled:opacity-40 text-white font-bold text-lg active:scale-95 transition-all hover:bg-emerald-500"
            >
              はじめる！
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="w-full max-w-xs py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-500 active:scale-95 text-white text-xl font-bold shadow-lg transition-all"
        >
          ➕ あたらしく
        </button>
      )}

      {/* Parent area */}
      <button
        type="button"
        onClick={() => navigate('/parent')}
        className="mt-auto py-3 px-6 rounded-2xl bg-white/70 hover:bg-white text-gray-600 font-semibold text-lg shadow transition-colors"
      >
        ⚙ おうちのひと
      </button>
    </div>
  );
}
