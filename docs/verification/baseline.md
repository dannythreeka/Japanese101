# P0 執行基準

2026-10-15；原始基準`9100671`。本次工具改動不改runtime src行為。命令原始輸出：evidence/P0/initial-*.txt；Node26.1.0／npm11.13.0。

| 原始檢查 | 結果 |
|---|---|
| npm ci | PASS；18項audit提示，見npm-audit.json |
| tsc -b | PASS |
| validate:data | PASS；僅4份shape，不代表關聯及資源全部完整 |
| lint | FAIL：28errors／1warning |
| npm test | FAIL：129/132；Node26 localStorage環境錯誤 |
| build | PASS；有bundle size警告 |

Node22.23.2（主機既有安裝）重測132/132 PASS，見node22-unit.txt。依lockfile Vite需20.19或22.12+、ESLint需20.19或22.13+，選`.nvmrc`固定22.23.2。新Playwright依賴固定1.58.0，相容既有Chromium1208。

## 可重現命令

見ENGINEERING_RULES.md。無nvm shell函式時使用該安裝bin加入PATH，不能只換node二進位而留下不同npm。Playwright僅下載瀏覽器到使用者cache；本機WebKit缺libgstreamer-plugins-bad／flite／avif／woff等，不安裝apt，改由CI隔離runner`install --with-deps`。

## 證據規則

- 每份紀錄附commit、環境、命令／步驟、預期／實際與狀態。原始失敗不刪；測試選擇器修正與產品缺陷區分。
- `npm run test:e2e`每次新context，SW block以固定網路基準；**不能用這組smoke宣稱PWA離線PASS**。trace與home.png在test-results，CI artifact保留14天，重要基準另存evidence/P0。
- `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`後執行`node scripts/capture-baseline.mjs`；它建立獨立QA-P0，只寫自己的context。五寬／390px下200%文字放大，不是實體裝置或瀏覽器原生zoom。
- 未執行NOT_RUN、外部阻礙BLOCKED；重現缺陷不等於修復PASS。保存假名文字、焦點、touch size與overflow量測；逐張打開看才算視覺審視。
- 不記錄真孩子資料／認證憑證；trace只限本機合成QA玩家，不登入真同步服務；Zip引用若需提交用git add -f，避免忽略後誤稱已保存。

最終檢查與三引擎結果將追加於本頁與P0 acceptance，不將既有CI結果當本次結果。

## 已執行的最終結果

Node22.23.2下npm ci／typecheck／data／blueprint／unit／build通過；unit132/132、blueprint10/10。lint仍28errors／1warning。final-checks.json保留首次執行的實際exit，其中smoke因4173已占用失敗；改P0_E2E_PORT=4177後兩引擎通過，見final-smoke-retry.txt，沒有reuse不明server。只為此衝突增加可驗證port選項；本次自行啟動的4173 preview已於驗收後核對PID、cwd、完整命令再停止。

CI：[run 38710872715](https://github.com/dannythreeka/Japanese101/actions/runs/38710872715)，PR head637ab42711cfd143cde2ee7a0471028bde88482f，實際GitHub合成merge／GITHUB_SHA為838b7416cfad50d9cb764bcf36cab907d970bb7d。typecheck、data、blueprint、unit、build、browser install、三引擎smoke與artifact全部成功，僅lint failure。三引擎home.png／trace.zip已從artifact11960234079另存evidence/P0/ci；下載走GitHub已授權憑證，證據未含憑證。已打開三份首頁確認中文字形與主要操作可見。

後續工具變動為3b0d877（port選項、測試環境metadata輸出、觀測scripts），沒有runtime src行為變更；最新CI結果將附於P0 acceptance。原始三引擎證據保留，未以重新截圖抹掉失敗嘗試。

官方題型來源：2026-10-15下載並核對[JLPT N5題型PDF](https://jlpt.jp/e/guideline/pdf/n5_e_revised.pdf)；配額屬本產品自訂，[官方FAQ](https://www.jlpt.jp/e/faq/)不提供固定詞彙／漢字／文法清單。這些引用僅支持題型與範圍界線，不能為AI擬定的60句型草案背書。

最終工具版本CI：[run 38711924120](https://github.com/dannythreeka/Japanese101/actions/runs/38711924120)，head3b0d877a5807f4cd1c71d5dcb874cfa8732345dd，合成merge10209aaa3d0a3d77675ae4e55c03a45fdcf85fb8。三引擎smoke再次PASS，CI僅lint failure。artifact11961256861已存ci-final，包括每引擎environment.json：Node22.23.2、Chromium145.0.7632.6／Firefox146.0.1／WebKit26.0。這是最終工具程式檢查；後續commit僅文件／證據，未改應用或工具邏輯。
