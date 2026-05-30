import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { getRecentSessions } from '../db'
import {
  getTodayTasks, filterTodaySessions, computeProgress,
  getCompletedToday, markCompleted,
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
  const { addStars } = useAppStore()
  const [tasks] = useState(() => getTodayTasks())
  const [todaySessions, setTodaySessions] = useState<SessionRecord[]>([])
  const [completedToday, setCompletedToday] = useState<string[]>(() => getCompletedToday())
  const [justRewarded, setJustRewarded] = useState<string[]>([])
  const rewarded = useRef<Set<string>>(new Set(getCompletedToday()))

  useEffect(() => {
    getRecentSessions(50).then(sessions => {
      const today = filterTodaySessions(sessions)
      setTodaySessions(today)

      // Check for newly completed tasks
      for (const task of tasks) {
        if (rewarded.current.has(task.id)) continue
        const progress = computeProgress(task, today)
        if (progress >= task.target) {
          rewarded.current.add(task.id)
          markCompleted(task.id)
          addStars(BONUS_STARS)
          setCompletedToday(getCompletedToday())
          setJustRewarded(prev => [...prev, task.id])
          setTimeout(() => setJustRewarded(prev => prev.filter(id => id !== task.id)), 2000)
        }
      }
    })
  }, [tasks, addStars])

  return (
    <div className="w-full max-w-sm bg-white/80 rounded-3xl shadow-md p-4 flex flex-col gap-4">
      <p className="text-lg font-bold text-gray-500 text-center">きょうのミッション</p>
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
