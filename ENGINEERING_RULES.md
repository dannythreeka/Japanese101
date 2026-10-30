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

分支每個可驗證小批commit，訊息含taskID。PR必含問題／結果、改動範圍、驗證、未完成／外部依賴。遵守原授權：可push分支與開PR，不自動merge或發布main。依賴以當前package.json與lockfile為準；P2尚未選定新渲染套件，不從概念圖推定需要更換整個框架。

證據目錄與敏感資料規則見 docs/verification/baseline.md。非必要不記錄網頁requestbody／個資／憑證。相同程式SHA若只多文件commit，列明差異；若程式變更重跑受影響檢查。

CI失敗保持失敗；不continue-on-error lint、不放寬測試、不用舊CI綠燈抵本次未測。歷史缺陷見docs/verification/defects.md，依task追蹤。

## 冒險工程契約

細節以[設計附錄§8](docs/design/ADVENTURE_RPG_SPEC.md#8-資料版本與離線)為準。world／battle／economy／learning分責；版本化原型參數不散落元件。回合Attempt引用與血量同交易，獎勵receipt具冪等鍵，購物扣款／持有／穿戴原子完成；兩分頁競爭與錯玩家async必測。

地圖、角色、碰撞與DOM介面分層；可見文字不是烘焙PNG。點地面、方向控制、鍵盤與地點清單提供等價路徑；失焦與取消輸入必停走。正式素材納入版本／hash／離線包，概念PNG僅放docs。

每個原型參數變更列rulesVersion／catalogVersion、原因與受影響存檔；戰鬥使用開場loadoutSnapshot。任何遷移保留既有孩子、legacy-shared與舊receipt，不靠重置來換新美術。

## 雙語教材與選項語言

切語言會取代題幹／教學／解析，因此promptJa、bodyJa、explanationJa要保留實際人物、時刻、限制與正解依據；泛用「選答案」或「看例子」不能取代原題資訊。非空欄位、AI作者自查與程式PASS不是日語自然度或語意一致性簽核。

新／修訂教材逐選項明示Choice.lang為ja或zh-Hant，依該選項文字的實際語言，不能依畫面語言、正誤、文字長度或字形猜。相同設定用於選項、已排序字詞及答案回饋；沒有宣告的舊稿僅維持draft相容，不算通過語言審核。release盤點拒絕缺少明確選項語言。

已推送草稿修訂須使用新pack版本，題意修正記新itemVersion，封存舊審核，保留原始Attempt與交易。宣告語言不證明宣告正確，仍須非原作者核對；不得藉翻譯或lang改變答案、測量目的、題族或能力計算。
