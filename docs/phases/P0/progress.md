# P0 執行紀錄

狀態：**BLOCKED／NO-GO**，所有可獨立推進的P0工作已完成並提交於PR #53；外部缺項見acceptance.md。目標未完成，未進P1。
基準main@9100671；分支phase/p0-baseline。工程與初步QA／視覺審視：本session Codex；真人審核與長期承接待確認。

## 已完成批次

- b481099：盤點21路由條目／主要feature／8game_modes，標新舊規格差異與F01～08修復任務，歷史文件加版本提示。
- 935631a：六份規格入口、137列驗收索引、24單元／75節點／14題型的機器可讀藍圖；內容仍待人審。
- 637ab42：.nvmrc22.23.2、Playwright1.58.0、三引擎smoke、真正project-reference typecheck、CI lint／blueprint／artifact、Vercel版本JSON、退役Pages workflow（待合併）。
- 3b0d877：隔離UI probe、尺寸／overflow／焦點量測與五寬／文字放大capture工具；新增P1-13並同步總任務228／P1共13項。
- 後續證據批：提交初始與最終logs、CI三引擎截圖／trace、55張UI觀測、缺陷、gate與交接。精確最終SHA見PR／git log。

## 已解決與未解

Node26原始129/132（localStorage未定義），同程式既有Node22 132/132；保留兩者紀錄。原lint28error／1warning不變，CI正常報紅；P1-13追蹤，沒有停用規則。Blueprint10案例通過。
Chromium／Firefox本機可用。WebKit下載成功但缺系統函式庫；不更動主機，改隔離CI runner驗證，三引擎smoke均PASS。API artifact已保存重要trace與截圖。
重現F01（錯點後仍10/10）、F02（促音崩潰）、F03（B見A資料）、F04（offline仍啟SR，API spy）、F05（mic off必做挑戰返回未完成）、F06（直連無作答發50XP）、F07（SW無WAV、離線首播fetch失敗）。
Vercelproduction與branch部署由GitHub可核SHA，正式別名可讀。但branch preview跳Vercel登入，HTTP200實為HTML，版本JSON驗證BLOCKED。

## 嘗試／決策紀錄

- 首次smoke用錯日文CTA文字、誤以顯示暱稱作aria-name；依實際i18n與可見文字修正選擇器，不改產品以迎合測試。CI三引擎通過證明修正有效。
- 首次capture在sync→home同Hash保留modal；每畫面reload後重拍，沒有用錯圖宣稱正常。
- L10fixture首次被Home初始化競態影響；等初始化再植入合成前置資料，重跑後實際返回Entry且挑戰未完成。只用隔離資料。
- 本機最終smoke首次遇4173佔用，沒有reuse未知server；加入可驗證的P0_E2E_PORT設定，4177重跑，原始失敗保留。
- 不改原runtime src／schema，不跨入P1；缺陷與audit轉具體P1-13，不自動升級依賴或apt。

下一步只需解除acceptance列出的真人審核／責任承接／preview存取；不重做已保存證據、不自動合併或正式發布。

最終工具CI run38711924120：Node22.23.2，Chromium145／Firefox146／WebKit26三引擎PASS，其餘檢查除既有lint均PASS。證據ci-final具三份environment.json、home.png、trace.zip。228任務ID唯一，依賴無循環；新增／異動Markdown本機連結與fence檢查通過；diff掃描未包含實際憑證值。
