# U03 時間與日常：可操作草稿

狀態 DRAFT。真人日語、音訊與兒童適齡審核 NOT_RUN；工程預覽不等於正式教材核准。入口 `/#/preview/adventure?unit=U03&scene=dojo`，逐題審閱 `/#/__review/content?unit=U03`。

25新詞、5新漢字（時／分／半／朝／夜）、3文法G07～G09、10教學卡、4閱讀、6聽力稿、50練習與15獨立檢核候選。動詞以辭書形記新詞，教學成對列出禮貌形，後續單元不能把同一動詞的ます形再當新詞。數字、時刻及音變先教，再學ます／ません、明確時刻＋に＋動作。漢字附讀音範例；時刻的4／7／9與分鐘讀法需特別真人核對。

作者稿 `scripts/author-u03.py` 使用 `scripts/content_authoring.py` 做固定序列化；各情境、正解、錯項理由與題族由作者明確撰寫。runtime `src/content/packs/u03.json`；不是以替換單元ID或人名湊題。全課盤點保留原有詞彙、漢字、文法去重及14題型配額。

檢核以時鐘數字轉讀音、讀音找數字、半點換算、音變修復、時刻問答；同動作肯否改寫、表格解讀、問答一致、句尾修復；時刻助詞、排序、相對／明確時間區分、回答安排與人物行程配對設計。五題族的測量獨立性仍待人審。相同聽力片段的不同練習共享family；當天答完不能越過48h、跨兩天、5題族4/5首次無提示的穩定能力門檻。

原創四格水彩為起床／吃飯／閱讀／睡覺；圖片不嵌入時鐘數字，避免生成圖片的錯誤讀時影響測量。時間由題目與音訊提供。資產來源與完整prompt見art-prompt.md，412,212 bytes原尺寸WebP，未提高2MiB上限。

教學及聽力共16段真WAV；逐段來源、條款、稿hash、檔hash及PCM在 `public/assets/audio/u03/manifest.json`。135項review-ledger涵蓋文字、題目、音訊、插畫；全部人審NOT_RUN，變更hash會使舊簽核不再適用。

需要真人特別檢查：じゅっぷん／じっぷん的可接受變體、時刻讀音、動詞辭書形與禮貌形是否讓低年級混淆、否定句正解唯一性、閱讀表格與T13圖文負擔、語音自然停頓，以及各檢核題族是否足以獨立測量。未達條件不標DONE。

恢復：Node22；`python3 scripts/author-u03.py` 僅適用未核准稿；`npm run gen:voice:unit -- U03` 只重用稿與檔hash吻合的音訊；`node --import tsx scripts/unit-inventory.ts --write` 產coverage／人審清單；`npm run validate:units:release` 在缺人工與其餘單元時必須失敗。瀏覽器證據及實際執行狀態以 docs/phases/P3/acceptance.md 為準。
