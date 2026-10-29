# U02 教室物品：可操作草稿

狀態：DRAFT／人工內容審核 NOT_RUN。不是正式已核准教材；U02-M/T/Q1/Q2/A/V/I不能僅因工程完成而全部DONE。使用者完整體驗目標授權在隔離預覽持續工程，未取消真人審核。

入口：`/#/preview/adventure?unit=U02&scene=dojo`；審閱：`/#/__review/content?unit=U02`。

## 實際內容

- 25新詞、5新漢字、3新文法G04/G05/G06、10教學卡、4閱讀、6聽力稿、50練習、15獨立檢核候選。
- 教學與聽力共16個真實WAV，來源／聲線／條款網址／稿與音檔hash／PCM指標在 `public/assets/audio/u02/manifest.json`。人審不可由音檔存在或PCM數值取代。
- 四格原創插畫在 `public/assets/img/u02/classroom-contexts.webp`；內建image_gen與完整prompt見art-prompt.md。WebP原尺寸385,050 bytes，低於既有2MiB上限。
- `src/content/packs/u02.json` 為runtime教材；`scripts/author-u02.py` 為逐題原創作者稿與固定序列化，並非依模板隨機擴充題數。若已有人審，修改作者稿後需新版本與重核，不能重跑覆蓋核准稿。
- `coverage.json` 記G04～06的教學、練習與五個檢核題族候選；50題實際配比對照n5-manifest.json。檢核題族是否符合教學測量意義仍待真人覆核，不將15題編號當已證明掌握。
- `review-ledger.json` 共135筆，包括25詞、5漢字、3文法、10教學、4閱讀、6聽力稿、65題、16音訊、1插畫。全部NOT_RUN；更新內容hash會撤銷舊內容的簽核適用性。

## 教學與先修

U01後引入G04（これ／それ／あれ），再G05（この／その／あの＋名詞），再G06（主人＋の＋物品）。詞卡與漢字先教；情境、閱讀與聽力題需完成本課教學卡。教學補充人名、どうぞ／ください／ちがいます／なんですか／だれの，不把未說明的操作用語當前置能力。U01的先生詞彙不重算新詞，本課只首次引入先／生漢字。新詞全課以讀音正規化檢查，漢字／文法ID分別去重。

練習同一篇聽力的不同提問共享family，不靠重排選項、換人名或重聽增加題族。獨立檢核以位置推論、視角切換、句子修復、對話關係與雙條件查找設計；與practice不共用family。既有48h、跨兩天、五題族4/5首次無提示規則保留。當天做完15題也不會宣稱長期穩定。

待人工特別核對：指示詞雙方距離是否清楚；圖中人物與問句視角；「を」與助詞發音；学校／先生詞內讀音；初學兒童是否理解長指示；T09篇幅與理解難度是否適當；T13同時看圖與聽例句的負擔；語音停頓、重音及自然度。

## 恢復命令

Node22：`export PATH=/home/yyy/.nvm/versions/node/v22.23.2/bin:$PATH`。

- 產稿：`python3 scripts/author-u02.py`（僅未核准草稿）。
- 真音訊：`npm run gen:voice:unit -- U02`。有hash來源才重用既有音檔；稿改變需新音訊路徑，不把舊音訊自動認作新稿。429只有限重試並遵守≤30秒Retry-After；不可無限重試。
- 盤點：`node --import tsx scripts/unit-inventory.ts --write`，只列真正存在U01/U02，不將U03～U24配額表當內容。
- 正式檢查：`npm run validate:units:release`，目前應失敗，因缺人工審核及剩餘22單元。
- 操作：`P0_E2E_PORT=4248 npm run test:e2e -- e2e/p3-u02.spec.ts --project=chromium`。四主線測試只在隔離測試玩家設定4題queue，所有教學與作答仍走真UI；不是孩子試用。
