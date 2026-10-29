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

本批驗證：225項單元／24檔案PASS（含新增3項跨單元回歸）；typecheck、lint、Preview build PASS。24項Chromium全PASS（3.8分鐘），對應40269c2多單元基礎提交；後續假名入口需另驗。先完成此批commit再開始下一批。

P3-01首批已實作與驗證，細節見P3 handoff；227單元、型別、lint PASS；2項新Chromium真音訊／切單元／重整測試與3寬截圖通過。獨立check仍缺，勿誤標DONE。PR57 WebKit仍在跑（開始2026-10-29T16:28:03Z），其他3jobs success。


## 最新恢復點（2026-10-30）

- PR57已實際合併：`9c415fd1a690228838fbfab0afdc8a4e5ef92436`；head327ec61，CI40911695545的Test & Build及Chromium／Firefox／WebKit全部success。第一次平台核准服務capacity失敗未執行，原請求重試成功，沒有繞過審查。
- 後續PR58：https://github.com/dannythreeka/Japanese101/pull/58 ，draft；branch `phase/full-experience`，最新產品提交 `bb1aa45d916582dbf21fd64c0f05818d723d50f1`，已push。40269c2為多單元基礎。此文件後續提交只更新交接。
- goal仍active：完成所有Phase／完整體驗。沒有token預算，尚不能complete，也沒有理由blocked（仍有大量可實作工程）。P2人審未完成仍保留，但依最新使用者授權繼續獨立工程。
- 本機工作目錄仍`/home/yyy/workspace/Japanese101-p2`，不要因命名p2誤切舊分支。後續git push目標必須phase/full-experience，勿再執行固定推p2的/tmp/j101-push-p2.py。
- Git credential helper仍可用：`git -c credential.helper= -c 'credential.helper=!python3 /tmp/japanese101-recovery/git-credential.py' -c credential.useHttpPath=true push origin phase/full-experience`；網路需平台核准require_escalated，勿印token。

### 下一實作批次：P3-01獨立檢核

目前kata／hira只提供practice，獨立check確實未作。既有110個詞語中可找到涵蓋45基本字且不含小ゃゅょっ或長音符的2字以上詞；`を`缺詞例。可以用完整詞語音訊要求辨識指定音拍，比單字音對字形的practice不同；同一詞語不同位置仍共用一個題族，不能逐位置假增family。需要逐例確認音拍與可理解的指示。`を`可另產真實句子音訊，例如「ほんをよみます」，但還未生成；synthesis與PCM驗證在scripts/audio-source.ts（既有免費tts.quest/VOICEVOX四国めたん、限次重試、不買服務、不補假WAV）。

先修檢核必須允許未教已會者實測略過，同時不捏造taughtAt／stable mastery，不能把練習變成5題族通過證據。現有startCheck需先teach；應設計明確的先修診斷入口與持久狀態／測試，不能解除所有正式check的先修限制。題目與音訊仍DRAFT，人工review另列。

### 後續重驗

227單元／typecheck／lint最後PASS。U01的24項ChromiumPASS對應40269c2；假名2項ChromiumPASS對應bb1aa45除最後due篩選一行（已在單元／型別通過，完整PR58 CI負責最後整合）。下一批開始前查PR58 CI，處理任何新失敗，不以舊綠燈代替。3幅最後kana-teaching截圖已視覺檢查；46按鈕改select是實際修正，不再引用前版長頁截圖。

## 先修檢核已實作，下一批轉U02（2026-10-30）

上方「下一實作批次P3-01獨立檢核」已完成工程，勿再重做。kana-2-draft兩script各46獨立詞語題、完成組才給先修credit、不偽造教學／stable；實際音訊與359筆review ledger俱備。231單元／lint／型別／build、4ChromiumPASS，新release人審缺口確實阻擋。詳細P3 handoff。最新未人審task仍不能DONE。

PR58上一版f7a9cf2的CI40916267390已確認Test & Build及三瀏覽器全綠。新提交需新CI。接續U02～U04、P4/P5工程及真人材料；goal持續active。全部尚未完成，不可終止為COMPLETE或BLOCKED。
