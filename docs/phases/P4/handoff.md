# P4 恢復

先讀../full-experience.md、project.md、tasks.md、本目錄progress／acceptance。工作樹Japanese101-p2，phase/full-experience，draft PR58。goal仍ACTIVE，完整體驗尚未完成。

P4-02工具工程已寫：src/content/coverage.ts與review-audit.ts、scripts/unit-inventory.ts整合；report docs/content/curriculum-coverage.json。75節點12有候選、63缺口，554內容／素材簽核NOT_RUN；另359假名ledger不混入。最終15項相關單元測試、型別、lint及CLI真實draft／release拒絕已通過，見acceptance。保存／commit／push狀態請查git log/status。

P4-GAP-01新增共通15技能的主測量與延後check，P4總146tasks，prompt同步。下一步依報告補實際題目與素材，同時製作U05～24，每課原創50practice＋真正五題族check，不用換名灌數。未做人審仍DRAFT／IN_REVIEW。

`npm run validate:units`同時查數量、素材、skill與簽核。`node --import tsx scripts/unit-inventory.ts --write`更新機器報告與新單元ledger（不動U01原格式）；`npm run validate:units:release`應拒絕現有缺口。大篇release輸出可寫本機/tmp後只摘統計，不刪錯誤。

不要修改已APPROVED稿；不要把候選題族數當人工語意獨立驗證。不要動交易主機apt／kernel／網路。先讀最新交接與commit，不重做U01～04／假名工程。

最新U05工程已寫並驗證：25詞5漢字3文法50practice＋15check，16WAV、人數原創圖。能力報告目前15候選完整／60缺口、689簽核0有效。P2-09-R2領獎導覽競態修正同批保存，257單元、Chromium5與Firefox7通過；詳acceptance。P5藍圖／題族檢查器與狀態機正另批開發，未接UI或聲稱卷已製作。U06～24與15共通skill仍有獨立工作。

2026-10-30 U06開始：scripts/author-u06-base.py與docs/content/U06/source-draft.json交付25不重複新詞、5新漢字、G16～18、10教學、4閱讀、6聽力文字。production-plan固定14題型與素材預定題ID；尚無真題／音訊／插畫，不加入registry、不改runtime完整內容數。U06-M／T IN_PROGRESS，其他未開始，人工NOT_RUN。下一步接續作者稿產生50真題＋15獨立check，再真WAV與插畫／整合。既有工程ec8419a已push，完整目標未完成。

U06完整工程接續：50真練習＋15check、16真WAV、原創水／麵包／湯／牛奶圖已整合可玩preview。六課150詞300practice，18能力候選完整57缺口、824人審0核准。292單元及型別lintbuild、Chromium四項1.8m PASS；Firefox最終見acceptance。U06-M/T/Q1/Q2/A IN_REVIEW、V BLOCKED、I IN_PROGRESS。不要重跑base覆蓋來源，請用author-u06.py。另ec8419 CI發現備份320px在FF/WK溢出6px，正在讀真CI證據定位；先修後再承接U07與共通15skill／真MA/B/C／mockUI。goal ACTIVE。
