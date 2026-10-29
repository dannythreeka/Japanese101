# 完整體驗持續交接

2026-10-30：使用者授權完成所有 Phase 並直接體驗完整版本。目標 active，工程尚未完成。

## 分支與當前操作

- worktree：`/home/yyy/workspace/Japanese101-p2`；新分支 `phase/full-experience`，基準 `327ec61f357789665617d601ad6c7c9c78de0ea1`。
- P2 入口修正在 `phase/p2-adventure` 已 push，PR57 尚待合併；使用者已授權。CI run `40911695545`，Test & Build PASS，三瀏覽器仍執行。合併時使用 expected head 327ec61，不假稱已合併。
- P2 人審與實機未回覆；舊149筆 ledger 仍 NOT_RUN。新版功能限定預覽，正式首頁維持舊版，沒有偷偷取消驗收旗標。
- 本批 P3-02 前置修正：repository 戰鬥／檢核／版本恢復以 unitId 隔離，三項回歸防跨單元覆寫；教學／戰鬥／檢核與useJourney接受 UnitPack，預設U01相容。尚未製作U02～U24，不能標內容完成。

## 推進順序

1. 完成並合併PR57；後續工程留在 full-experience，分批驗證、commit、push、PR。
2. P3-01：92字先修（平片分開）、完整教學／練習／可跳級檢核／保存／音訊。不得用舊收藏圖鑑代替。
3. P3-02／U02～U04：多單元 registry／道館選課、獨立進度、實際內容與音訊、inventory、審閱頁。P3-03備妥匿名人測材料；04～06保留真人依賴。
4. P4：24單元600詞100漢字60文法96閱讀144聽力1200練習＋技能五題族；按 manifest 創作、驗證與逐項審核。不得只複製換字灌題或把無音草稿算正式教材。
5. P5：A/B/C獨立題族與科目狀態機、時間／中斷／交卷／raw評量、家長完整備份與還原、SW安全更新、離線與三引擎驗證。
6. 真人／實機／九人與18人14天試用按真實證據處理；收集問題由agent修正。不因工程提前開發把前置gate或完整Phase標DONE。

## 恢復

先讀本檔、project.md、tasks.md、P2 handoff、git status/log。Node22路徑見P2 handoff。禁止更動交易主機apt/kernel/Wi-Fi等。不要重做已通過工程、不要碰原P1 checkout。新目標取代先前單一P2被blocked的範圍，勿因同一人工缺口停止全部可獨立工程。

本批驗證：225項單元／24檔案PASS（含新增3項跨單元回歸）；typecheck、lint、Preview build PASS。24項Chromium正在執行，session43558；檢查完成後更新結果。先完成此批commit再開始下一批。
