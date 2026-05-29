# Inventory(2026-05-29)

> 對應 KICKOFF.md §0。讀完後停下,等家長 review 並給出指示再進 S0。

---

## 既有功能

以下功能已在 feature branch `claude/japanese-learning-app-kids-oe8US`(PR #2,尚未 merge main)實作:

| 功能 | 對應 SPEC | 狀態 |
|---|---|---|
| 路由 `/play`、`/play/kana`、`/play/flashcard`、`/play/quiz`、`/play/gallery`、`/parent` | §3(路由分離)、§6 S1 | ✅ 完成 |
| 假名配對遊戲(`KanaMatchGame`) | §6 S3 前置 | ✅ 完成 |
| 單字閃卡(`FlashCardDeck`) | §6 S4 前置 | ✅ 完成 |
| 聆聽測驗(`ListenQuiz`) | §6 前置 | ✅ 完成 |
| 假名圖鑑(`KanaGallery`,依已學 ID 解鎖) | §5.5 圖鑑 | ✅ 完成 |
| 寵物 XP + 等級 + 進化階段 + LevelUpModal | §5.5、§6 S2 | ✅ 完成 |
| PetState 存 IndexedDB(Dexie v2) | §4.3、§3 禁 localStorage | ✅ 完成 |
| Howler.js 音效層(`audio.ts`) | §3、§6 S1 | ✅ 完成 |
| TTS wrapper(`tts.ts`,Web Speech ja-JP) | §3、§6 S1 | ✅ 完成 |
| 簡化 SRS(`srs.ts`,答錯優先重出) | §5.3 | ✅ 完成 |
| 家長 PIN 儀表板(`ParentDashboard`) | §3、§6 S6 前置 | ✅ 部分完成 |
| PWA Service Worker | §3、§6 S7 | ✅ 骨架完成 |
| GitHub Actions CI(tsc + vitest + build) | §3 | ✅ 完成 |
| Vercel SPA rewrite(`vercel.json`) | §3 | ✅ 完成 |

---

## 既有檔案結構

```
/
├── src/
│   ├── App.tsx              路由根元件(BrowserRouter + Routes)
│   ├── main.tsx             React 入口
│   ├── index.css            Tailwind + 自訂動畫 keyframes
│   ├── data/
│   │   ├── kana.json        104 個假名,flat array(⚠️ 見衝突)
│   │   ├── vocabulary.json  60 個單字,flat array(⚠️ 見衝突)
│   │   └── schemas/
│   │       ├── kana.schema.json       驗 flat array 格式
│   │       └── vocabulary.schema.json 驗 flat array 格式
│   ├── types/index.ts       TypeScript 型別(⚠️ 缺 UnitLesson 等,見衝突)
│   ├── db/index.ts          Dexie AppDB v2(progress/sessions/pets 表)
│   ├── store/useAppStore.ts Zustand:kanaMode/kanaDifficulty/ageMode/stars
│   ├── lib/
│   │   ├── audio.ts         Howler SFX + BGM
│   │   ├── tts.ts           Web Speech TTS
│   │   ├── srs.ts           簡化 SM-2
│   │   ├── pet.ts           XP 計算、addXpToPet()
│   │   ├── srs.test.ts      Vitest:7 tests
│   │   └── schema-validate.test.ts  Vitest:10 tests
│   ├── features/
│   │   ├── play/            PlayScreen / KanaGallery / LevelUpModal
│   │   ├── kana/            KanaMatchGame / KanaCard
│   │   ├── flashcard/       FlashCardDeck / FlashCard
│   │   ├── quiz/            ListenQuiz
│   │   ├── home/            HomeScreen(舊,已被 PlayScreen 取代)
│   │   └── parent/          ParentDashboard
│   └── components/
│       ├── PetAvatar.tsx    寵物頭像元件
│       ├── SpeakButton.tsx  TTS 觸發按鈕
│       └── StarCount.tsx    星星計數
├── public/                  favicon / icon-192.png / icon-512.png / icons.svg
├── .github/workflows/ci.yml tsc + vitest + build
├── SPEC.md                  (從 zip 覆蓋,已是最新版)
├── KICKOFF.md               (從 zip 覆蓋,已是最新版)
├── kana.json                ⚠️ zip 解壓到 repo 根目錄,尚未整合
├── vocabulary.json          ⚠️ zip 解壓到 repo 根目錄,尚未整合
├── kana.schema.json         ⚠️ zip 解壓到 repo 根目錄,尚未整合
├── vocabulary.schema.json   ⚠️ zip 解壓到 repo 根目錄,尚未整合
├── unit_lessons.schema.json ⚠️ zip 解壓到 repo 根目錄,尚未整合
├── unit_lessons.example.json ⚠️ zip 解壓到 repo 根目錄,尚未整合
└── japanese101-pet-handoff.zip  ⚠️ 未解開的 handoff 包(見備註)
```

---

## 與 SPEC 的差距

### 缺什麼(KICKOFF §2 S0 要求,目前沒有的)

| 缺項 | 說明 |
|---|---|
| `src/data/loaders.ts` | `loadKana()` / `loadVocabulary()` / `loadUnitLessons()` / `getLessonById()` / `getWordById()` / `getKanaByHiragana()` 全部缺 |
| `src/data/unit_lessons.json` | 正式 unit_lessons 資料檔不存在(只有 `unit_lessons.example.json`) |
| `scripts/validate-data.ts` | AJV schema 驗證腳本不存在 |
| npm script `validate:data` | `package.json` 沒有這條 script |
| CI step for `validate:data` | `.github/workflows/ci.yml` 沒有這一步 |
| `ajv` + `tsx` 依賴 | `package.json` 的 devDependencies 裡沒有 |
| TypeScript 型別:`UnitLesson` | `src/types/index.ts` 缺 |
| TypeScript 型別:`ConceptWord` | `src/types/index.ts` 缺 |
| TypeScript 型別:`DakutenDragItem` | `src/types/index.ts` 缺 |
| TypeScript 型別:`TeachingStep` | `src/types/index.ts` 缺 |
| TypeScript 型別:`GameModeId` | `src/types/index.ts` 缺 |
| `KanaCatchConfig.subMode` | 現有型別缺 `subMode: KanaCatchSubMode`、`unitId?: string`、`includeHandakuon: boolean` |
| `GameModule` 泛型 | 現有是 `GameModule`,SPEC 要求 `GameModule<TConfig, TAnswer>` |

### 與 SPEC 衝突的設計

**衝突 1:資料格式(最重要)**

| 項目 | 現有 `src/data/kana.json` | zip 的 `kana.json` |
|---|---|---|
| 格式 | flat array `[{...}]` | wrapped object `{"kana": [...]}` |
| `$schema` | 無 | 有(`./schemas/kana.schema.json`) |
| schema 位置 | `src/data/schemas/kana.schema.json` | `schemas/kana.schema.json`(根目錄) |
| schema 驗的格式 | array | object with `"kana"` key |

`vocabulary.json` 同樣衝突:現有 flat array,新的是 `{"words": [...]}` wrapped object。

**衝突 2:vocabulary 內容與 ID 格式**

| 項目 | 現有 60 個詞 | zip 的 8 個詞 |
|---|---|---|
| ID 格式 | `word_001`...`word_060` | `w_kasa`...`w_mado` |
| unit code | `topic_animals` / `topic_food` 等 | `mitsumura_g1_kaki_to_kagi` |
| 附 emoji | ✅ 有 | ❌ 無 |
| image.license | `CC0` | `self-created` |
| audio 結構 | `{ src, origin }` | `{ src, license, origin }` |
| 新 schema ID pattern | `^w_[a-z0-9_]+$`→ **不符合** `word_001` | 符合 |

現有 60 個詞的 `word_001` ID 格式不通過新 schema 的 `^w_[a-z0-9_]+$` 正規式驗證。

**衝突 3:`VocabAudio` 型別缺 `license` 欄位**

現有 `VocabAudio = { src, origin }`;新 schema 的 `Asset` 要求 `{ src, license }` 必填。

**衝突 4:`VocabImage.source_url` 必填 vs 選填**

現有型別 `VocabImage.source_url: string`(必填);新 schema 的 `Asset.source_url` 是 optional。

**衝突 5:`src/features/home/HomeScreen.tsx` 孤立**

`HomeScreen` 已被 `PlayScreen` 取代,但檔案還在,路由已無指向它。

### 可重用的部分

- `KanaMatchGame`、`FlashCardDeck`、`ListenQuiz`、`KanaGallery`(全部可直接延用,只需改資料讀取方式改走 loaders)
- `src/lib/srs.ts`、`src/lib/audio.ts`、`src/lib/tts.ts`、`src/lib/pet.ts`(完全可重用)
- `src/db/index.ts`(Dexie v2 schema 可直接延用)
- `src/store/useAppStore.ts`(可直接延用,S0 不需改)
- `src/components/`(全部可重用)
- `PetState` 型別(與 SPEC §4.3 完全一致)
- `ProgressRecord`、`SessionRecord` 型別(完全可重用)

---

## 我建議的合併策略

S0 應照 KICKOFF §2 的範疇,具體做:

1. **確認資料格式後**,把根目錄的 `kana.json`/`vocabulary.json`/schemas 移入 `src/data/`,覆蓋舊版,並更新 `src/data/schemas/`。
2. **建立 `src/data/loaders.ts`**,所有元件不再直接 `import` JSON,改走 loader(這樣格式改變只影響 loader,不影響元件)。
3. **更新 `src/types/index.ts`**,補齊 `UnitLesson`、`ConceptWord`、`DakutenDragItem`、`TeachingStep`、`GameModeId`;修正 `KanaCatchConfig` 和 `GameModule` 型別。
4. **建立 `src/data/unit_lessons.json`**(從 example 複製,`_review.no_copyrighted_content` 保持 `false` 待家長審核)。
5. **安裝 `ajv`、`tsx`**,建立 `scripts/validate-data.ts`。
6. **既有功能保護**:loader 層的介面設計確保 `KanaMatchGame`、`FlashCardDeck`、`ListenQuiz`、`KanaGallery` 讀到的資料結構與現在一致,元件本身不需大改。
7. **`HomeScreen` 刪除**:這個孤立檔案在同一 PR 清除(不影響任何路由)。

---

## 我有疑問要請家長決定的事

### Q1:資料格式 — wrapped object 還是 flat array?

新的 `kana.json`/`vocabulary.json` 和 schema 採用 wrapped format(`{"kana":[...]}`)。現有 repo 是 flat array。

- **選項 A(推薦)**:改成 wrapped format,由 `loaders.ts` 讀取並 export array,元件不感知格式。優點:符合新 SPEC schema,未來擴充 metadata 方便。
- **選項 B**:保留 flat array,更新 schema 改回 array 格式。優點:改動量最小。

> 我推薦 A。loaders.ts 正好是隔離層,一旦到位,元件完全不用改。

---

### Q2:既有 60 個單字(topic 類別)要保留、合併、還是替換?

新 zip 的 `vocabulary.json` 只有 8 個課本進度詞(`mitsumura_g1_kaki_to_kagi` unit);既有 60 個是主題分類詞(`topic_animals` 等)。

- **選項 A(推薦)**:合併,兩份詞放進同一個 `vocabulary.json`,用不同 unit code 區分。`FlashCardDeck`/`ListenQuiz` 繼續可玩;以後可依 unit 過濾。
- **選項 B**:只保留新的 8 個,既有 FlashCard 等遊戲改為從 unit_lessons 的 concept_words 取題。
- **選項 C**:完全替換並凍結,等家長準備好更多課本進度詞再補充。

> 我推薦 A。既有 60 個詞讓 FlashCardDeck/ListenQuiz 保持可玩,孩子現在就能用。

---

### Q3:既有 60 個單字 ID(`word_001`...`word_060`)要改格式嗎?

新 schema 要求 vocabulary ID 符合 `^w_[a-z0-9_]+$`,但現有是 `word_001`(不符合)。

- **選項 A(推薦)**:把現有 60 個 ID 改為 `w_001`...`w_060`。因為是 dev/MVP 階段,IndexedDB 裡目前沒有真實用戶資料,不需考慮遷移問題。
- **選項 B**:放鬆 schema regex 改為同時接受 `word_001` 和 `w_kasa` 兩種格式(改成 `^[a-z][a-z0-9_]+$`)。

> 我推薦 A:改 ID 讓所有資料格式統一,schema 保持嚴格更好維護。

---

### Q4:資料檔與 schema 放在 `src/data/` 還是 repo 根目錄 `data/` + `schemas/`?

Handoff zip 的目錄結構建議放在根目錄 `data/kana.json` 和 `schemas/kana.schema.json`(非 `src/` 下);現有 repo 是 `src/data/`。

- **選項 A(推薦)**:沿用 `src/data/`(現有結構),schema 在 `src/data/schemas/`。Vite 的靜態 import 直接支援,不需額外設定。
- **選項 B**:改為根目錄 `data/` + `schemas/`,符合 handoff zip 結構,但需調整 Vite alias 或 tsconfig paths。

> 我推薦 A:既有路徑已跑通,改根目錄只增複雜度,`loaders.ts` 隔離後外部不感知路徑。

---

### Q5:PR #2(S0+S1+S2)要先 merge main,還是新 S0 繼續疊在同一 branch 上?

現在狀態:PR #2 在 `claude/japanese-learning-app-kids-oe8US`,尚未 merge。新 KICKOFF 的 S0 工作比 PR #2 的 S0 多(多了 loaders、validate-data、unit_lessons 型別等)。

- **選項 A(推薦)**:先 merge PR #2 到 main → 從 main 開新 branch `feat/s0-data-layer` 做 KICKOFF 的 S0 → 發新 PR。好處:每個 PR 邊界清楚,符合 KICKOFF §1「每階段一個 PR」。
- **選項 B**:在現有 PR #2 branch 繼續疊,補足缺項後更新同一 PR。好處:不用重新 checkout;壞處:PR 混入三個階段的工作。

> 我推薦 A:先 merge PR #2(S0/S1/S2 的骨架已過測試),然後從乾淨的 main 開新 S0 PR,符合 KICKOFF §1 工作模式。

---

## 備註

- 根目錄的 `japanese101-pet-handoff.zip` 是整個 handoff 的打包,包含 `data/`、`schemas/`、`SPEC.md`、`KICKOFF.md`、`unit_lessons.example.json` 等;內容與已解壓的個別檔案重複,**建議加入 `.gitignore` 不進版控**(zip 太大,且內容已逐一整合)。
- 根目錄散落的 `kana.json`、`vocabulary.json`、`*.schema.json`、`unit_lessons.example.json` 是解壓後的臨時狀態,**S0 開工時再統一搬移/刪除**,不要提前動。
