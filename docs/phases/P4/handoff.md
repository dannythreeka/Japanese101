# P4 恢復

先讀../full-experience.md、project.md、tasks.md、本目錄progress／acceptance。工作樹Japanese101-p2，phase/full-experience，draft PR58。goal仍ACTIVE，完整體驗尚未完成。

P4-02工具工程已寫：src/content/coverage.ts與review-audit.ts、scripts/unit-inventory.ts整合；report docs/content/curriculum-coverage.json。75節點12有候選、63缺口，554內容／素材簽核NOT_RUN；另359假名ledger不混入。最終15項相關單元測試、型別、lint及CLI真實draft／release拒絕已通過，見acceptance。保存／commit／push狀態請查git log/status。

P4-GAP-01新增共通15技能的主測量與延後check，P4總146tasks，prompt同步。下一步依報告補實際題目與素材，同時製作U05～24，每課原創50practice＋真正五題族check，不用換名灌數。未做人審仍DRAFT／IN_REVIEW。

`npm run validate:units`同時查數量、素材、skill與簽核。`node --import tsx scripts/unit-inventory.ts --write`更新機器報告與新單元ledger（不動U01原格式）；`npm run validate:units:release`應拒絕現有缺口。大篇release輸出可寫本機/tmp後只摘統計，不刪錯誤。

不要修改已APPROVED稿；不要把候選題族數當人工語意獨立驗證。不要動交易主機apt／kernel／網路。先讀最新交接與commit，不重做U01～04／假名工程。

最新U05工程已寫並驗證：25詞5漢字3文法50practice＋15check，16WAV、人數原創圖。能力報告目前15候選完整／60缺口、689簽核0有效。P2-09-R2領獎導覽競態修正同批保存，257單元、Chromium5與Firefox7通過；詳acceptance。P5藍圖／題族檢查器與狀態機正另批開發，未接UI或聲稱卷已製作。U06～24與15共通skill仍有獨立工作。

2026-10-30 U06開始：scripts/author-u06-base.py與docs/content/U06/source-draft.json交付25不重複新詞、5新漢字、G16～18、10教學、4閱讀、6聽力文字。production-plan固定14題型與素材預定題ID；尚無真題／音訊／插畫，不加入registry、不改runtime完整內容數。U06-M／T IN_PROGRESS，其他未開始，人工NOT_RUN。下一步接續作者稿產生50真題＋15獨立check，再真WAV與插畫／整合。既有工程ec8419a已push，完整目標未完成。

U06完整工程接續：50真練習＋15check、16真WAV、原創水／麵包／湯／牛奶圖已整合可玩preview。六課150詞300practice，18能力候選完整57缺口、824人審0核准。292單元及型別lintbuild、Chromium四項1.8m PASS；Firefox最終見acceptance。U06-M/T/Q1/Q2/A IN_REVIEW、V BLOCKED、I IN_PROGRESS。不要重跑base覆蓋來源，請用author-u06.py。另ec8419 CI發現備份320px在FF/WK溢出6px，正在讀真CI證據定位；先修後再承接U07與共通15skill／真MA/B/C／mockUI。goal ACTIVE。

P4-04提前工程：課程metadata＋各課lazy import、明確pack、不再隱性載U01；舊route也lazy。index439123bytes、U06首次JS722211bytes、單chunk500000硬性build guard。catalog需新增課後執行pack-catalog.ts --write及validate:packs，CI會核對。兩引擎載入／503重開／延遲切換六項PASS，294單元＋三相關PASS。完整Chromium79項跑在session4992、port4258，原第7項生命週期setup等待失敗，已修等待實際setup或已恢復canvas，針對兩引擎各20次資源歸零PASS；原全套最後結果待取。U07作者稿／65題與真音訊／蘋果圖正獨立製作，未註冊，不要在session4992結束前改runtime或重建dist。工程與U07分批提交。

載入優化最終：完整Chromium78PASS／1舊setup等待競態FAIL（23.1m），該case修正後兩引擎20次進出／零RAF／零timers PASS；其他78項產品驗證有效。新載入六項與294單元＋三相關、型別lint及439k build通過。下一步先修Firefox下載：CI trace點擊後還有44s但無download，延後anchor dispatch100ms已在現版重現；JourneyReport與LegacyBackup立即revokeObjectURL，FullBackup已延後，需統一可靠下載helper並真實驗證。U07已65題＋16WAV＋蘋果圖完成素材，尚未registry／loader／catalog／media註冊；要整合後再跑操作。session4992已終止，不重跑79整套，除非後續實質改動需再擴驗。

最新保存：載入優化已commit d35fa60，尚未push（前一已push0d440eb）。完整Chromium已結束78PASS／1舊setup等待競態FAIL（23.1m）；該case修正後Chromium／Firefox各20次零RAF／timers PASS。U07已65題、16真WAV、蘋果圖426556 bytes，source、production-plan、author-u07.py與art-prompt已寫，尚未註冊runtime。等P5下載修正驗證及提交後，再加u07.ts／registry／loader／media／introductions／labels，跑pack-catalog.ts --write、unit-inventory.ts --write與e2e/p4-u07.spec.ts（已準備未跑）。下一步U08～24／共通15skill、真mock與UI。

下載修正最終：三種匯出共用downloadJSON，anchor掛DOM且blob/link延後一秒清理；延後100ms原生派送的兩引擎四項真下載與JSON讀回PASS，Firefox原U02流程／完整備份等九項PASS。typecheck/lint/build與500k guard通過。session33497、48145皆已成功終止，不重跑；恢復先查git log。本批提交後即可接U07註冊：作者65題、16WAV、426556-byte蘋果圖已實際製作但未進registry／loader／catalog／media；e2e/p4-u07.spec.ts已準備。U08～24與共通skill／真mock／人審仍未做，goal ACTIVE。
