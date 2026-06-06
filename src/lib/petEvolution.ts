export interface PetStage {
  stage_number: number
  name_ja: string
  name_zh: string
  unlocked_after_level: string | null
}

export const PET_STAGES: PetStage[] = [
  { stage_number: 0, name_ja: 'なぞのたまご',         name_zh: '謎之蛋',        unlocked_after_level: null },
  { stage_number: 1, name_ja: 'めざめのたまご',       name_zh: '萌動之蛋',      unlocked_after_level: 'lv_05_kessen' },
  { stage_number: 2, name_ja: 'チビ影',                name_zh: '小影',          unlocked_after_level: 'lv_06_kouzan' },
  { stage_number: 3, name_ja: 'チビ影 魔力型',        name_zh: '魔力小影',      unlocked_after_level: 'lv_07_hanebashi' },
  { stage_number: 4, name_ja: '鳳羽幻獸 カゲマル',   name_zh: '鳳羽幻獸 卡格魯', unlocked_after_level: 'lv_08_kodama' },
  { stage_number: 5, name_ja: '光の使い カゲマル',   name_zh: '光之使者 卡格魯', unlocked_after_level: 'lv_09_nejire' },
  { stage_number: 6, name_ja: '羈絆の光 カゲマル',   name_zh: '羈絆之光 卡格魯', unlocked_after_level: 'lv_10_saidan' },
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
