# U04 位置與存在：可操作草稿

DRAFT／真人審核NOT_RUN。入口`/#/preview/adventure?unit=U04&scene=dojo`，審閱`/#/__review/content?unit=U04`。依實際配額新增25詞、5漢字（上／下／中／外／前）、G10～12、10教學卡、4閱讀、6聽力稿、50練習、15獨立檢核候選。連同U01～03達到100唯一詞、20漢字、12文法、16閱讀、24聽力、200練習；這是工程盤點，非人審PASS。

教學先認位置與地點、ある／いる及禮貌形，再區分人／動物います與物品あります。G11以地點に開頭介紹有什麼，G12以對象は開頭說明在哪裡。補充位置複合詞「つくえの上」、對象否定「いません／ありません」、位置問答「どこ」。相對方向先確定面向；ここ／そこ／あそこ清楚指定說話者和聽話者距離。

`scripts/author-u04.py`為明確逐題作者稿，`scripts/content_authoring.py`只做固定序列化，拒絕覆蓋APPROVED稿；不以換人名或重排選項灌題族。語音共16真WAV，來源／稿hash／PCM／條款在`public/assets/audio/u04/manifest.json`。四格原創位置圖466,134 bytes，內建image_gen來源及完整prompt見art-prompt.md；桌下、門前、桌上、箱內由圖與音訊雙重驗證。

15檢核候選涵蓋對象分類、錯誤修復、存在否定、雙類表格；地點句建立、助詞修復、內容問答、地點對照、排序；主題位置、保留事實改句、排序、指涉追蹤、位置回應。測量意義與題族獨立性仍須真實非原作者覆核。同一聽力片段的不同練習共用family，保留48h、跨兩天、五題族4/5首次無提示規則。

`review-ledger.json`135筆均NOT_RUN。請人審特別核對：物品／動物分類、いません與ありません、は／が／に對題意的影響、圖中位置是否唯一、聽力語音重音停頓、低年級是否理解多層位置與表格。未取得審核，U04-V BLOCKED，其他教材task維持IN_REVIEW／隔離工程狀態。

命令：Node22，`python3 scripts/author-u04.py`、`npm run gen:voice:unit -- U04`、`node --import tsx scripts/unit-inventory.ts --write`。實際瀏覽器結果以docs/phases/P3/acceptance.md為準。首四課達工程配額不能取代P3-03～06真人／兒童gate，U05～U24仍未製作。
