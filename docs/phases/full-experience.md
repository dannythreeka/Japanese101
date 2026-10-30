# 完整體驗持續交接

2026-10-30。使用者目標：「把所有的phase都全部實作完成，我想直接體驗完全體版本」。goal ACTIVE，尚未完成。project.md已授權跨P2～P5獨立工程與隔離草稿預覽；真人內容、音訊、視覺、實機與兒童gate仍須真實證據，不因缺同一項人審停止其他可推進工作。

## 工作樹與授權

`/home/yyy/workspace/Japanese101-p2`，branch `phase/full-experience`；原P1 checkout勿碰。PR57已merge9c415fd1a690228838fbfab0afdc8a4e5ef92436。後續Draft PR58：https://github.com/dannythreeka/Japanese101/pull/58 ，已授權commit／push／維護PR，未授權合併PR58或正式發布。本次所有未提交修改均本session工程，仍先查git status保留其他工作。

最近已push662be67e8cee41e1ce5b06fdaa6518588b34e2cf（P4-03-R1先修及舊存檔升版）。其CI41005544031已查Test & Build／Chromium／Firefox success，WebKit最後仍in_progress。之後提交與CI查git log及當前遠端；不要拿此舊CI替代U08／離線新修正的結果。歷史測試／失敗在各Phase acceptance與git，這份維持最新恢復基準。

## 實際交付

- P0／P1沿用使用者已驗證狀態；P2小鎮自由移動、三入口、日語戰鬥、世界／回合保存、金幣receipt、商店與角色／夥伴裝備、家長報告已有可玩隔離預覽。P2真人與實體平板gate未自行補PASS。
- 實際九課U01～09：225首次引入詞、45漢字、27文法、36閱讀、54聽力材料、450practice；另每課15check候選。兩份假名各46教學／46practice／46詞語check，共10實際pack。U02～08各10教學16真WAV與原創四格插畫；U01原9教學14WAV。所有單元可到教學／道館／報告，未知ID不回退U01。
- 假名略過資格只能由完整合法check得出，不寫假教學時間或穩定掌握。五題族／48h／跨兩日／4/5首次無提示能力門檻未改。世界、金幣與裝備按玩家共用，教材battle／check／studyPlan按unit隔離；exportJourney匯出整位玩家，報告按unit。
- P4-02工具按真pack檢查配額／14題型／去重／來源hash／skill／簽核；75能力27有候選，48缺口＝15共通＋33未製作文法。1229教材素材審核0真人核准，另359假名ledger；不是已核准教材。
- P4-03-R1：U01 u01-3-draft、U06 u06-2-draft修正先修漂移；舊ledger原文封存。真d35221c舊UI存檔兩引擎6PASS，保留答案／20coin／裝備／交易，歸檔舊plan與未完戰鬥再重開。G03不能繞G02。詳P4/evidence/prerequisite-upgrade.json。
- P4-04教材與routes分載，catalog／白名單一致性；硬性每chunk500000 bytes、單課初載JS900000 bytes預算。最新index439788、U06初載730598。不是FPS或實機效能證明。
- U08原創交通圖已修正電車後端完整，最終transport-v2.webp513466 bytes、16WAV3740384 bytes。九課離線包600素材47278244 bytes，PWA657entries約47.1MiB。P4-04-R1修掉SW.ready固定8秒誤報，改可取消生命週期、真失敗及顯式重試，準備狀態有中日文；詳P4 acceptance。
- P3九人試用材料與匿名fixture已備，尚無真人招募／同意／實際試用。fixture用新context、40合成起始coin、零作答，拒覆寫，不能假裝真人或實機結果。
- P5已有三卷結構／題族隔離verifier、純狀態機、DB交易／冪等命令、raw報告規則，均只測試fixture，不是正式MA/MB/MC或完整UI。29表完整備份／還原、跨玩家與來源校驗、預覽變更拒絕／原子回滾，以及三種可靠JSON匯出、安全等待更新已有工程證據。

## 下一步

1. 先讀P4/handoff.md與acceptance最新段，確認U08及離線修正最後瀏覽器批次狀態／commit／push。308單元／43檔、lint／typecheck／build已通過；首次16測試15PASS／1Firefox就緒失敗，修後整批6項成功但SIGTERM中止，已分批承接，不宣稱中止批次全綠。
2. U10～24真實原創教材，單元50practice與15check分開；加上P4-GAP-01共通15技能的primary練習／五獨立check題族，不能換名重排灌family。24課配額600詞100漢字60文法96閱讀144聽力1200practice不變。U09已完成隔離工程驗證，先讀最新P4-03-R2，再承接後續作者稿、素材與操作。
3. 真MA/MB/MC各80題，25/30/25分區、20/40/30分鐘，彼此及練習題族隔離；實際計時／中斷／冪等交卷UI、播放器／音訊／報告與瀏覽器驗證仍待做。
4. 真人日語、音訊／視覺、實體iPad／Android、九人試用與十八人14天試用只記真實結果，不招募、購買或發送訊息。仍有大量獨立工程，不能標goal COMPLETE或BLOCKED。

## 恢復命令與主機限制

Node22：`export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH`，default Node26不符合repo。`npm test`、`npm run typecheck`、`npm run lint`、`npm run validate:journey`、`npm run validate:units`、`npm run validate:kana`、`npm run validate:packs`。新課同步registry／loader／catalog／media／art／introductions／labels，執行`node --import tsx scripts/pack-catalog.ts --write`及`node --import tsx scripts/unit-inventory.ts --write`。

`VITE_P2_REVIEW_PREVIEW=1 npm run build`，缺旗標則沒有preview路由。`P0_E2E_PORT=4268 npm run test:e2e -- e2e/p4-u08.spec.ts --project=chromium --project=firefox`；trace與各小批報告在/tmp/japanese101-recovery，最新索引見Phase evidence。先確認舊程序已終止，不因觀察timeout重啟，也不在瀏覽器測試中改dist。

需spawn／browser／network使用平台require_escalated範圍核准；預設sandbox會對spawnSync回EPERM。WebKit依賴只在CI隔離runner裝。禁止變更主機apt、kernel、Broadcom、WiFi、Tailscale、交易排程或重啟；不輸出憑證。

push用既有安全helper：`git -c credential.helper= -c 'credential.helper=!python3 /tmp/japanese101-recovery/git-credential.py' -c credential.useHttpPath=true push origin phase/full-experience`。保留分支與Draft PR，不自動合併／正式發布。

最新驗證：上述分批接續已完成，合計21個不同browser/case均PASS（Chrome11／Firefox10），詳P4/evidence/u08-engineering.json。原中止批次保留真狀態，非22全綠；剩餘Firefox7項已PASS（1.5m），延後ready與離線2PASS，精確假名題兩引擎2PASS。相關runtime已驗證，接續教材與mock工作。

U09來源已保存：scripts/author-u09-base.py與docs/content/U09/{README,source-draft,production-plan}，25不重複詞、5新漢字見聞読書話、G25～27先修與P0一致、10教學4閱讀6聽力稿；尚無50題／check／音檔／圖／runtime註冊。M/T IN_PROGRESS，其餘TODO。接續需寫完整author-u09.py，不能宣稱九課可玩或改五題族／人審門檻。前一fa15ff9為U08及離線修正；本批只加未註冊作者來源與交接，已測runtime不變。

2026-10-30 U09工程完成：25新詞5字G25～27、50practice＋15check、16WAV4106464bytes及活動圖555154bytes已接入；九課225詞450practice。65組完整日文題幹／解析與10教學仍是待人審作者稿。播放器群組名稱跟可見題幹一致，雙語切換保留情境／選取／音訊門檻與唯一Attempt。310單元與18兩引擎case通過，見evidence/u09-engineering.json。27能力候選48缺口、1229人審0有效；P4-03-R2已記舊課泛用日文漏情境與語言標記，仍IN_PROGRESS。U09-V缺真人，其他非DONE。接續先修R2真漏項、共通15skill、U10～24、真模擬卷與UI；goal ACTIVE。

2026-10-30 P4-03-R2 U08修復：u08-2-draft與65題revision2，完整日文情境／解析、10教學／例句說明及257明確choice.lang已交付。舊真48167bd存檔升版保留v1答案、20coin、帽裝備與交易、原文歸檔後安全重開。312單元＋30不同兩引擎case PASS，最終引用／用詞四次重驗與JS預算1PASS，詳acceptance及localization-u08-engineering.json。release拒絕520缺語言舊題；人審仍1229筆0有效，U08新版135NOT_RUN。R2整體仍IN_PROGRESS，接續U01～07語意／其他含U09語言資料、共通15skill、U10～24、正式模擬卷／UI，goal ACTIVE。

下一優先P4-04-R2：head48167bd的CI41011202850已完成，Build／Chrome／FF成功，WebKit100PASS／1FAIL／1SKIP，失敗是503教材chunk後reload仍錯誤。trace只有第一次u06請求503，reload後未再請求，SW明確blocked；快取假設待驗，不能只加timeout或讓測試不再模擬錯誤。最小失敗證據已入evidence/webkit-retry-48167bd（含trace），先讀summary.json與test-source再修。這個新缺口未被U08語言修復解決，goal仍ACTIVE。


2026-10-30 使用者要求：本批 U08 語言修正收尾後暫停，避免繼續消耗用量。已完成的 U01～U09 草稿工程及本批測試保留；未開始 U10，不繼續 WebKit 重試修復。整體尚未完成，goal PAUSED。恢復時先核對本次 commit 與工作樹，再接 P4-04-R2；真人審核與實機 gate 維持原狀。
