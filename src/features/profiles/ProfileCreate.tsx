import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfile, setActiveProfileId } from '../../db'
import { useT } from '../../hooks/useT'
import { AVATAR_EMOJIS } from '../../types/profile'

export default function ProfileCreate() {
  const navigate = useNavigate()
  const t = useT()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState<string>(AVATAR_EMOJIS[0])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError(t('profileNameEmpty'))
      return
    }
    setSaving(true)
    try {
      const profile = await createProfile(trimmed, avatar)
      setActiveProfileId(profile.profile_id)
      navigate('/')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center px-4 pt-10 pb-8 gap-6">

      <button
        type="button"
        aria-label={t('backAria')}
        onClick={() => navigate('/profiles')}
        className="self-start text-emerald-700 font-bold text-base"
      >
        {t('back')}
      </button>

      <h1 className="text-2xl font-bold text-emerald-700">{t('profileCreateTitle')}</h1>

      {/* Avatar picker */}
      <div className="w-full max-w-xs flex flex-col gap-2">
        <p className="text-sm font-semibold text-gray-500">{t('profileAvatarLabel')}</p>
        <div className="grid grid-cols-4 gap-3">
          {AVATAR_EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              aria-label={emoji}
              aria-pressed={avatar === emoji}
              onClick={() => setAvatar(emoji)}
              className={`w-full aspect-square rounded-2xl text-4xl flex items-center justify-center transition-all ${
                avatar === emoji
                  ? 'bg-indigo-200 ring-4 ring-indigo-400 scale-105'
                  : 'bg-white/70 hover:bg-white active:scale-95'
              }`}
              style={{ minHeight: 64 }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Name input */}
      <div className="w-full max-w-xs flex flex-col gap-2">
        <label htmlFor="profile-name" className="text-sm font-semibold text-gray-500">
          {t('profileNameLabel')}
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder={t('profileNamePlaceholder')}
          maxLength={8}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-400 outline-none text-xl text-center font-bold bg-white/80"
          style={{ minHeight: 56 }}
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      {/* Selected avatar preview */}
      <div className="text-6xl">{avatar}</div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void handleSave()}
        className="w-full max-w-xs py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white text-xl font-bold shadow-lg transition-all disabled:opacity-60"
        style={{ minHeight: 64 }}
      >
        {t('profileSave')}
      </button>
    </div>
  )
}
