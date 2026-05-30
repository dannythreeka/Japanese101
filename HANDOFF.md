# S6 家長儀表板升級 — HANDOFF

## 對應 SPEC
- §6.1 家長儀表板：進度/正確率/時間
- §6.2 PIN 鎖定
- §6.3 年齡模式切換
- §6.4 課程開關

---

## 本階段做了什麼

### 新建檔案

| 檔案 | 說明 |
|------|------|
| `src/features/parent/dashboardUtils.ts` | 從元件抽出的純函式：formatTime / getDayLabel / last7DayCounts / featureAccuracy |
| `src/features/parent/dashboardUtils.test.ts` | 11 個單元測試 |

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `src/features/parent/ParentDashboard.tsx` | 新增「ねんれいモード」切換 + 課程開關 Toggle，重構使用 dashboardUtils |
| `src/store/useAppStore.ts` | 新增 `disabledUnits` + `toggleUnit`；`ageMode` 現在持久化到 localStorage |
| `src/features/kana-catch/questionGenerators.test.ts` | 修正既有 flaky 測試（SRS 加權）|

---

## 功能說明

### 年齢モード切換
- **幼齢 🐣**：ローマ字あり・ゆっくり（fallSpeed 110）・清音メイン（6〜8歳）
- **進階 🚀**：ローマ字なし・はやい（fallSpeed 210）・全かな（9〜12歳）
- 設定持久化（localStorage）→ 重新整理後不會重置

### 課程開關 Toggle
- iOS 風格 toggle switch
- 預設全部開啟（`disabledUnits: []`，opt-out 設計）
- 新增課程時自動開啟，不需遷移舊資料

### 既有功能（已在 repo 中，本次保留）
- PIN 鎖定（預設 1234）
- 學習時間、星星數、正確率、7 日活動圖表
- 假名模式、難度設定

### Flaky 測試修正
- `questionGenerators.test.ts`：SRS 加權測試之前沒有設定「非 due」項目的 nextReview，
  導致所有無進度項目都被視為 due，讓測試有 ~12% 機率失敗。
  現在明確把其他項目設為未來時間，再覆蓋 'a' 為 due，測試變成確定性。

---

## 測試結果

```
✅ validate:data   — 3 檔案全通過
✅ tsc --noEmit    — 0 errors
✅ vitest run      — 6 files, 74 tests passed（新增 11 個 dashboardUtils 測試）
✅ npm run build   — 446 kB JS, PWA precache 19 entries
```

---

## 給家長的手動驗證腳本

1. 主畫面 → 點「👨‍👩‍👧」→ 輸入 PIN（預設 1234）
2. **ねんれいモード**：點「幼齢 🐣」→「進階 🚀」→ 確認按鈕高亮切換
3. 回到主畫面，進「かな つかまえろ！」→ 確認速度/ローマ字顯示符合模式
4. 回家長頁，**レッスン toggle**：點「柿子與鑰匙」toggle → 確認關閉後遊戲仍可進入（資料尚存）
5. 重新整理頁面 → 年齢モード設定應被記住

---

## 已知限制與下階段

- `disabledUnits` 目前只影響儀表板顯示，尚未傳入 KanaCatchSetup 過濾課程選擇
- PIN 變更功能尚未實作（預設 1234）
- S7：PWA 精緻化、每日任務、裝飾獎勵
