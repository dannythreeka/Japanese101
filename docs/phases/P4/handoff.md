# P4 恢復

2026-10-30，goal ACTIVE，完整體驗未完成。先讀project.md、tasks.md、本目錄acceptance.md及../full-experience.md。本檔維護最新恢復狀態；歷史測試與失敗保留acceptance及git，不依舊進度段落重做已交付教材。

工作樹`/home/yyy/workspace/Japanese101-p2`，branch `phase/full-experience`，Draft PR58。原P1 checkout勿碰。已push先修修正662be67；之後交付狀態以git log/status為準，不自動merge／正式發布。

## 已有工程

- 實際U01～08八課，另兩份假名pack，共10pack；200新詞40漢字24文法32閱讀48聽力400practice。U02～08各10教學、50practice＋15check、16真WAV與原創四格圖；U01保留原9教學／14WAV。
- P4-02工具：全課數量、14題型、跨單元去重、技能primary practice／五check題族、逐筆來源hash／reviewer／日期檢查。75能力24有候選，51缺口（15共通＋36未製作文法）；1094筆教材／素材審核0真人核准，另359假名ledger。
- P4-03-R1：U01 u01-3-draft、U06 u06-2-draft先修對齊P0，舊ledger封存。d35221c真操作舊存檔兩引擎6PASS：答案、20coin、帽裝備及交易不變，舊plan／未完戰鬥歸檔後安全重開；G03不可跳G02。見evidence/prerequisite-upgrade.json，勿在新版重跑capture腳本覆蓋舊fixture。
- P4-04：各課lazy import／白名單與catalog一致性、舊routes按需載入、500000-byte chunk／單課900000-byte實際JS預算；不是FPS證明。新增教材需同步registry／loader／catalog／media／art／introductions／labels。
- U08完整作者稿、16WAV3740384 bytes，最終原創transport-v2.webp513466 bytes。初圖電車尾端裁掉，已內建image_gen修成完整單節；原PNG保留，初版WebP只留本機不加入offline包。每格627平方，實際四格圖已檢視。
- U08測試發現P4-04-R1：等待ServiceWorker.ready固定8秒會在有效慢安裝時誤報；真trace尚無手動素材請求，延後真ready承諾10秒在舊版穩定重現。現改為可取消的實際生命週期等待、真失敗回報與可重試註冊，新增準備狀態；不增加測試timeout。最終操作結果見acceptance。

## 接續與檢查

1. 先查git log/status及acceptance最新段落，確認U08／P4-04-R1已保存。308單元／43檔、lint、typecheck、build已通過；瀏覽器批次若仍有活session，先poll相同handle或查實際程序，不重建dist中斷驗收。
2. U08首輪15PASS／1Firefox離線ready失敗；修正後大批次已完成6項，但以SIGTERM中止，未產生全套完成報告。不可稱22全綠。分批保留各實際結果，見acceptance／本機/tmp/japanese101-recovery/u08-*.log。
3. U09～24原創教材，以及P4-GAP-01共通15技能仍需實作。每課50practice與check分開，不能機械換人名灌family。24課總配額600詞100漢字60文法96閱讀144聽力1200practice不變。
4. P5有mock schema／純狀態機／DB／報告與隔離題庫verifier，僅fixtures，不是三份正式卷或完整mock UI；29表完整備份與可靠下載／安全等待更新已寫。仍須MA/MB/MC各80真題、25/30/25分區20/40/30分鐘、實際播放器與報告／瀏覽器驗證。
5. 不因人審缺失停掉其餘獨立工程；也不把工程證據當task DONE或Phase COMPLETE。U08-M/T/Q1/Q2/A IN_REVIEW，V BLOCKED缺非原作者真人，I IN_PROGRESS。P3九人試用、P5十八人14天、實機／真人視覺與音訊gate均未通過。

## 命令與限制

Node22：`export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH`。`npm test`、`npm run lint`、`npm run typecheck`、`npm run validate:journey`、`npm run validate:units`、`npm run validate:packs`。`node --import tsx scripts/unit-inventory.ts --write`更新真實盤點；release應拒絕缺課／缺人審，不修改門檻。

`VITE_P2_REVIEW_PREVIEW=1 npm run build`，少此旗標preview routes不存在。`P0_E2E_PORT=4268 npm run test:e2e -- e2e/p4-u08.spec.ts e2e/p4-offline-readiness.spec.ts --project=chromium --project=firefox`。兩引擎與實體平板分開記錄；WebKit依賴僅裝CI隔離runner。需要spawn／browser／network用平台範圍核准require_escalated；預設sandbox會對spawnSync回EPERM。

不要重產已成功WAV；產生器只在腳本／檔hash一致時重用。author-u08.py為完整作者稿；base拒絕覆寫已有65題。禁止動交易主機apt、kernel、Broadcom、WiFi、Tailscale、交易排程或重啟；不輸出憑證，不自動merge PR58或正式發布。

最新驗證：上述分批接續已完成，合計21個不同browser/case均PASS（Chrome11／Firefox10），詳P4/evidence/u08-engineering.json。原中止批次保留真狀態，非22全綠；剩餘Firefox7項已PASS（1.5m），延後ready與離線2PASS，精確假名題兩引擎2PASS。相關runtime已驗證，接續教材與mock工作。
