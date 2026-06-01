import type { ComponentType } from 'react'
import RainySunnyScene from './RainySunnyScene'
import QuietEruptingScene from './QuietEruptingScene'
import DayNightMoonScene from './DayNightMoonScene'
import BookPageTurnScene from './BookPageTurnScene'
import EmptyTargetScene from './EmptyTargetScene'
import WallWindowScene from './WallWindowScene'
import ScrollPaperScene from './ScrollPaperScene'
import SandCrabScene from './SandCrabScene'

export {
  RainySunnyScene,
  QuietEruptingScene,
  DayNightMoonScene,
  BookPageTurnScene,
  EmptyTargetScene,
  WallWindowScene,
  ScrollPaperScene,
  SandCrabScene,
}

export const SCENE_REGISTRY: Record<string, ComponentType<{ success: boolean }>> = {
  rainy_to_sunny: RainySunnyScene,
  quiet_to_erupting_mountain: QuietEruptingScene,
  day_to_night_with_moon: DayNightMoonScene,
  book_page_turn: BookPageTurnScene,
  empty_field_with_target: EmptyTargetScene,
  wall_to_open_window: WallWindowScene,
  scroll_unrolls_to_paper: ScrollPaperScene,
  sand_to_crab_appears: SandCrabScene,
}
