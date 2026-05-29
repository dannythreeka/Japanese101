# S0 Data Layer — HANDOFF

## 完成事項

### 1. 型別系統 (`src/types/index.ts`)
- 新增完整 `Kana`、`Word`、`Asset`、`UnitLesson` 及相關型別
- `KanaItem` / `VocabWord` 保留為 `@deprecated` 別名，向後相容
- 新增 `GameModeId`、`KanaCatchConfig`、`DakutenDragConfig`、`GameModule` 介面，供 S3–S5 使用

### 2. 資料存取層 (`src/data/loaders.ts`)
- 同步存取器：`kanaData()` / `vocabData()` / `lessonData()`
- 非同步存取器：`loadKana()` / `loadVocabulary()` / `loadUnitLessons()`
- 工具函式：`getLessonById()` / `getWordById()` / `getKanaByHiragana()`
- 所有元件已改用 loaders，不再直接 import JSON

### 3. 資料檔案更新

**`src/data/kana.json`**
- 格式從 flat array 改為 `{"kana":[...]}` wrapped 物件
- 合併 71 個新假名 + 33 個拗音 = **104 個假名**

**`src/data/vocabulary.json`**
- 格式改為 `{"words":[...]}` wrapped 物件
- 合併 8 個新光村詞彙 + 60 個主題詞（ID 格式從 `word_001` 改為 `w_001`）= **68 個詞彙**
- 所有詞彙 audio 補上 `license: "tts_generated"`

**`src/data/unit_lessons.json`**（新建）
- 從 `unit_lessons.example.json` 建立
- `_review.no_copyrighted_content: false` — **待家長審查確認後設為 true**

### 4. JSON Schema (`src/data/schemas/`)
- `kana.schema.json`：更新 wrapped 格式 + 加入拗音複合 row 值
- `vocabulary.schema.json`：更新 wrapped 格式 + `Asset` 型別 + `emoji` 欄位
- `unit_lessons.schema.json`（新建）：完整 UnitLesson 結構驗證

### 5. 驗證腳本 (`scripts/validate-data.ts`)
- 使用 AJV + ajv-formats 對三個資料檔執行 JSON Schema 驗證
- `package.json` 新增 `"validate:data": "tsx scripts/validate-data.ts"`
- CI workflow 新增 validate:data 步驟（在 tsc 之後、vitest 之前）

### 6. 元件更新
| 檔案 | 變更 |
|------|------|
| `src/features/kana/KanaMatchGame.tsx` | 改用 `kanaData()` + `Kana` 型別 |
| `src/features/play/KanaGallery.tsx` | 改用 `kanaData()`，移除無用 `Kana` import |
| `src/features/flashcard/FlashCardDeck.tsx` | 改用 `vocabData()`，修正 `unit` undefined 型別 |
| `src/features/quiz/ListenQuiz.tsx` | 改用 `vocabData()` + `Word` 型別 |
| `src/features/flashcard/FlashCard.tsx` | `VocabWord` → `Word` |
| `src/features/kana/KanaCard.tsx` | `KanaItem` → `Kana` |

### 7. 清理
- 刪除 `src/features/home/HomeScreen.tsx`（孤立檔案，無任何引用）
- 刪除根目錄臨時資料檔（`kana.json`、`vocabulary.json`、`*.schema.json`、`unit_lessons.example.json`）

---

## 測試結果

```
✅ validate:data  — kana.json / vocabulary.json / unit_lessons.json 全部通過
✅ tsc --noEmit   — 0 errors
✅ vitest run     — 2 files, 26 tests passed
✅ npm run build  — 424.94 kB JS, PWA precache 11 entries
```

---

## 待辦（非 S0 範圍）

- `unit_lessons.json` 中 `_review.no_copyrighted_content` 需家長確認後設為 `true`
- S3：KanaCatch listen submode（Canvas 2D、GameModule 介面）
- S4：minimal_pair + word_to_image + SRS + 課程選擇器
- S5：Dakuten Drag 遊戲
- S6：家長儀表板
- S7：PWA polish、每日任務、外觀獎勵
