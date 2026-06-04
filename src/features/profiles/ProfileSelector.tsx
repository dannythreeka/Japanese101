import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProfiles, setActiveProfileId, updateProfileLastPlayed } from '../../db'
import { useT } from '../../hooks/useT'
import type { Profile } from '../../types/profile'

export default function ProfileSelector() {
  const navigate = useNavigate()
  const t = useT()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllProfiles().then(p => {
      setProfiles(p)
      setLoading(false)
    })
  }, [])

  function handleSelect(profile: Profile) {
    setActiveProfileId(profile.profile_id)
    void updateProfileLastPlayed(profile.profile_id)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col items-center px-4 pt-10 pb-8 gap-6">

      <h1 className="text-3xl font-bold text-emerald-700">{t('profileWho')}</h1>

      {loading ? (
        <div className="text-gray-500 mt-8">{t('loading')}</div>
      ) : (
        <div className="w-full max-w-sm flex flex-col gap-3">
          {profiles.map(profile => (
            <button
              key={profile.profile_id}
              type="button"
              aria-label={profile.name}
              onClick={() => handleSelect(profile)}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/80 hover:bg-white active:scale-95 shadow transition-all"
              style={{ minHeight: 72 }}
            >
              <span className="text-5xl leading-none">{profile.avatar_emoji}</span>
              <span className="text-xl font-bold text-gray-700">{profile.name}</span>
            </button>
          ))}

          <button
            type="button"
            aria-label={t('profileAddNewAria')}
            onClick={() => navigate('/profiles/new')}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-indigo-100 hover:bg-indigo-200 active:scale-95 border-2 border-dashed border-indigo-300 shadow transition-all"
            style={{ minHeight: 72 }}
          >
            <span className="text-4xl leading-none">➕</span>
            <span className="text-lg font-semibold text-indigo-600">{t('profileAddNew')}</span>
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label={t('profileParentBtnAria')}
        onClick={() => navigate('/parent')}
        className="mt-2 px-5 py-3 rounded-full bg-white/60 hover:bg-white/90 text-gray-600 text-base font-medium shadow transition-all"
        style={{ minHeight: 48 }}
      >
        {t('profileParentBtn')}
      </button>
    </div>
  )
}
