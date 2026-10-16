import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useT } from '../hooks/useT'
import { db, getRecentSessions } from '../db'
import { claimDailyTask } from '../db/profile-data'
import {
  getTodayTasks, filterTodaySessions, computeProgress,
  todayKey,
} from '../lib/dailyTasks'
import type { DailyTask } from '../lib/dailyTasks'
import type { SessionRecord } from '../types'

const BONUS_STARS = 5

interface TaskRowProps {
  task: DailyTask
  progress: number
  completed: boolean
  justRewarded: boolean
}

function TaskRow({ task, progress, completed, justRewarded }: TaskRowProps) {
  const pct = Math.min(100, Math.round((progress / task.target) * 100))
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl w-8 text-center">{task.icon}</span>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-base text-gray-700 font-medium">{task.descriptionJa}</span>
          {justRewarded && (
            <span className="text-sm font-bold text-yellow-500 animate-star-pop">
              +{BONUS_STARS}⭐
            </span>
          )}
          {completed && !justRewarded && (
            <span className="text-sm font-bold text-emerald-500">✅</span>
          )}
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completed ? 'bg-emerald-400' : 'bg-yellow-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-gray-400">
          {Math.min(progress, task.target)} / {task.target}
        </span>
      </div>
    </div>
  )
}

export default function DailyTasksPanel() {
  const profileId = useAppStore(s => s.profileId)
  const t = useT()
  const [tasks] = useState(() => getTodayTasks())
  const [loadError, setLoadError] = useState(false)
  const [revision, setRevision] = useState(0)
  const [todaySessions, setTodaySessions] = useState<SessionRecord[]>([])
  const [completedToday, setCompletedToday] = useState<string[]>([])
  const [justRewarded, setJustRewarded] = useState<string[]>([])
  const rewarded = useRef<Set<string>>(new Set<string>())

  useEffect(() => {
    let active = true
    const timers: ReturnType<typeof setTimeout>[] = []
    void (async () => {
      const [sessions, claims] = await Promise.all([getRecentSessions(profileId, 500), db.dailyClaims.where('profileId').equals(profileId).toArray()])
      if (!active) return
      const today = filterTodaySessions(sessions)
      const completed = claims.filter(c => c.date === todayKey()).map(c => c.taskId)
      setTodaySessions(today); setCompletedToday(completed)
      rewarded.current = new Set(completed)
      for (const task of tasks) {
        if (computeProgress(task, today) < task.target || rewarded.current.has(task.id)) continue
        if (await claimDailyTask(profileId, todayKey(), task.id, BONUS_STARS)) {
          if (!active) return
          rewarded.current.add(task.id)
          setCompletedToday(prev => [...prev, task.id]); setJustRewarded(prev => [...prev, task.id])
          const wallet = await db.wallets.get(profileId)
          if (useAppStore.getState().profileId === profileId) useAppStore.setState({ totalStars: wallet?.stars ?? 0 })
          timers.push(setTimeout(() => { if (active) setJustRewarded(prev => prev.filter(id => id !== task.id)) }, 2000))
        }
      }
    })().catch(() => { if (active) setLoadError(true) })
    return () => { active = false; timers.forEach(clearTimeout) }
  }, [tasks, profileId, revision])

  if (loadError) return <div role="alert"><p>{t('questionUnavailable')}</p><button className="min-h-16 px-6" onClick={() => { setLoadError(false); setRevision(r => r + 1) }}>{t('retry')}</button></div>

  return (
    <div className="w-full max-w-sm bg-white/80 rounded-3xl shadow-md p-4 flex flex-col gap-4">
      <p className="text-lg font-bold text-gray-500 text-center">{t('dailyTasks')}</p>
      {tasks.map(task => (
        <TaskRow
          key={task.id}
          task={task}
          progress={computeProgress(task, todaySessions)}
          completed={completedToday.includes(task.id)}
          justRewarded={justRewarded.includes(task.id)}
        />
      ))}
    </div>
  )
}
