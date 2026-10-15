# P0-05 現有版本操作與視覺基準

日期：2026-10-15。實際操作／初步視覺審視者：本 session Codex agent；**真人UX／QA簽核尚未取得**。P0-05維持IN_REVIEW。測試runtime src與main@9100671相同，工具基準commit637ab42；最終commit差異見P0 acceptance。

## 操作與重現

| 流程 | 已執行 | 結果／限制 |
|---|---|---|
| 首頁 | 新context載入、開始入口、語言／sync按鈕 | 可操作；預設ja、首進預設玩家名稱未出現是Home建立／讀取競態的靜態風險，未另標已重現缺陷 |
| 玩家 | UI建立QA-P0、profiles清單切換；Afixture→B | UI新增／切換可走；F-03紀錄污染已重現 |
| 冒險／單元 | 進地圖、L0 Entry；合成先修進L10 | 可進；L10 mic off必做言靈回Entry未完成；未宣稱已真通11關 |
| 抓抓樂 | 選促音比較；另走平假名10題並前2題錯點 | F-02崩潰、F-01結果仍10/10；Audio stub用於計分操作，非音質測試 |
| 書寫 | 畫一筆→確認可用→清除→確認disabled→點示範 | 操作結果見interactions.json／write-drawn.png；未驗字形評分準確性 |
| 發聲 | 初始畫面、mic off主線返回、API spy、mock拒絕權限 | 不開真麥克風；拒絕mock畫面未見明確權限解阻說明，需P1-07；實體權限NOT_RUN |
| 家長 | 用隔離context預設PIN1234解鎖、讀報告／設定 | 可開；無樣本0%、玩家資料混用；不刪真資料 |
| 同步 | 開modal、合成帳密對mock401、顯登入錯誤→關閉 | 僅UI錯誤路徑；未連真backend或匯入／覆寫雲端資料 |
| 結算直連 | 新context進L0 complete並讀回DB | F-06無作答仍50XP與完成紀錄 |
| 離線 | 另一SW allow context待ready，未訪問WAV直接斷網fetch | F-07失敗；一般smoke不驗離線 |

完整原始結果：[probes.json](evidence/P0/probes.json)、[F01-catch.json](evidence/P0/F01-catch.json)、[F04-mic-spy.json](evidence/P0/F04-mic-spy.json)、[interactions.json](evidence/P0/interactions.json)。F-01～F-08的實測／靜態界線與修復task見[缺陷清單](defects.md)。

## 五寬與文字放大

隔離玩家QA-P0，uiLang=zh、micMode=offline，未按真錄音。每畫面重新載入避免modal狀態滲入下一張。九個畫面×320／390／768／1024／1440，每個高度900px、fullPage；另390px做200%文字放大（將所有computed font-size／line-height先快照再×2，**不是原生瀏覽器zoom**）。共54張畫面＋1張鍵盤焦點。尺寸與scrollWidth見[metrics.json](evidence/P0/ui/metrics.json)。

| 檢查 | 初步實際觀察 | 狀態 |
|---|---|---|
| 字形 | 五寬與三引擎首頁能辨繁中／日文，未見□；Firefox／WebKit字體外觀與Chromium不同 | 初審完成；真人文字／字體審查IN_REVIEW |
| 水平捲動 | 五寬普通文字九畫面document未溢出；200%家長489>390px | 有缺陷，UX-ZOOM |
| 截斷／遮擋 | 320px Entry的遊戲名稱truncate；地圖側邊節點在可平移區外，無清單替代；200%標籤重疊 | 有缺陷，UX-ZOOM／NEXT |
| 觸控 | 多數返回、header、開始玩不足64；sync關閉不足44 | 有缺陷，UX-SIZE |
| 焦點 | Tab可移到button，仍預設auto1px outline，未達規範；dialog trap需補 | 有缺陷，UX-FOCUS |
| 下一步 | Home冒險CTA可辨；Entry主要開始disabled、需挑小按鈕；free-play多入口要求初學者選遊戲 | 有缺陷，UX-NEXT |
| 對比／狀態 | 淺灰輔助字、disabled與亮色底白字需逐組量測；此輪未完成全頁對比數值與screenreader驗收 | NOT_RUN，P2-03／09 |
| 實體觸控／Safari／麥克風 | 沒有實體裝置session，WebKit CI只是引擎測試 | BLOCKED，P5-05；不拿模擬替代 |

已開啟五寬與200%截圖的檢視合成頁，並放大檢查家長200%、三引擎首頁；這是agent視覺初審，不是人審簽核。PNG保留原檔供真人覆核；單元／遊戲的隨機內容令不同寬度文字不同，此輪不用像素差異當回歸判定。

## 可重跑命令

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
# 另一個terminal，同樣Node版本
node scripts/capture-baseline.mjs
node scripts/probe-baseline.mjs
node scripts/probe-catch.mjs
node scripts/probe-interactions.mjs
npx tsx scripts/probe-mic.mjs
```

probe是觀測腳本，刻意不把已知錯誤assert成「正確行為」；P1修復後建立反向回歸。若錯誤消失，更新本次結果，不能為保留舊截圖重新引入缺陷。瀏覽器context關閉即棄隔離測試庫，未清空使用者真實資料。
