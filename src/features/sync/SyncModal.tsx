import { useState } from 'react'
import { useT } from '../../hooks/useT'
import { login, setSyncToken, clearSyncToken, getSyncToken, pushSync, pullSync } from '../../lib/cloudSync'

type Phase = 'idle' | 'login' | 'syncing' | 'done'
type SyncAction = 'push' | 'pull'

interface Props {
  onClose: () => void
}

export default function SyncModal({ onClose }: Props) {
  const t = useT()
  const [phase, setPhase] = useState<Phase>(getSyncToken() ? 'idle' : 'login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [lastAction, setLastAction] = useState<SyncAction | null>(null)
  const [resultMsg, setResultMsg] = useState('')

  async function handleLogin() {
    setLoginError(false)
    const token = await login(username, password)
    if (!token) { setLoginError(true); return }
    setSyncToken(token)
    setPhase('idle')
  }

  async function handleSync(action: SyncAction) {
    setLastAction(action)
    setPhase('syncing')
    const result = action === 'push' ? await pushSync() : await pullSync()
    if (result === 'auth') {
      clearSyncToken()
      setPhase('login')
      return
    }
    if (result === 'nodata') {
      setResultMsg(t('syncNoData'))
    } else if (result === 'ok') {
      setResultMsg(action === 'push' ? t('syncPushOk') : t('syncPullOk'))
    } else {
      setResultMsg(t('syncError'))
    }
    setPhase('done')
  }

  function handleLogout() {
    clearSyncToken()
    setUsername('')
    setPassword('')
    setPhase('login')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{t('syncTitle')}</h2>
          <button
            type="button"
            aria-label={t('syncCloseAria')}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {phase === 'login' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">{t('syncLoginDesc')}</p>
            <input
              type="text"
              autoComplete="username"
              placeholder={t('syncUsernamePlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400"
            />
            <input
              type="password"
              autoComplete="current-password"
              placeholder={t('syncPasswordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleLogin() }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-400"
            />
            {loginError && (
              <p className="text-xs text-rose-500">{t('syncLoginError')}</p>
            )}
            <button
              type="button"
              onClick={() => void handleLogin()}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold transition-all"
            >
              {t('syncLoginBtn')}
            </button>
          </div>
        )}

        {phase === 'idle' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-500">{t('syncIdleDesc')}</p>
            <button
              type="button"
              onClick={() => void handleSync('push')}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold transition-all"
            >
              {t('syncPushBtn')}
            </button>
            <button
              type="button"
              onClick={() => void handleSync('pull')}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold transition-all"
            >
              {t('syncPullBtn')}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-600 text-center mt-1 transition-colors"
            >
              {t('syncLogout')}
            </button>
          </div>
        )}

        {phase === 'syncing' && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-300 border-t-indigo-600 animate-spin" />
            <p className="text-sm text-gray-500">
              {lastAction === 'push' ? t('syncPushing') : t('syncPulling')}
            </p>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-4 py-2">
            <p className="text-base font-semibold text-gray-700 text-center">{resultMsg}</p>
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold transition-all"
            >
              {t('syncDoneBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
