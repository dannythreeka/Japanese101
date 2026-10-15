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
