import type { DakutenDragItem, UnitLesson } from '../../types'

export interface DragQuestion {
  item: DakutenDragItem
  baseChars: string[]
  targetChars: string[]
}

export function buildQuestions(lesson: UnitLesson): DragQuestion[] {
  return (lesson.dakuten_drag_items ?? []).map(item => ({
    item,
    baseChars: [...item.base],
    targetChars: [...item.target],
  }))
}

export function shuffleQuestions(questions: DragQuestion[]): DragQuestion[] {
  const arr = [...questions]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function checkAnswer(question: DragQuestion, tileIndex: number): boolean {
  return question.item.mark_at.includes(tileIndex)
}

export function getProgressId(item: DakutenDragItem): string {
  return `ddi_${item.base}`
}
