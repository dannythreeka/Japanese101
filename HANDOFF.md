# S3 假名抓抓樂 Listen — HANDOFF

## 對應 SPEC
- §5.1 Kana Catch 子模式 A `kana_catch_listen`
- §5.3 學習邏輯（SRS 整合）
- §5.4 統一遊戲介面（GameModule 架構基礎）
- §5.5 寵物養成串接（XP / 進化）
- §6 S3 交付

---

## 本階段做了什麼

### 新建檔案
| 檔案 | 說明 |
|------|------|
| `src/features/kana-catch/KanaCatchEngine.ts` | Canvas 2D 遊戲引擎：泡泡生成、物理更新、碰撞偵測、問題輪替 |
| `src/features/kana-catch/KanaCatchGame.tsx` | React 包裝層：UI 覆層、SRS 更新、XP 結算、結果畫面 |
| `src/features/kana-catch/KanaCatchEngine.test.ts` | 純函式單元測試：`pickQuestion` / `buildPool` / `buildParams` |

### 修改檔案
| 檔案 | 變更 |
|------|------|
| `src/App.tsx` | 新增 `/play/kana-catch` 路由 |
| `src/features/play/PlayScreen.tsx` | 顯示「かな つかまえろ！」按鈕給所有用戶（幼齡 + 進階） |
| `src/types/index.ts` | `SessionRecord.feature` 加入 `'kana_catch'` |

---

## 遊戲設計實作

### 難度參數
| 模式 | fallSpeed | maxBubbles | showRomaji |
|------|-----------|-----------|------------|
| 幼齢 (young) | 110 px/s | 3 | ✅ |
| 進階 (advanced) | 210 px/s | 5 | ❌ |

### 出題邏輯
- `buildPool(allKana, ageMode, difficulty)` — 幼齢+難度1 只取清音；進階+all 取全部
- `pickQuestion(pool, maxBubbles)` — 1 正確 + N-1 隨機干擾，每輪重新洗牌
- 幼齡幾乎只接觸清音（46個）；進階最多可接觸全部 104 個假名

### SRS 整合
- 接住正確泡泡 → `updateAfterCorrect` → streak 增加，下次間隔拉長
- 正確泡泡落地未接到 → `updateAfterIncorrect` → streak 歸零，明天重複

### 夥伴動畫
- 正確接住時夥伴元素 bounce（translateY + scale CSS 動畫 300ms）
- 完成 round → XP 加到 pet → 可能觸發 LevelUpModal

---

## 給家長的手動驗證腳本

1. 開啟 App，進入「にほんご101」主畫面
2. 點「🫧 かな つかまえろ！」按鈕
3. **聽音點字**: 聽到語音念出一個假名（例：「か」），在落下的泡泡中點正確假名
   - 點對：泡泡爆開，夥伴跳起來，聽到「correct」音效，⭐ 增加
   - 點錯/泡泡落地：沒有扣分、沒有哀怨音效，繼續下一題
4. 右上角「🔊」按鈕可重播語音
5. 左上角「←」可隨時回主畫面
6. 完成 10 題後出現結算畫面，可見⭐ 數與「もういちど！」
7. 回到主畫面確認寵物 XP 有增加（進度條向右推進）

---

## 測試結果

```
✅ validate:data    — 3 檔案全通過
✅ tsc --noEmit     — 0 errors
✅ vitest run       — 3 files, 38 tests passed (含 12 個新的 KanaCatchEngine 測試)
✅ npm run build    — 432.67 kB JS, PWA precache 11 entries
```

---

## 我自己決定的事

1. **幼齡模式按鈕對所有用戶顯示**：SPEC 說子模式 A 是「基本聽音點字，五十音學習用」，沒有理由只給進階用戶。已移除 `ageMode === 'advanced'` 條件。
2. **Canvas 背景用 CSS gradient 代替**：canvas 元素的 CSS `bg-gradient-to-b` 透過 transparent canvas 顯示，省去 canvas 內自繪背景的複雜度。
3. **夥伴目前用 PetAvatar + CSS bounce 取代 Lottie 動畫**：Lottie 是 S7 polish 階段，現階段 CSS 動畫已足夠表達「夥伴接住」。

---

## 需要家長決定（≤5 個問題）

無。本階段均在 SPEC 定義範圍內，無需額外決策。

---

## 已知限制與下階段建議

- S3 只做了子模式 A（listen）。子模式 B（minimal_pair）與 C（word_to_image）待 S4。
- `KanaCatchEngine` 目前只支援 `subMode: 'listen'`；S4 擴充時可傳入 `subMode` 參數切換出題來源，不需修改引擎骨架。
- Canvas 字型對日文假名使用系統 sans-serif，在極少數裝置上可能顯示不佳，S7 可考慮載入 Google Noto Sans JP。
