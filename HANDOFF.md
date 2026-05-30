# S7 每日任務 + 裝飾獎勵 — HANDOFF

## 對應 SPEC
- §7.1 每日任務（Daily Missions）
- §7.2 裝飾獎勵（Cosmetics）

---

## 本階段做了什麼

### 新建檔案

| 檔案 | 說明 |
|------|------|
| `src/lib/cosmetics.ts` | 5 件裝飾定義 + getNewlyUnlocked / getActiveCosmetic |
| `src/lib/cosmetics.test.ts` | 9 個單元測試 |
| `src/lib/dailyTasks.ts` | 每日任務定義、進度計算、完成記錄 |
| `src/lib/dailyTasks.test.ts` | 15 個單元測試 |
| `src/components/DailyTasksPanel.tsx` | PlayScreen 上的任務面板 UI |

### 修改檔案

| 檔案 | 變更 |
|------|------|
| `src/lib/pet.ts` | addXpToPet 升級時解鎖新裝飾 |
| `src/components/PetAvatar.tsx` | 在寵物頭頂顯示最高等級的裝飾 |
| `src/features/play/PlayScreen.tsx` | 遊戲按鈕上方加入 DailyTasksPanel |

---

## 功能說明

### 裝飾解鎖系統
| ID | Emoji | 解鎖等級 |
|----|-------|----------|
| bow | 🎀 | Lv 3 |
| flower | 🌸 | Lv 5 |
| tophat | 🎩 | Lv 7 |
| graduation | 🎓 | Lv 10 |
| crown | 👑 | Lv 15 |

- 自動裝備最高等級已解鎖裝飾（顯示在寵物頭頂）
- 裝飾 ID 儲存在 IndexedDB `PetState.unlockedCosmetics`

### 每日任務
- 每天 2 個任務，依日期旋轉（5 組配對，每 5 天一循環）
- 進度即時由 IndexedDB sessions 計算（不需額外 DB table）
- 第一次完成 → 獎勵 +5 ⭐，記錄在 `localStorage` 防止重複領取
- 完成記錄 key：`completedTasks_YYYY-MM-DD`（每天自動歸零）

### 任務類型
| 任務 | 測量方式 |
|------|----------|
| 10/20問正解 | 今天所有場次 `correct` 加總 |
| 玩2種遊戲 | 今天出現的不同 `feature` 數量 |
| 玩特定遊戲 | 今天是否有該 `feature` 的場次 |

---

## 測試結果

```
✅ validate:data   — 3 檔案全通過
✅ tsc --noEmit    — 0 errors
✅ vitest run      — 8 files, 98 tests passed（新增 24 個測試）
✅ npm run build   — 450 kB JS, PWA precache 19 entries
```

---

## 給家長的手動驗證腳本

1. 主畫面應看到「きょうのミッション」面板，顯示 2 個今日任務
2. 玩任何遊戲答幾題後返回 → 任務進度條更新
3. 完成一個任務 → 看到「+5⭐」星星動畫，進度條變綠
4. 重新整理後，已完成任務顯示 ✅，不會再次發放星星
5. **裝飾**：在 `/parent` → 設定中手動調高角色等級（目前只能透過遊玩升級，Lv 3 得 🎀）

---

## 已知限制與後續建議

- 裝飾目前自動裝備最高等級，之後可讓孩子在設定中選擇
- 每日任務完成記錄存 localStorage（不是學習進度，不需 IndexedDB）
- 角色等級目前需長期遊玩才能解鎖裝飾（Lv 3 ≈ 300 XP ≈ 30 題）
- 測試用戶可在 parent 面板調整設定後體驗完整流程
