# Japanese101：按 Phase 執行的 agent prompts

版本：1.0｜日期：2026-10-15

每個 Phase 由一個 agent 負責到底，按照 **P0 → P1 → P2 → P3 → P4 → P5** 接續。先完成規劃文件提交與環境解阻，再啟動第一個 Phase；下一個 agent 必須從包含前一階段驗收成果的 commit 開始，不以口頭摘要代替交接。

## 使用入口

| 文件 | 目標 | 本 Phase 任務數 | 完整 gate 的外部條件 |
|---|---|---:|---|
| [通用範本](phase-template.md) | 替換 PHASE 後使用 | 依所選 Phase | 依主規格 |
| [P0](P0.md) | 統一規格與驗證基準 | 8 | 環境、責任人、內容審核 |
| [P1](P1.md) | 資料與操作可靠度 | 13 | 指定裝置驗證 |
| [P2](P2.md) | 首單元完整學習循環 | 16 | 人工內容與視覺審核 |
| [P3](P3.md) | 首四單元及兒童可用性 | 27 | 九位兒童試用與人工審核 |
| [P4](P4.md) | 完整 24 單元課程 | 145 | 分批人工日語與音訊審核 |
| [P5](P5.md) | 模擬測驗及發布準備 | 19 | 實機、人工審核、18 人 14 天試用 |

共 228 項任務；P4 的數量只計本階段新增工作，但 gate 涵蓋全部 24 單元。完整任務與依賴見 [tasks.md](../../tasks.md)，產品及 UI／UX 基準見 [project.md](../../project.md)。

## 啟動步驟

1. 確認 repository 文件可讀、shell 可執行、可建立本機 commit；需要 push／PR 時確認 GitHub 寫入權限。
2. 在支援 Goals 的 Codex session 中開啟正確 repository。
3. 複製對應 Phase 文件中的整段 text 區塊；專用 prompt 不需要替換 Phase 名稱。
4. agent 依依賴持續實作、測試、修復、分批 commit，保存 progress／acceptance／handoff。
5. 完成後看驗收證據與 PR。下一個 Phase 必須以已整合且驗收通過的前一 Phase commit 為基準；本套 prompt 沒有授權 agent 自動合併 main。

官方說明：Goals 讓目標跨 turn 持續，直到成功或遇到中斷、用量上限及外部阻礙；可用 `/goal` 查看、`/goal pause` 暫停、`/goal resume` 恢復。不是無限制執行或權限提升功能。[Using Goals in Codex](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex)

若目前介面不支援 `/goal`，普通 prompt 不保證具備相同的自動續行能力；先使用支援 Goals 的版本／介面，不能靠在文字中宣稱已啟動取代實際功能。

## 狀態定義

- **COMPLETE**：Phase 的全部 task、依賴、人工要求與 gate 均有通過證據。
- **ENGINEERING_READY**：已完成可驗證工程交付，但仍缺指定人工／人測／實機驗收；Phase 與完整 Goal 尚未完成。
- **BLOCKED**：沒有剩餘可獨立推進的工作，外部條件阻止完成；附具體解阻需求。
- **IN_PROGRESS**：仍有可做工作，或因用量／中斷保存交接；不可把這種停止寫成完成。

這些是 Phase 報告狀態；task 狀態仍遵循 tasks.md。Goals 的實際生命週期則由執行平台規則控制。

## 最少干擾與真實驗收

一般技術選型、測試修復與可逆修改由 agent 自行判斷，不反覆詢問。平台要求的進度更新仍可保留。權限不足、沒有裝置、沒有真人試用或缺重大產品決策，不要求 agent 無限重試或偽造證據。

人工審核可先準備可閱讀的題庫、音訊清單與缺口表，再集中交接。完成工程不等於人工審核完成；一個 agent 負責 Phase 也不代表所有驗收都可由 AI 代替。

## 維護

更新 project.md 的驗收或 tasks.md 的分配後，同步檢查本目錄的六份專用 prompt。新任務需有唯一 ID；計數、依賴、教材主題與 Phase gate 必須一致。共通執行規則以通用範本為維護基準，各專用檔內保留同一份完整規則，讓單獨複製時仍可執行。
