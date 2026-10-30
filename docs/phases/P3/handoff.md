# P3 恢復

先讀../full-experience.md、progress.md、acceptance.md、project.md與tasks.md。目錄Japanese101-p2，分支phase/full-experience，原P1 checkout勿碰。完整體驗goal仍ACTIVE；使用者授權跨phase草稿工程，未取消任何人工gate。

## 目前交付

- 已push3982b5c（U03），draft PR58；CI40930288466建置及三引擎success。前3289f0（U02）CI40925952499同樣成功。
- 假名各46教學／46練習／46詞語檢核，359人審NOT_RUN；只以完整合法check給略過資格，不寫假taughtAt或stable。
- U01～04四課真實JSON，合計100唯一詞20漢字12文法16閱讀24聽力200練習。U02／03／04各10教學16音訊65題、原創四格圖、135筆人審NOT_RUN；U01既有149筆gate原狀。
- 四課都有世界／道館／教學／練習／check與家長報告。media.ts集中實際素材，introductions.ts集中介紹，不回退錯單元。exportJourney保留該玩家全課戰鬥／check，state仍取當課，勿混為一處篩選。
- 本批U04／fixture是否已commit/push看git log/status。246單元／30檔、39 Chromium P2/P3整合PASS（8.0m）；39之後僅U04提示改位置用語，最終7項重驗全PASS（2.0m），位置提示圖已檢視，詳acceptance。
- P3-03 scripts/usability-fixture.mjs可建立本機新context匿名40金幣補助與零作答快照，拒覆寫已有紀錄；A-1～C-3對應年級組，.d.mts提供TS介面。headful／平板、人員／同意／真試用均未通過。詳usability/README。

## 下一步

1. U04最後7項瀏覽器重驗與截圖檢視已完成，保存證據／commit／push PR58，維持draft。讀實際CI，不用舊版CI替代。
2. P3-02達工程配額仍不是task DONE：U01～04人審、P3-03～06九人與實機gate未滿。
3. 繼續已授權P4工程：先補P4-02全課skill／五題族缺口與review檢查，再製作U05～24真實原創內容與音訊；目前只有G01～12的獨立grammar檢核，其他共通skill仍需全課coverage盤點，不假稱全部skill已滿五題族。
4. P4需600詞100漢字60文法96閱讀144聽力1200練習。P5需三份原創80題卷、計時／中斷／冪等交卷、原始分數報告、完整備份還原、安全SW更新。這些仍有大量獨立工程可做，不把goal標COMPLETE或BLOCKED。

## 命令與限制

Node22：`export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH`。
`node --import tsx scripts/unit-inventory.ts --write`；`npm run validate:journey`；`npm run validate:kana`。
`VITE_P2_REVIEW_PREVIEW=1 npm run build`；`P0_E2E_PORT=4248 npm run test:e2e -- e2e/p3-u04.spec.ts e2e/p3-curriculum.spec.ts e2e/p3-fixture.spec.ts --project=chromium`。
真音訊來源核對後才重用，長稿單job120s截止；別重產已成功素材。作者稿拒覆蓋APPROVED內容；新稿需人審，review-ledger只保留同ID／hash簽核。
禁止主機apt、kernel、WiFi、Tailscale、交易程式或重啟變更。WebKit依賴只在CI隔離runner裝；不要為本機測試改主機。
