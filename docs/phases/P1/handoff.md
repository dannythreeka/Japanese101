# P1 可恢復交接

分支 `phase/p1-reliability`；draft PR [54](https://github.com/dannythreeka/Japanese101/pull/54)。基準是已按使用者指示合併的PR [53](https://github.com/dannythreeka/Japanese101/pull/53)，merge `bc2116ad789d247e3be44d2eba5b5a0e790b73ea`。先讀project.md、tasks.md、P0及P1的progress／acceptance，不重置使用者修改。

使用者允許P0人審與P1工程並行；P0未驗收項目保留，這不是P2放行或正式發布許可。P1外部驗收未齊前維持draft，不自動merge main／發布。狀態與最後已驗證commit以acceptance.md為準，不能只看到本地build或PR就標COMPLETE。

## 恢復與驗證

目前程式變更已整合七遊戲作答／結算／checkpoint、v5玩家資料、音訊／mic、離線包、素材關聯、lint與相容依賴修補。181個單元測試通過；完整L0～L10三種mic情境33關實際UI通過；Chrome／Firefox核心與邊界另見evidence文字紀錄。三引擎完整CI及最終狀態見acceptance.md，勿沿用舊失敗run當新結果。

```sh
cd /home/yyy/workspace/Japanese101
export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH
git status --short
git log -5 --oneline
npm ci
npm run typecheck
npm run validate:data
npm run validate:blueprint
npm run lint
npm test
npm run build
P0_E2E_PORT=4190 npm run test:e2e -- --project=chromium --project=firefox --output=/tmp/p1-resume-results --reporter=list
```

挑未占用port，Playwright拒絕重用不明preview。離線測試會另開test-owned ephemeral origin並停止它，含無SW負控；不停止共享preview或任何使用者服務。WebKit不用有已知缺陷的setOffline旗標，仍必須在origin已停下完成重開／圖音／真WAV斷言。

每個run用獨立output目錄，避免artifact互相覆寫；不要在某個preview正測試時重建dist。CImatrix三引擎、隔離context、3workers；本機預設1worker。WebKit本機缺系統庫，依P0既有診斷使用隔離CI；不要再試主機apt install-deps。CI的PulseAudio null sink只在GitHub runner，目的是讓真WAV原生播放有輸出端，不是實體審聽。

結果以actual session ID為準，不從同feature的歷史結果猜目前輪次。恢復／restart是非同步操作，測試先等實際掛載ID改變再判定；禁止放寬結果或以固定sleep假成功。

## 實作入口與資料保全

- `src/db/index.ts`／models.ts：v1～v4→v5，legacy-shared保留；遷移／復原說明見migration.md。
- `src/db/game-sessions.ts`／level-sessions.ts：唯一正式結算、交易與receipt，拒絕UI傳入的分數或URL當發獎依據。
- `src/components/PracticeSession.tsx`／hooks/usePracticeSession.ts：依玩家與route持久化；失敗保留待交答案，重試成功才前進。
- `src/lib/mic.ts`、tts.ts、audio.ts：模式、明確同意與生命週期；enhanced不支援／失敗不悄悄視為離線成功。
- `scripts/offline-manifest.mjs`／offlinePack.ts：409個素材、byte/hash驗證；完整才標可離線，partial保留可重試。
- `scripts/validate-data.ts`／contentValidation.ts：shape、關聯／素材、生成選項與壞fixture；不可用手改snapshot掩蓋缺漏。
- `e2e/p1-*.spec.ts`：合成測試玩家，隔離context；大型trace在CI artifact（14日）與本地/tmp，文字與選定截圖已入repo。

原共享學習紀錄不分配給孩子、不算入能力；reset／delete只作用指定玩家。不得用清掉DB處理失敗，不拿真孩子資料做故障注入。改教材／規格需更新內容版本並評估checkpoint相容性，不能把舊題答案無聲套成新題。

## 剩餘外部驗收

執行device-checklist.md：P0實際人審／責任人／preview合法存取；P1真實裝置麥克風拒絕／撤銷／停止、Safari音訊／PWA離線、觸控／鍵盤、37張新增SVG真人審核。Reviewer、日期、版本必須真實。工程agent視覺初審不代替簽核。若人審改P0規格，先評估P1影響，再改gate。

詞卡小螢幕單元列表很長、舊書寫返回／示範控制尺寸及對比等P0既有UI缺陷仍在P2-03／P2-09範圍；本Phase沒有宣稱十畫面完整UI／a11y設計已完成。

這是Mac Mini交易主機，Wi-Fi依賴既有Broadcom／核心hold；不執行apt update/upgrade/autoremove、改核心／Wi-Fi套件、重啟網路或交易服務。AppArmor profile是使用者暫時載入，重開機後可失效；沒有為本工作重開機或放寬全域userns限制。憑證不寫入repo；維持既有已授權GitHub操作範圍。
