# S5 Dakuten Drag 遊戲（produce 教學步驟）— HANDOFF

## 對應 SPEC
- §5.2 Dakuten Drag — produce 步驟
- §5.3 SRS 學習進度追蹤

---

## 本階段做了什麼

### 新建檔案

| 檔案 | 說明 |
|------|------|
| `src/features/dakuten-drag/DakutenDragEngine.ts` | 純遊戲邏輯：buildQuestions / shuffleQuestions / checkAnswer / getProgressId |
| `src/features/dakuten-drag/DakutenDragEngine.test.ts` | 15 個單元測試 |
| `src/features/dakuten-drag/DakutenDragGame.tsx` | React 遊戲畫面 |

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `src/App.tsx` | 新增路由 `/play/dakuten-drag` |
| `src/features/play/PlayScreen.tsx` | 新增「✏️ だくてん ドラッグ」按鈕（紫色） |
| `src/types/index.ts` | `SessionRecord.feature` 加入 `'dakuten_drag'` |

---

## 遊戲玩法說明

1. 從第一個有 `dakuten_drag_items` 的課程載入題目，自動隨機排序
2. 每題顯示：
   - 目標詞的中文意思（大字，紫色）
   - 🔊 按鈕（TTS 自動播放目標詞，可重播）
   - 問題文字：「どれに ゛/゜ を つける？」（顯示對應符號）
   - 原始假名的可點按方塊（大按鍵，觸控友善）
3. 點按正確方塊 → 方塊變綠、顯示加了濁點的目標字、TTS 再唸一次，900ms 後進下一題
4. 點按錯誤方塊 → 方塊紅色晃動（animate-shake）、SRS 記錄答錯，可立即重試
5. 全部答完 → 結算畫面顯示星星、XP 獎勵

### SRS 進度追蹤
- 每道題以 `ddi_${item.base}` 為 ID，type = `'vocab'`
- 答對：`updateAfterCorrect`；答錯：`updateAfterIncorrect`
- 目前版本每次隨機排序（不依 SRS 加權出題），因題庫只有 4 題，加權意義不大

---

## 測試結果

```
✅ validate:data   — 3 檔案全通過
✅ tsc --noEmit    — 0 errors
✅ vitest run      — 5 files, 62 tests passed（新增 15 個 DakutenDragEngine 測試）
✅ npm run build   — 443 kB JS, PWA precache 19 entries
```

---

## 給家長的手動驗證腳本

1. 開啟 App → 主畫面點「✏️ だくてん ドラッグ」（紫色按鈕）
2. 聽到 TTS 唸出目標詞（例「ぶた」）
3. 畫面顯示中文意思（例「豬」）和基礎假名方塊（例「ふ」「た」）
4. 問題提示「どれに ゛ を つける？」
5. 點按「ふ」→ 正確：方塊變綠顯示「ぶ゛」，TTS 再唸，進下一題
6. 點按「た」→ 錯誤：方塊晃動，可重試
7. 全部 4 題後出現結算畫面

---

## 已知限制與下階段建議

- 目前 `dakuten_drag_items` 第一題（くき→かき）為佔位資料，不是真正的濁音對；請家長確認後替換
- 題庫只有 4 題（來自單一課程）；S6 或之後可新增更多課程或題目
- 遊戲名稱含「ドラッグ」但目前互動方式為「點按」；若家長希望實作真正的拖拉操作可在 S6 後追加
- S6：家長儀表板（進度、正確率、學習時間、PIN 鎖、年齡模式、課程開關）
