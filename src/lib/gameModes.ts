import type { GameModeId } from '../types'

export const GAME_ROUTES: Partial<Record<GameModeId, string>> = { kana_catch_listen:'/play/kana-catch', kana_catch_minimal_pair:'/play/kana-catch', kana_catch_word_to_image:'/play/kana-catch', dakuten_drag:'/play/dakuten-drag', kotodama_summon:'/play/kotodama', write_canvas:'/play/kana-write' }
export const featureForMode: Partial<Record<GameModeId, string>> = { kana_catch_listen:'kana_catch',kana_catch_minimal_pair:'kana_catch',kana_catch_word_to_image:'kana_catch',dakuten_drag:'dakuten_drag',kotodama_summon:'kotodama',write_canvas:'kana_write' }

