export interface PetStage {
  stage_number: number
  name_ja: string
  name_zh: string
  unlocked_after_level: string | null
}

export const PET_STAGES: PetStage[] = [
  { stage_number: 0, name_ja: 'なぞのたまご',  name_zh: '謎之蛋',   unlocked_after_level: null },
  { stage_number: 1, name_ja: 'ヒナ鳥',        name_zh: '雛鳥',     unlocked_after_level: 'lv_05_kessen' },
  { stage_number: 2, name_ja: '風の使い',       name_zh: '風之使者', unlocked_after_level: 'lv_06_kouzan' },
  { stage_number: 3, name_ja: '跳ね使い',       name_zh: '跳躍使者', unlocked_after_level: 'lv_07_hanebashi' },
  { stage_number: 4, name_ja: '響の使い',       name_zh: '迴響使者', unlocked_after_level: 'lv_08_kodama' },
  { stage_number: 5, name_ja: '光の使い',       name_zh: '光之使者', unlocked_after_level: 'lv_09_nejire' },
  { stage_number: 6, name_ja: '終極形',         name_zh: '終極形態', unlocked_after_level: 'lv_10_saidan' },
]

export function computeEvolutionStageFromLevels(completedLevelIds: string[]): number {
  let max = 0
  for (const s of PET_STAGES) {
    if (s.unlocked_after_level && completedLevelIds.includes(s.unlocked_after_level)) {
      max = Math.max(max, s.stage_number)
    }
  }
  return max
}

export function getStageInfo(stageNumber: number): PetStage {
  return PET_STAGES[stageNumber] ?? PET_STAGES[0]
}
