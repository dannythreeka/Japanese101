# P1-13 依賴與 lint 紀錄

Node 22.23.2；僅變更專案 npm lockfile，未動主機 apt、核心、Wi-Fi 或系統服務。package.json既有semver範圍維持，Playwright仍固定1.58.0。

初始 audit：18（2 low／6 moderate／9 high／1 critical）。相容更新後 `npm ci` 正常安裝，audit：0。

| 套件 | 原 severity | 影響範圍 | 更新後版本 |
|---|---|---|---|
| @vitest/coverage-v8 | moderate | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 4.1.11 |
| @vitest/mocker | moderate | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 4.1.11 |
| baseline-browser-mapping | moderate | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 2.11.28 |
| body-parser | low | 選用 Node 同步後端／HTTP middleware | 2.3.0 |
| brace-expansion | high | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 2.1.7, 5.0.12 |
| browserslist | high | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 4.29.3 |
| esbuild | low | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 0.28.2 |
| fast-uri | high | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 3.1.8 |
| nanoid | high | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 3.3.20 |
| postcss | high | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 8.5.30 |
| proxy-addr | critical | 選用 Node 同步後端／HTTP middleware | 2.0.8 |
| qs | moderate | 選用 Node 同步後端／HTTP middleware | 6.16.1 |
| react-router | high | 瀏覽器路由執行期 | 7.18.4 |
| react-router-dom | moderate | 瀏覽器路由執行期 | 7.18.4 |
| source-map-js | high | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 1.2.2 |
| undici | high | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 7.30.0 |
| vite | high | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 8.3.4 |
| vitest | moderate | 開發／測試／打包或間接工具；不載入靜態孩子流程 | 4.1.11 |

npm10 audit fix／update 先出現 Arborist edgesOut 空值錯誤。改用臨時 npm11 執行相容audit修補後剩3項；在原semver範圍更新並重建含peer的lockfile後，標準npm10 `npm ci`成功（不是在CI採用legacy-peer-deps）。更新過程未使用 --force，未新增全域npm設定。

原始與完成 audit JSON 保存在 evidence/audit-before.json、audit-after.json；精確套件版本以package-lock.json為準。npm的glob等deprecated提示與audit漏洞是不同指標；不將「目前audit為0」視為所有安全風險消失。

lint修正保留原有React hooks及preserve-caught-error規則，沒有新增disable或提高容差。完整回歸與CI結果見acceptance.md。
