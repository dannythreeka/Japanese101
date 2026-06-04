export interface PetStage {
  stage: number;
  name_jp: string;
  name_zh: string;
  description_jp: string;
  /** The adventure level_id that unlocks this stage; null = starting stage */
  unlocked_after_level: string | null;
  emoji: string;
  aura: string;
}

export const PET_STAGES: PetStage[] = [
  {
    stage: 0,
    name_jp: 'なぞのたまご',
    name_zh: '謎の卵',
    description_jp: 'ふしぎなたまご。なかにだれかいるのかな…',
    unlocked_after_level: null,
    emoji: '🥚',
    aura: '',
  },
  {
    stage: 1,
    name_jp: 'ひなどり',
    name_zh: 'ヒナ鳥',
    description_jp: 'たまごからかえった！はじめてのせかい！',
    unlocked_after_level: 'lv_05_kessen',
    emoji: '🐣',
    aura: '',
  },
  {
    stage: 2,
    name_jp: 'かぜのつかい',
    name_zh: '風の使い',
    description_jp: 'からだのまわりにかぜがながれている',
    unlocked_after_level: 'lv_06_kouzan',
    emoji: '🐤',
    aura: '💨',
  },
  {
    stage: 3,
    name_jp: 'はねつかい',
    name_zh: '跳ね使い',
    description_jp: 'ちいさなはねがはえた！とべるかも！',
    unlocked_after_level: 'lv_07_hanebashi',
    emoji: '🐦',
    aura: '✨',
  },
  {
    stage: 4,
    name_jp: 'ひびきのつかい',
    name_zh: '響の使い',
    description_jp: 'からだがおおきくなって、めがやさしくなった',
    unlocked_after_level: 'lv_08_kodama',
    emoji: '🦜',
    aura: '⭐',
  },
  {
    stage: 5,
    name_jp: 'ひかりのつかい',
    name_zh: '光の使い',
    description_jp: 'ぜんしんがひかりをはなちはじめた！',
    unlocked_after_level: 'lv_09_nejire',
    emoji: '🦅',
    aura: '🌟',
  },
  {
    stage: 6,
    name_jp: 'しゅうきょくけい',
    name_zh: '終極形',
    description_jp: 'さいきょうのすがたにしんかした！！',
    unlocked_after_level: 'lv_10_saidan',
    emoji: '🔥',
    aura: '👑',
  },
];

/** Returns the stage triggered by completing the given level, or null. */
export function getStageForLevel(levelId: string): PetStage | null {
  return PET_STAGES.find((s) => s.unlocked_after_level === levelId) ?? null;
}
