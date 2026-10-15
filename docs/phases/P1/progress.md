# P1 執行紀錄

狀態：IN_PROGRESS。基準：`bc2116ad789d247e3be44d2eba5b5a0e790b73ea`（PR #53合併）；分支phase/p1-reliability。
工程執行：本session Codex。2026-10-15使用者明確指示合併PR53並開始P1，P0人工驗證同步進行。這是執行順序的授權例外，沒有把P0-03／05／06／07改成DONE或捏造簽核。P0後續人審修訂需同步評估P1影響。

範圍P1-01～P1-13；先共用作答契約／出題安全，再玩家遷移、持久session／交易／恢復，並處理mic／音訊、CI缺陷。主機apt／核心／Wi-Fi／交易服務不變動。

PR53已依使用者授權merge；P1只授權push工作分支／開PR，沒有自動merge或正式發布P1授權。

## P1-01／02 第一批

新增首次作答／提示／跳過／完成率契約；Canvas pointer事件重現五題三首次對、兩題錯點重試，onComplete只一次且回傳3/5。詞組比對支援vocabulary、同組干擾選項；0/1或未知詞回復empty，UI可返回／重試；卸載取得真正engine cleanup。針對三檔27個測試PASS、typecheck PASS。其他遊戲出口與持久化尚待整合，不把P1-01完整標DONE。

## 玩家資料與持久化基礎

v5新增玩家範圍tables與checkpoint／level session／reward receipt，原progress／sessions保留legacy-shared；升級交易先保存原始tables與舊本機設定備份。v1～v4、空庫、壞原始資料、重啟與模擬備份寫入失敗回復測試通過。呼叫點固定profileId；正式偏好／星星／每日領獎改IndexedDB，不再共用全域localStorage。
新增game／level session交易服務，6項測試覆蓋十次同題／獎勵重試、A延遲寫入不影響B、checkpoint版本不符保留、缺結果／鎖關拒絕、關卡獎勵重玩衰減、交易失敗回復。服務尚待接入全部遊戲與結算UI。
mic mode／AbortSignal／家長enhancedConsent已實作，API spy測試通過；實機驗收仍未執行。所有上述task保持IN_PROGRESS，未以基礎服務通過當完整Phase通過。

## 遊戲出口整合與恢復

七個遊戲接上 PracticeSession，先將作答交易存好再推進／結算；首次答案、提示、重試、跳過持續記錄。配對／聽力改為選擇後確認並手動下一題；寫字、詞卡自評、發聲只作參與／輔助紀錄。濁點多位置需全部完成，Canvas增加DOM替代選項。關卡結算讀取owned finished game session，不再信任memory result或complete URL；refresh不重發。

153項原有／基礎單元測試通過；目前正加入音訊、教材包與資料驗證器測試。尚未完成真實遊戲瀏覽器回歸，P1不標完成。

## 音訊／工具基準與瀏覽器定位

標準npm10 audit fix/update遇Arborist edgesOut錯誤；臨時npm11相容修補＋原semver內更新，再重建含peer的lockfile，標準npm10 npm ci成功，audit由18降0。lint 0/0。新增39個缺圖引用（37原創SVG＋2既有），關聯／素材檢查通過；素材人工審核未冒充完成。

Chromium第一批3項E2E通過：首次6/10與完成10/10、重整／兩分頁結算防重、complete／鎖關拒絕、過期版本保留、儲存失敗重試、玩家切換。離線實測409素材完整下載、斷網關頁重開、逐資源fetch及真實WAV播放PASS一次，待最終commit重跑。

長流程首次失敗：先修正測試「下一題 →」定位；重跑後發現下一題DOM仍顯ready但engine尚未audioReady，點擊被忽略。已改spawn立即發布loading並開始播放，新增回歸。20次進出RAF歸零，但捕獲Howler由hydrate volume建立的30秒autoSuspend timer；改音效/BGM用可明確停止的HTMLAudio，不再由設定讀取啟動AudioContext。正在重跑，尚未將長流程標PASS。

## 隔離測試定位補充

20次同文件進出已通過（RAF、timer、mic計數均歸零）；五寬與200% CSS layout zoom畫面無水平溢出，工程agent已開啟素材contact sheet、320px配對／濁點及200%配對截圖檢查。正式人工UX核准仍未取得。

完整主線後續卡在測試helper：只按feature找最新session，切到新challenge時過早讀到前一已完成session（測試讀到8題／假名，UI實際為6題／詞圖）。已改讀取實際掛載的session ID，保留原始失敗記錄，不透過延長逾時掩蓋。正在隔離output目錄重跑全部Chromium suite，避免不同run產物覆寫。

## 家長同意與最後一輪修正

人工同意不是模式切換的隱含結果：offline→enhanced現在一律再開明確說明的對話框；取消／延後權限回應／切換玩家不會誤啟用另一玩家。線上辨識說明已移除「不外送」錯誤承諾，明示瀏覽器語音服務可能外送；不支援／啟動失敗不再悄悄退回音量成功，會釋放資源並顯示恢復提示。新增UI同意測試與API故障測試。

補上七種結果出口的重複下一題防護、詞卡末題refresh結果呈現、單字指定ID不隨機替換、一般朗讀按鈕播放錯誤可重試。CI改三引擎隔離job，與主機OS套件無關；保留Test & Build入口，新增每引擎artifact。

## 完整Chromium操作結果

以獨立output /tmp/p1-chromium-reviewed執行12項全部PASS（10.0min）：L0～L10在mic off／模擬拒絕／無裝置各完整走一次，三輪合計33關；模擬media API請求計數0，證明主線不依賴發聲。另含首次計分、重複提交／兩分頁、restore／storage retry／隔離、20次進出、實際WAV離線關頁重開、家長同意、五寬／200% CSS layout zoom、素材contact sheet及P0 smoke。這是瀏覽器自動化，不是實體裝置權限驗收。

最後source review另補免費抓抓樂退出保持checkpoint、明確換模式才abandon舊輪建新session；進度從已保存completed推導，跳過也更新完成數，不把暫存完成數顯示成已領星星。新增專項E2E，會重跑受影響流程。CI三引擎job在各自隔離runner採3 workers、各context獨立，本機仍1 worker。

## CI差異定位

9175a62／GitHub合成merge ac56eb32e4cf659d832a949b46365488f656b35a 的Test & Build全部通過；三引擎完整suite實際執行後暴露差異，未標PASS。Chromium的壞checkpoint恢復測試在restart Promise完成前讀到舊掛載ID，已先等待實際ID變更再判定，保留新ID斷言。

Firefox離線WAV：讀取CI failure trace，明確出現 `NS_ERROR_DOM_MEDIA_MEDIASINK_ERR ... OnMediaSinkAudioError`，不是將下載成功誤當播放成功。本機同測已PASS。隔離runner加入PulseAudio null sink供原生音訊輸出，仍使用真WAV／真播放完成事件與原斷言，不替換Audio、不跳過測試；不在Mac Mini上執行任何apt或聲音服務設定。CI虛擬輸出不等於人工審聽。下一個CI會以新版本重跑。

本機更新後核心24項（Chromium＋Firefox，各12）全PASS；免費抓抓樂壞設定／退出／換模式及延後A家長授權不影響B另4項PASS。全部測試使用隔離匿名資料。

## WebKit離線模擬的獨立驗證方式

527bf32的CI Test & Build、Chromium、Firefox均已PASS；WebKit其餘主線／可靠度回歸執行後，離線API導航仍回報internal error。原始trace與[Playwright #42775](https://github.com/microsoft/playwright/issues/42775)所報的WebKit setOffline攔截SW回應現象相符；該issue版本為1.63，本專案固定1.58的實際失敗由自己的CI證據確認，不把來源版本混稱成本專案版本。

離線test現在啟動test-owned隔離origin（只讀dist、HTTP no-store），確認SW已控制並完成409素材下載後停止該server。另建SW blocked全新context，必須連不上已停origin作負控。之後關頁重開、逐409資源讀取與真WAV完成播放的原斷言全部保留。Chromium／Firefox另保持setOffline=true；WebKit不用已知有問題的模擬旗標，但同樣沒有可連線origin，不轉為單純online測試，也沒有skip／expected-fail。此方法不是實機飛航模式驗證。本機Chrome／Firefox兩項已PASS，WebKit由下一個隔離CI驗證。

另補鍵盤Enter／Space完成單選與濁點點選替代，兩引擎2 PASS，含焦點截圖；沒有宣稱完整screenreader／P2視覺規範已驗收。

## WebKit通關導頁邊界與先存再完成

d648000三引擎合計50 PASS／1 FAIL：Firefox與Chromium各17 PASS；WebKit16 PASS，含停止origin的離線重開／真WAV驗證。唯一失敗是三worker負載下L5完成後5秒URL等待超時；失敗截圖取回時已到完成頁，不能把它當整輪PASS，也不以拉長等待解決。

檢查LevelEntry發現舊流程先顯示「クリア!／三星」，再用1秒timer導頁，實際結算交易是在之後的LevelComplete。這會在真正提交前宣告完成，且忙碌時timer可延遲。現改為單次立即導向驗證結算，只有receipt成功才顯示完成／慶祝；移除該timer與預先三星。新增真實L0操作後注入level receipt寫入失敗，必須零level獎勵、XP回復、無完成heading，重試後只發一次。正在本機兩引擎與新CI重驗，527bf32不再是最終產品SHA。


補驗：結算receipt寫入故障→零level獎勵／無完成畫面→重試只發一次，Chromium／Firefox連同直連鎖關共4項PASS。LevelEntry另等實際owned active session就緒才開挑戰／完成，避免重玩瞬間沿用舊完成結果。預覽獎勵與結算共用levelRewardXp，重玩畫面顯示衰減後的可得範圍（L0第二次40–55），完成頁只顯實際receipt；6項固定邊界測試新增後，合計187 unit tests／19 files PASS。沒有修改重玩衰減數字，只消除預覽與結算不一致。最終產品變更在這批收斂，接著重跑CI。

## WebKit runner 啟動競爭定位

4f2c948／合成merge 8968284da7190f34c0fd236ac000fa8a7d5a183e 的CI為53 PASS／1 FAIL：Chromium、Firefox各18 PASS，WebKit17 PASS；三種mic完整主線、原生WAV離線、結算失敗重試均PASS。首次答題case在30秒總預算內仍進行到第四題，並非等待同一控制30秒。取回trace確認context.newPage單一步驟耗15.602秒（尚未載入產品）、setup共17.268秒，其後作答持續推進，最後確認按鈕在剩233ms時遭整個case取消。已實際檢視失敗畫面，保留日誌摘要與timing。

限定WebKit CI一個worker，減少同runner建立三個WebKit頁面的競爭；Chromium／Firefox維持三個。測試內容、預設30秒、主線420秒、斷言與無重試設定不變。這是runner資源配置修正，產品程式仍為4f2c948；重跑完整三引擎，未先標PASS。
