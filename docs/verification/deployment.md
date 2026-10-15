# P0-06 部署入口決策

正式入口：[Japanese101 Vercel](https://japanese101-five.vercel.app)。選擇依據：repository homepage、vercel.json，以及GitHub的Production部署紀錄。

2026-10-15基準`91006716d38a9afb63bb061bbb652577c7c79a26`，GitHub deployment `7088137672`狀態success，對應不可變部署URL `https://japanese101-rdkc8tsbr-dannythreekas-projects.vercel.app`；證據evidence/P0/deployment-7088137672.json。這是原main部署，不是本分支自行發布。

Pages workflow移除，避免main每次觸發已知configure-pages失敗；此變更待PR合併才生效，不宣稱已停掉遠端設定。沒有修改主機、GitHub Pages外部設定或Vercel管理台。既有gen-audio功能保留，Node與CI共用.nvmrc。

CI順序：install→typecheck／data／blueprint／lint／unit／build→三引擎smoke→artifact。各檢查`!cancelled()`以便已知lint失敗仍收集其他真實結果，沒有continue-on-error；任何檢查失敗整體仍失敗。

新增build後的`dist/version.json`，由Vercel commit env／GitHub SHA／本機git順序取得40位SHA。preview應GET version.json，與PR head或GitHub部署SHA一致；網址可開但SHA不同不能當此PR驗收。前端無技術資訊出現在孩子介面。

本PR head637ab42已有Preview success，URL https://japanese101-l7x7sevpd-dannythreekas-projects.vercel.app 。實際GET /version.json重導到vercel.com/login，最終HTTP200是text/html登入頁，不是版本JSON；證據deployment-access.json／branch-deployment.json。可讀取GitHub部署SHA不等同能打開preview驗收，因此P0-06仍BLOCKED。正式別名實際HTTP200，沒有發布此分支到正式。需擁有者提供可存取preview／合法測試存取方式後，驗證首頁及版本SHA。
