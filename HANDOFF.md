# S4 KanaCatch 子模式 B/C + SRS 出題 + 課程選擇器 — HANDOFF

## 對應 SPEC
- §5.1 Kana Catch 子模式 B `kana_catch_minimal_pair`
- §5.1 Kana Catch 子模式 C `kana_catch_word_to_image`
- §5.3 學習邏輯（SRS 出題優先）
- §6 S4 交付

---

## 本階段做了什麼

### 架構重構（KanaCatchEngine.ts）
- Engine 不再內建出題邏輯；改由 `cb.nextQuestion()` 回呼取得每題的 `QuestionConfig`
- 新增 `BubbleItem`（id + display text + 可選 romaji）統一表示泡泡內容，與資料型別解耦
- 泡泡顯示文字自動縮放字體（長詞 2+ 字自動變小），支援完整假名詞（例「かざん」）
- 新增 `onNewQuestion(q)` 回呼讓 React 知道當前問題（replay 按鈕、中央圖片用）

### 新建檔案
| 檔案 | 說明 |
|------|------|
| `src/features/kana-catch/questionGenerators.ts` | 三個出題生成器 + SRS 加權選題 + buildPool/buildParams 移至此處 |
| `src/features/kana-catch/questionGenerators.test.ts` | 31 個單元測試：buildPool/buildParams/三種生成器 |
| `src/features/kana-catch/KanaCatchSetup.tsx` | 模式選擇 + 課程選擇 UI |
| `public/assets/img/svg/w_kasa.svg` | 傘 SVG（代表圖，待家長確認風格） |
| `public/assets/img/svg/w_kazan.svg` | 火山 SVG（代表圖，待家長確認風格） |
| `public/assets/img/svg/w_tsuki.svg` | 月亮 SVG（代表圖，待家長確認風格） |

### 修改檔案
| 檔案 | 變更 |
|------|------|
| `src/features/kana-catch/KanaCatchEngine.ts` | 重構為通用引擎，移除 Kana 耦合 |
| `src/features/kana-catch/KanaCatchEngine.test.ts` | 更新 import 來源 |
| `src/features/kana-catch/KanaCatchGame.tsx` | 加入 setup 狀態機、三子模式切換、SRS 加載 |
| `src/data/vocabulary.json` | 8 個光村詞彙加入 emoji 欄位（供子模式 C 中央顯示） |

---

## 三種子模式說明

### 子模式 A（listen）— 不變，繼續運作
- TTS 念單一假名，泡泡顯示假名，幼齡顯示羅馬拼音提示

### 子模式 B（minimal_pair）
- 從 `unit_lessons.target_kana_pairs` 取所有最小對比假名（例 か↔が、き↔ぎ）
- SRS 優先選「最近答錯」或「久未複習」的假名
- 泡泡顯示假名，TTS 念目標音，孩子辨識「有沒有濁點」

### 子模式 C（word_to_image）
- 從 `unit_lessons.concept_words` 取詞，中央顯示 emoji（例 ☂️ かさ）
- 泡泡顯示詞的假名（例「かさ」「かざん」「つき」）
- TTS 念目標詞，孩子抓住與圖符合的詞

### SRS 出題加權
- 每次遊戲開始先讀取 IndexedDB 全部進度（`loadProgressMap()`）
- `srsWeightedPick()` 優先從 `nextReview ≤ now` 的項目出題
- 所有答完才重複，確保複習效率

---

## SVG 圖示風格說明（待家長確認）

依 KICKOFF §3 規則生成 3 張代表圖：
- `w_kasa.svg` — 藍色圓頂傘 + 木質握把
- `w_kazan.svg` — 灰色火山 + 橘黃岩漿噴發
- `w_tsuki.svg` — 深藍夜空 + 黃色新月 + 星星

**請確認：**
- [ ] 風格是否適合 6 歲兒童？（圓潤、高對比、可辨識）
- [ ] 確認後，後續 5 張（w_tsugi、w_mato、w_mado、w_kami、w_kani）會以相同風格補齊

---

## 需要家長決定

- [ ] **Q1：SVG 風格確認**：請確認上述 3 張 SVG 風格是否合適，確認後批量補齊其餘 5 張
- [ ] **Q2：`unit_lessons.json` 版權確認**：請審查並將 `_review.no_copyrighted_content` 由 `false` 改為 `true`（S0 遺留待辦）

---

## 給家長的手動驗證腳本

1. 開啟 App → 主畫面點「🫧 かな つかまえろ！」
2. **子模式 A（きく）**：點「🎵 きく」→ 聽音點字，確認正確泡泡爆開、錯誤無懲罰
3. **子模式 B（くらべる）**：點「🔤 くらべる」→ 選「柿子與鑰匙」→ 泡泡中含清音和濁音，辨認正確音
4. **子模式 C（ことばをみつけろ）**：點「🖼️ ことばをみつけろ」→ 選「柿子與鑰匙」→ 中央出現 emoji，選對應日文詞
5. 完成 10 題後出現結算，可選「モードをかえる」換模式或「もういちど！」重玩

---

## 測試結果

```
✅ validate:data   — 3 檔案全通過
✅ tsc --noEmit    — 0 errors
✅ vitest run      — 4 files, 47 tests passed（含 31 個新的生成器測試）
✅ npm run build   — 437 kB JS, PWA precache 14 entries（含 3 個 SVG）
```

---

## 我自己決定的事

1. **emoji 欄位**：為光村 8 個詞彙加入 emoji，讓子模式 C 在 SVG 完成前仍可遊玩
2. **出題最大泡泡數**：showRomaji=true（幼齡）取 3 泡，showRomaji=false（進階）取 5 泡 — 與子模式 A 一致
3. **引擎 `maxBubbles` 改由生成器控制**：生成器決定 items 數量，引擎不需知道上限

---

## 已知限制與下階段建議

- 其餘 5 張 SVG（w_tsugi、w_mato、w_mado、w_kami、w_kani）待家長確認風格後補充
- 目前只有 1 個 unit lesson；S5 加入更多 unit 後選擇器會自動出現更多選項
- S5：Dakuten Drag 遊戲（produce 步驟）
