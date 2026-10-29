# P4 恢復

先讀../full-experience.md、project.md、tasks.md、本目錄progress／acceptance。工作樹Japanese101-p2，phase/full-experience，draft PR58。goal仍ACTIVE，完整體驗尚未完成。

P4-02工具工程已寫：src/content/coverage.ts與review-audit.ts、scripts/unit-inventory.ts整合；report docs/content/curriculum-coverage.json。75節點12有候選、63缺口，554內容／素材簽核NOT_RUN；另359假名ledger不混入。最終15項相關單元測試、型別、lint及CLI真實draft／release拒絕已通過，見acceptance。保存／commit／push狀態請查git log/status。

P4-GAP-01新增共通15技能的主測量與延後check，P4總146tasks，prompt同步。下一步依報告補實際題目與素材，同時製作U05～24，每課原創50practice＋真正五題族check，不用換名灌數。未做人審仍DRAFT／IN_REVIEW。

`npm run validate:units`同時查數量、素材、skill與簽核。`node --import tsx scripts/unit-inventory.ts --write`更新機器報告與新單元ledger（不動U01原格式）；`npm run validate:units:release`應拒絕現有缺口。大篇release輸出可寫本機/tmp後只摘統計，不刪錯誤。

不要修改已APPROVED稿；不要把候選題族數當人工語意獨立驗證。不要動交易主機apt／kernel／網路。先讀最新交接與commit，不重做U01～04／假名工程。
