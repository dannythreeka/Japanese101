# 工程實作入口

主規範：[project §5](project.md#5-能力計算與資料契約)、[§6](project.md#6-實作守則)。本頁補充命令、PR與證據契約。

## 可重現環境

Node以`.nvmrc`為準（22.23.2，既有安裝）；lockfile控制依賴。不要對此交易主機執行apt安裝／升級或重啟；瀏覽器缺系統庫時記BLOCKED，由CI的隔離runner安裝系統依賴。

```sh
nvm use
npm ci
npm run typecheck
npm run validate:data
npm run validate:blueprint
npm run lint
npm test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
```

`tsc --noEmit`對根files=[]不能替代`tsc -b`。原始與最終檢查結果分開保存；不把Node26環境失敗改寫成從未發生。

## 變更責任

| 改動 | 必須附的證據 |
|---|---|
| 計分／learning純函式 | 首次／重試／提示／跳過／零樣本／跨日邊界；固定時鐘 |
| DB／玩家隔離 | v1–v4 fixtures、備份、失敗回復、延遲async、兩分頁重複提交；不得清真實庫 |
| UI／feature | taskID、相關操作E2E、viewport截圖與逐張審視、鍵盤／錯誤／離線 |
| 內容／素材 | 唯一ID／版本、關聯、授權、真人內容與音訊審核；AI僅草稿 |
| CI／build | 失敗也保留logs、精確SHA；preview version.json對應commit |
| 文件 | 需求與依賴一致性、連結、未測清楚標NOT_RUN，不硬加鏡像實作的測試 |

資料契約以project的Attempt為起點；P0 blueprint只用於規劃，不直接改runtime lesson schema。P1遷移保留legacy-shared，不替不明紀錄猜profileId。URL不授予完成資格；交易包含結果／獎勵／關卡，提交ID保證冪等。

## 工程交付與驗收

分支每個可驗證小批commit，訊息含taskID。PR必含問題／結果、改動範圍、驗證、未完成／外部依賴。遵守原授權：可push分支與開PR，不自動merge或發布main。新依賴目前只增加`@playwright/test`（其傳遞依賴納入lockfile）。

證據目錄與敏感資料規則見 docs/verification/baseline.md。非必要不記錄網頁requestbody／個資／憑證。相同程式SHA若只多文件commit，列明差異；若程式變更重跑受影響檢查。

CI失敗保持失敗；不continue-on-error lint、不放寬測試、不用舊CI綠燈抵本次未測。歷史缺陷見docs/verification/defects.md，依task追蹤。
