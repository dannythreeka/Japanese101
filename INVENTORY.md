# Beta 盤點 / Beta Inventory

> 製作日期: 2026-06-03  
> 分支: feat/beta-inventory (base: claude/japanese-learning-app-kids-oe8US)  
> 目的: 對照 BETA_KICKOFF.md 的交付範圍，清點現況與缺口，作為 B1–B6 排程的依據。

---

## 1. 功能盤點 (Feature Checklist)

### 路由 / Routes

| 路徑 | 元件 | 狀態 |
|------|------|------|
| `/` | HomeScreen | ✅ 完成 |
| `/adventure` | AdventureMap | ✅ 完成 |
| `/adventure/level/:levelId` | LevelEntry | ✅ 完成 |
| `/adventure/level/:levelId/complete` | LevelComplete | ✅ 完成 |
| `/play` | PlayScreen (附返回首頁) | ✅ 完成 |
| `/play/kana` | KanaMatchGame | ✅ 完成 |
| `/play/flashcard` | FlashcardGame | ✅ 完成 |
| `/play/quiz` | ListenQuizGame | ✅ 完成 |
| `/play/kana-catch` | KanaCatchGame | ✅ 完成 |
| `/play/dakuten-drag` | DakutenDragGame | ✅ 完成 |
| `/play/kana-write` | KanaWriteGame | ✅ 完成 (遊戲本體) |
| `/play/kotodama` | KotodamaGame | ✅ 完成 |
| `/play/gallery` | GalleryScreen | ✅ 完成 |
| `/parent` | ParentPanel | ✅ 完成 |

### 冒險模式整合 (Adventure Integration per Game)

| 遊戲 | 自動啟動 | 返回關卡 | 提交結果 | 取消返回 |
|------|----------|----------|----------|----------|
| KanaCatchGame | ✅ | ✅ | ✅ | ✅ |
| DakutenDragGame | ✅ | ✅ | ✅ | ✅ |
| KotodamaGame | ✅ | ✅ | ✅ | ✅ |
| KanaWriteGame | ❌ 尚未整合 | ❌ | ❌ | ❌ |
| EchoRecord | ❌ 遊戲不存在 | — | — | — |

> **write_canvas** → KanaWriteGame 需要在 B2 加入 `useAdventureChallenge` 整合  
> **echo_record** → 此遊戲模式不在現有程式庫，B5 排入 TODO 清單

### Kotodama 聲調動畫 (S6.6.2)

| 功能 | 狀態 |
|------|------|
| 麥克風 RMS 取樣 (mic.ts `getRms()`) | ✅ 完成 |
| 9 條波形 bar (direct DOM 60fps RAF) | ✅ 完成 |
| 只在 `listening` phase 顯示 | ✅ 完成 |

---

## 2. 資料層現況 vs. Beta 交付 (Data Layer Gap)

### levels.json

| 項目 | 現在 (data/levels.json) | Beta 交付 |
|------|------------------------|-----------|
| 關卡數 | 3 (lv_01, lv_02_kaki_kagi, lv_06_boss_1) | 6 (lv_01..lv_06) |
| 地區數 | 3 regions | 2 regions (tutorial + meadow) |
| lv_02 | kaki_kagi (舊) | aiueo 母音入門 (新) |
| lv_03 | ❌ 不存在 | kaki_kagi |
| lv_04 | ❌ 不存在 | neko_nekko 促音 |
| lv_05 | ❌ 不存在 | obasan 長音 |
| region_forest | 存在 (現有第3地區) | ❌ 不在 beta 範圍 |

**動作 B1**: 以交付版取代 `data/levels.json`，同步隱藏 region_forest（地圖會自動只顯示 2 個地區）

### unit_lessons.json

| 項目 | 現在 | Beta 交付 |
|------|------|-----------|
| 單元數 | 1 (mitsumura_g1_kaki_to_kagi) | 4 |
| 概念詞數 | 8 | 20 (5+6+4+5) |
| Kotodama 場景數 | 8 個 (舊 ID) | 20 個 (新 ID) |

**現有場景 ID (舊):** rainy_to_sunny, quiet_to_erupting_mountain, day_to_night_with_moon, book_page_turn, empty_field_with_target, wall_to_open_window, scroll_unrolls_to_paper, sand_to_crab_appears

**Beta 需要的場景 ID (新 20 個):**

| 單元 | 場景 ID |
|------|---------|
| u2_aiueo | ajisai_blooms, ichigo_appears, uma_runs_in, ebi_swims, onigiri_appears |
| u4_dakuten | kaki_on_tree, kagi_unlocks, saru_swings, zaru_catches, mato_appears, mado_opens |
| u6_sokuon | neko_walks, nekko_emerges, batta_jumps, kakekko_run |
| u7_chouon | obasan_arrives, obaasan_arrives, okaasan_arrives, otousan_arrives, yuuyake_sky |

> 目前 8 個舊場景 ID 與 20 個新 ID **完全不重疊**，舊 SVG 元件與舊 ID 可在 B4 之後廢棄

### vocabulary.json

| 項目 | 現在 | Beta 交付 |
|------|------|-----------|
| 詞數 | 68 (舊/擴充集) | 30 (課本對齊) |
| 來源 | 混合 | mitsumura G1 u2/u4/u6/u7 |
| 圖片 SVG 涵蓋 | 8 個 w_*.svg | 需要 30 個 w_*.svg |

**現有詞圖 SVG (8個):** w_tsuki, w_kasa, w_mado, w_kani, w_mato, w_kami, w_tsugi, w_kazan  
**Beta 需要詞圖 (30個，新):** w_ajisai, w_ichigo, w_uma, w_ebi, w_onigiri, w_kaki, w_kagi, w_sakura, w_saru, w_zaru, w_mato, w_mado *(含重疊)* — 完整列表見 vocabulary.json

### Kotodama 場景元件

| 項目 | 現在 | Beta 需求 |
|------|------|-----------|
| 場景元件數 | 8 個 React 元件 | 20 個新元件 |
| 場景 SVG (preview_*.svg) | 8 個 | 需 20 個對應新 ID |
| SCENE_REGISTRY 鍵 | 8 個 (舊 ID) | 20 個 (新 ID) |

---

## 3. XP / 進化 門檻核對

| 項目 | 現值 | 備注 |
|------|------|------|
| Beta L1 Tutorial 完成獎勵 | +100 XP (completion) + 若3★ +30 | 來自 LevelComplete.tsx |
| 第一次進化門檻 (Lv.1→2) | 需確認 pet.ts 的 xpToNextLevel(0) | 若 Lv5=400XP，L1 完成後玩家可能還在 Lv1 |
| 解蛋需要 | ? | 需家長確認 §B0 Q3 |

---

## 4. B0 需家長確認的問題

1. **寵物外觀 (蛋到成體)**: 現有程式有 `evolutionStage` 0-3，但 SVG 是佔位符。Beta 展示需要多少完整圖？只要蛋 (stage 0) 夠用嗎？
2. **しずか影**: BETA_KICKOFF §4 提到「しずか影」出現在失敗/等待場景。這是一個角色剪影嗎？需要 SVG 嗎？
3. **進化門檻**: 打通全 6 關後，孩子的寵物會進化到幾級？20+ 分鐘遊玩後應該要看到至少一次進化（視覺反饋）。
4. **PIN 預設值**: 家長區的 PIN 目前是 `1234`。Beta 要不要改？或加入「首次使用設定」流程？
5. **BGM**: 目前無背景音樂。Beta 是否需要音樂？還是音效 (SFX) 就足夠？

---

## 5. 已決定事項 (無需確認)

| 決策 | 來源 |
|------|------|
| vocabulary.json 使用課本詞，不擴充 | BETA_KICKOFF §2 |
| L2 改為 あいうえお 母音入門 | BETA_KICKOFF §3 |
| 20 個新 kotodama_scene ID（見上表） | BETA_KICKOFF §4 + unit_lessons 交付 |
| Boss L6 = 3波混合複習（u4/u6/u7） | BETA_KICKOFF §5 |
| Beta 完成標準 = 孩子可獨立玩 20 分鐘 | BETA_KICKOFF §8 |
| 版權: 不放課本掃描/原文/插圖進 public assets | 版權鐵則 |
| 不顯示 ❌/錯誤，只用「還沒醒」「再試試?」 | 設計原則 |

---

## 6. 自判事項 (Claude Code 自行決定，不需確認)

| 決策 | 說明 |
|------|------|
| echo_record 遊戲顯示「即將推出」 | 此遊戲模式不在現有程式庫，beta 範圍外 |
| region_forest 隱藏 (不顯示在地圖) | beta 只有 tutorial + meadow 兩個地區 |
| 舊 8 個場景元件在 B4 後廢棄 | 新 20 個完全取代 |
| levels.json 路徑維持 data/ (repo root) | loaders.ts 已設定 `../../data/levels.json` |

---

## 7. B1–B6 PR 計畫

| PR | 分支 | 內容 | 先決條件 |
|----|------|------|----------|
| B0 | (此文件) | INVENTORY.md 只讀，無程式碼 | 家長確認 B0 問題 |
| B1 | feat/b1-data | 替換 data/levels.json、src/data/unit_lessons.json、src/data/vocabulary.json；加入 data/source/（只追蹤 .gitignore 白名單）；加入/更新 schema | B0 確認後 |
| B2 | feat/b2-map-flow | 地圖讀取 6 關正確資料；隱藏 forest region；LevelEntry 讀取 4 個 unit_lesson；KanaWriteGame 冒險整合 | B1 合併後 |
| B3 | feat/b3-word-svg | 補齊 30 個 w_*.svg（字彙圖）；更新 vocab 圖片路徑 | B1 合併後 |
| B4 | feat/b4-kotodama-scenes | 20 個新 kotodama 場景元件；更新 SCENE_REGISTRY；廢棄舊 8 個 | B1+B2 合併後 |
| B5 | feat/b5-boss-polish | Boss 3波邏輯；しずか影 SVG（若家長確認需要）；關卡完成獎牌 | B2+B4 合併後 |
| B6 | feat/b6-beta-final | 家長進度檢視；無障礙 audit；整體潤飾；beta 完成標準驗收 | B5 合併後 |

---

## 8. 待解的程式技術債 (不影響 beta 推進)

- `src/data/unit_lessons.json` 舊 schema：頂層是 `{ "$schema", "lessons": [...] }` 但 loaders.ts 直接 cast 可能需要校正
- KanaWriteGame 的 `write_canvas` adventure integration（已列 B2）
- EchoRecord 遊戲（beta 範圍外，保留 TODO）
