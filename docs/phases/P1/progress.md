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
