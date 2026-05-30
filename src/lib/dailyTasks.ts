import type { SessionRecord } from '../types'

export interface DailyTask {
  id: string
  icon: string
  descriptionJa: string
  target: number
  measure: 'total_correct' | 'distinct_features' | 'feature_played'
  feature?: SessionRecord['feature']
}

export const ALL_TASKS: DailyTask[] = [
  {
    id: 'correct_10',
    icon: '⭐',
    descriptionJa: '10もん せいかい！',
    target: 10,
    measure: 'total_correct',
  },
  {
    id: 'correct_20',
    icon: '🌟',
    descriptionJa: '20もん せいかい！',
    target: 20,
    measure: 'total_correct',
  },
  {
    id: 'play_2_games',
    icon: '🎮',
    descriptionJa: '2つのゲームであそぼう！',
    target: 2,
    measure: 'distinct_features',
  },
  {
    id: 'play_kana',
    icon: '🎵',
    descriptionJa: 'かなマッチをあそぼう！',
    target: 1,
    measure: 'feature_played',
    feature: 'kana',
  },
  {
    id: 'play_dakuten',
    icon: '✏️',
    descriptionJa: 'だくてんドラッグをあそぼう！',
    target: 1,
    measure: 'feature_played',
    feature: 'dakuten_drag',
  },
  {
    id: 'play_kana_catch',
    icon: '🫧',
    descriptionJa: 'かなつかまえろをあそぼう！',
    target: 1,
    measure: 'feature_played',
    feature: 'kana_catch',
  },
]

// Pairs rotate by day so tasks change daily but are stable within a day
const TASK_PAIRS: [number, number][] = [
  [0, 2], // correct_10  + play_2_games
  [1, 3], // correct_20  + play_kana
  [0, 4], // correct_10  + play_dakuten
  [1, 5], // correct_20  + play_kana_catch
  [0, 3], // correct_10  + play_kana
]

export function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getTodayTasks(): [DailyTask, DailyTask] {
  const dayOfYear = Math.floor(Date.now() / 86_400_000)
  const [a, b] = TASK_PAIRS[dayOfYear % TASK_PAIRS.length]
  return [ALL_TASKS[a], ALL_TASKS[b]]
}

export function filterTodaySessions(sessions: SessionRecord[]): SessionRecord[] {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return sessions.filter(s => s.date >= d.getTime())
}

export function computeProgress(task: DailyTask, todaySessions: SessionRecord[]): number {
  switch (task.measure) {
    case 'total_correct':
      return todaySessions.reduce((sum, s) => sum + s.correct, 0)
    case 'distinct_features':
      return new Set(todaySessions.map(s => s.feature)).size
    case 'feature_played':
      return todaySessions.some(s => s.feature === task.feature) ? 1 : 0
  }
}

const COMPLETED_KEY_PREFIX = 'completedTasks_'

export function getCompletedToday(): string[] {
  const raw = localStorage.getItem(COMPLETED_KEY_PREFIX + todayKey())
  return raw ? (JSON.parse(raw) as string[]) : []
}

export function markCompleted(taskId: string): void {
  const existing = getCompletedToday()
  if (existing.includes(taskId)) return
  localStorage.setItem(COMPLETED_KEY_PREFIX + todayKey(), JSON.stringify([...existing, taskId]))
}
