import type { ProgressRecord, SessionRecord } from '../../types'
import { accuracy } from '../../lib/srs'

export function formatTime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}分`
  return `${hours}時間${minutes}分`
}

export function getDayLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export interface DayCount {
  label: string
  count: number
}

export function last7DayCounts(sessions: SessionRecord[]): DayCount[] {
  const days: DayCount[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const start = d.getTime()
    const end = start + 86_400_000
    const count = sessions.filter(s => s.date >= start && s.date < end).length
    days.push({ label: getDayLabel(d), count })
  }
  return days
}

export function featureAccuracy(records: ProgressRecord[], type: 'kana' | 'vocab'): number {
  const filtered = records.filter(r => r.type === type)
  if (filtered.length === 0) return 0
  const total = filtered.reduce((sum, r) => sum + accuracy(r), 0)
  return Math.round(total / filtered.length)
}
