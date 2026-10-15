# P0-06 部署入口決策

正式入口：[Japanese101 Vercel](https://japanese101-five.vercel.app)。選擇依據：repository homepage、vercel.json，以及GitHub的Production部署紀錄。

2026-10-15基準`91006716d38a9afb63bb061bbb652577c7c79a26`，GitHub deployment `7088137672`狀態success，對應不可變部署URL `https://japanese101-rdkc8tsbr-dannythreekas-projects.vercel.app`；證據evidence/P0/deployment-7088137672.json。這是原main部署，不是本分支自行發布。

Pages workflow移除，避免main每次觸發已知configure-pages失敗；此變更待PR合併才生效，不宣稱已停掉遠端設定。沒有修改主機、GitHub Pages外部設定或Vercel管理台。既有gen-audio功能保留，Node與CI共用.nvmrc。

CI順序：install→typecheck／data／blueprint／lint／unit／build→三引擎smoke→artifact。各檢查`!cancelled()`以便已知lint失敗仍收集其他真實結果，沒有continue-on-error；任何檢查失敗整體仍失敗。

新增build後的`dist/version.json`，由Vercel commit env／GitHub SHA／本機git順序取得40位SHA。preview應GET version.json，與PR head或GitHub部署SHA一致；網址可開但SHA不同不能當此PR驗收。前端無技術資訊出現在孩子介面。

目前待push取得本PR preview，核對可存取與SHA；不自動merge或發布main。
