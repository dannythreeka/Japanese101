# P0 可恢復交接

Repository：`/home/yyy/workspace/Japanese101`；分支：`phase/p0-baseline`；draft PR：[53](https://github.com/dannythreeka/Japanese101/pull/53)。先`git status`／`git log`，讀progress.md、acceptance.md、project.md、tasks.md，不重置或覆寫使用者修改。

目前Phase BLOCKED／NO-GO。DONE：ENV-01、P0-01、P0-02、P0-04。IN_REVIEW：P0-03、P0-05。BLOCKED：P0-06、P0-07。人工gate未過，不開始P1。

## 重跑環境與檢查

使用`.nvmrc`的22.23.2（已安裝）。非互動shell若nvm未載入，可把`/home/yyy/.nvm/versions/node/v22.23.2/bin`加到PATH；npmci不改主機apt。
依ENGINEERING_RULES執行typecheck、data、blueprint（10個壞fixture／正常案例）、lint、unit、build。已知lint28errors／1warning，不能以重跑期待自行消失；P1-13接手。

```sh
npm ci
npm run typecheck
npm run validate:data
npm run validate:blueprint
npm run lint
npm test
npm run build
P0_E2E_PORT=4177 npm run test:e2e -- --project=chromium --project=firefox
```

Playwright config預設port4173、拒絕reuse既有server。若占用，挑未使用port設定P0_E2E_PORT；不要殺不明程序。Node22下132測試PASS；Node26不在支援範圍。WebKit本機缺系統庫，CI隔離runner三引擎可跑；不要sudo install-deps或apt安裝到此交易主機。

UI capture／probes見ui-baseline.md命令（先preview4173）。它們用新browser context／合成QA玩家，不接真雲端、不開真麥克風；SW離線另用allow context。capture是computed文字200%，不是原生zoom／實體裝置。

## 證據與恢復

- docs/verification/baseline.md：原始／最終結果與CI links。
- evidence/P0/initial-*：原始Node26檢查，不覆寫。
- evidence/P0/final-*：支援Node22與工具後檢查，已知lint失敗及首次port衝突保留。
- evidence/P0/ci/：三引擎首頁／trace與CI summary，含PR head和GitHub合成merge SHA，兩者不可混稱。
- evidence/P0/ui/：五寬／200%、metrics；F01～07及同步錯誤另在P0 evidence根目錄。
- CONTENT_BLUEPRINT＋docs/content/n5-manifest.json：草案非審核內容、非runtime schema，reviewer尚null。
- GitHub PAT僅由既有授權工具／環境存取，不把token、credential檔或臨時helper提交到repo。push已授權，merge／正式發布未授權。

## 最小外部解阻

見acceptance.md四項：真人日語審藍圖（含60文法候選）、確認工程／產品／內容／UXQA承接與簽核、可核SHA的preview合法存取，然後P0 gate重審。不要用AI或WebKit代替真人／實機簽核，不要只因有PR／build成功標COMPLETE。

主機為Mac Mini交易機，Wi-Fi依賴Broadcom與核心6.11.0-21 hold。禁止為此任務apt upgrade／autoremove、改核心／驅動hold、重啟網路或交易服務。AppArmor bwrap profile先前由使用者暫時載入，未做開機持久化；若重啟後同錯，保存diagnostic交主機維護者，不全域關AppArmor或放寬userns限制。
