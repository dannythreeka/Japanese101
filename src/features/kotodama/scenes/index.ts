import type { ComponentType } from 'react'

// ── u2 あいうえお ────────────────────────────────────────────────────────────
import AjisaiBloumsScene from './AjisaiBloumsScene'
import IchigoAppearsScene from './IchigoAppearsScene'
import UmaRunsInScene from './UmaRunsInScene'
import EbiSwimsScene from './EbiSwimsScene'
import OnigiriAppearsScene from './OnigiriAppearsScene'

// ── u4 かき/かぎ ─────────────────────────────────────────────────────────────
import KakiOnTreeScene from './KakiOnTreeScene'
import KagiUnlocksScene from './KagiUnlocksScene'
import SaruSwingsScene from './SaruSwingsScene'
import ZaruCatchesScene from './ZaruCatchesScene'
import MatoAppearsScene from './MatoAppearsScene'
import MadoOpensScene from './MadoOpensScene'

// ── u6 ねこ/ねっこ ────────────────────────────────────────────────────────────
import NekoWalksScene from './NekoWalksScene'
import NekkoEmergesScene from './NekkoEmergesScene'
import BattaJumpsScene from './BattaJumpsScene'
import KakekkoRunScene from './KakekkoRunScene'

// ── u7 おばさん/おばあさん ────────────────────────────────────────────────────
import ObasanArrivesScene from './ObasanArrivesScene'
import ObaasanArrivesScene from './ObaasanArrivesScene'
import OkaasanArrivesScene from './OkaasanArrivesScene'
import OtousanArrivesScene from './OtousanArrivesScene'
import YuuyakeSkyScene from './YuuyakeSkyScene'

// ── boss ─────────────────────────────────────────────────────────────────────
import ShizukaKageScene from './ShizukaKageScene'

export const SCENE_REGISTRY: Record<string, ComponentType<{ success: boolean }>> = {
  // u2
  ajisai_blooms:    AjisaiBloumsScene,
  ichigo_appears:   IchigoAppearsScene,
  uma_runs_in:      UmaRunsInScene,
  ebi_swims:        EbiSwimsScene,
  onigiri_appears:  OnigiriAppearsScene,
  // u4
  kaki_on_tree:     KakiOnTreeScene,
  kagi_unlocks:     KagiUnlocksScene,
  saru_swings:      SaruSwingsScene,
  zaru_catches:     ZaruCatchesScene,
  mato_appears:     MatoAppearsScene,
  mado_opens:       MadoOpensScene,
  // u6
  neko_walks:       NekoWalksScene,
  nekko_emerges:    NekkoEmergesScene,
  batta_jumps:      BattaJumpsScene,
  kakekko_run:      KakekkoRunScene,
  // u7
  obasan_arrives:   ObasanArrivesScene,
  obaasan_arrives:  ObaasanArrivesScene,
  okaasan_arrives:  OkaasanArrivesScene,
  otousan_arrives:  OtousanArrivesScene,
  yuuyake_sky:      YuuyakeSkyScene,
  // boss
  shizuka_kage:     ShizukaKageScene,
}
