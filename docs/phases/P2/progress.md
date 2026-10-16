# P2 進度

狀態：**ENGINEERING_READY**（工程通過，完整Phase尚未完成）。正式 Phase gate **NO-GO**，尚待新 P2 的真人審核與實體平板。

## 基準、owner 與範圍

- 工程實作／工程初審：本 session Codex。日語、真人視覺／可玩性、實體裝置 reviewer 尚未指派；未編造姓名或簽核。
- 分支 `phase/p2-adventure`，draft [PR57](https://github.com/dannythreeka/Japanese101/pull/57)。worktree `/home/yyy/workspace/Japanese101-p2`。
- 基準 main `99b8805bbb36db54237370bbfb4f3ad8d18efba2`，已包含 PR54／55／56；原使用者 checkout 保留。
- 使用者確認「P0 and P1 驗證過了」：[真實核准來源](evidence/predecessor-approval.json)。不必重做 P0／P1；不把此核准延伸成新 P2 的人工簽核。
- 產品凍結提交 `e6444e541b710aaceaaea4807032d3904650390e`；主功能在 0fc369d，後續只有測試時序與兩處規範字級修正，沒有再變更學習／交易邏輯。後續證據提交若僅改文件／截圖，產品內容保持以上版本。
- 任務完整範圍 25 項；P2-10 已有設計沿用，未重做。正式 U01 依賴鏈與最終 P2-09 不跳過。

## 已實作

一座 32×24 小鎮、分層原創插畫、點地面尋路／方向／鍵盤／地點清單、三建築與兩位居民；既有玩家與 fox／其他夥伴 ID 保留。道館教學、四類播放器、三行動戰鬥、回合保存、手動回饋、撤退與安全恢復已串接。三件商品可試穿、購買、卸下與跨場景穿戴；回合、領獎、購買分別有原子交易與防重收據。

手帳依年級建議 2／3／4 小節，五個有效作答可跨戰鬥；同日不因重玩推遲複習。獨立 check 不即時揭答案；能力門檻仍五題族、兩日、48h、4/5。首次引導可略過或重播，初始偏好不假填能力；家長報告在 PIN 後掛載，顯示玩家、期間、樣本、提示／跳過及逐題追溯。

U01 草稿有 25 詞、5 漢字、3 文法、9 教學卡、4 閱讀、6 聽力、50 練習＋15 檢核候選。14 張 WebP、14 教材 WAV＋4 居民 WAV 均有來源／hash／版本；全部 DRAFT。只有隔離 `/#/preview/adventure` 與審閱頁可用，正式孩子入口未切換。

## 驗證與目前工作

222 單元／24 files、型別、lint、data、blueprint 11 項、journey 關聯與審閱 build 通過。Chromium 最新完整 P2 24 項通過，含真斷站冷啟、六完整聽力、雙分頁交易、五寬、平板橫直向、200% 文字、版本／故障復原及 20 次資源釋放。Firefox 本機24項亦全PASS；最終CI的Chromium／Firefox／WebKit各42項、合計126項全PASS，含全部P1回歸。證據[evidence/ci-final.json](evidence/ci-final.json)。已通過CI：[38865806957](https://github.com/dannythreeka/Japanese101/actions/runs/38865806957)。

Codex 已實際看新手引導、空資料報告、長閱讀、小鎮與商店的截圖，以及四方向／三戰鬥姿態裝備。這是工程視覺核對，真人與實機仍 NOT_RUN。所有十五 gate 與 UI-01～14 對照見 [acceptance](acceptance.md)。

## 修正依據與未變門檻

- [邊界失敗證據](evidence/boundary-regressions.json)：同版壞世界資料拒絕普通覆寫；損壞勝利旗標不能略過合法 Attempt 領獎；同日重玩不能把隔日複習推到 30 天。
- 學習排程升 `learning-v1.1-spaced`，舊衍生資料先備份，再重播真實 Attempt；教材升 `u01-2-draft`／item v2，v1 原稿封存；DB v6→v7→v8 逐版遷移，不回改已交付 schema。
- v8 單調 catalog revision 防舊分頁覆蓋新價；兩分頁同物一筆扣款，競爭餘額不負數。交易已提交但讀取失敗會準確提示並僅重讀，不重發答案／購買。
- eb25eb5 WebKit CI 唯一失敗：測試在商店入口 still pending 時切商品版本，產品提前停用購買，測試等待點 disabled 按鈕；911fa44 改先等待入口完成再模擬改版，保留交易及文案斷言。隔日測試也先等待真實導航才 reload；沒有加 timeout、force click 或降低斷言。
- 完整正式 release 檢查必須拒絕未審教材／音訊／美術；預覽綠燈不是發布核准。正式入口接入與 P2-09 仍等待 U01-V／P2-11／真人／實機。

## 外部依賴與下一步

所有可獨立工程已完成並保存證據；接著只待 [human-review.md](human-review.md) 的實際日語／音訊、真人視覺／可玩性及至少一台實體平板。可由真實具資格者兼任，但不能以 AI 或 WebKit 代替。簽核、修正及受影響重驗後，再順序處理 U01-M→T／Q1／Q2／A→V→I、P2-11→P2-08→P2-09。

未合併 main、未手動正式發布，未購買服務、招募或對外發訊。主機 apt／核心／Broadcom／Wi-Fi／Tailscale／交易服務均未變更；WebKit 使用隔離 GitHub runner。舊嘗試完整保留於 [execution-history.md](execution-history.md)。

歷史失敗911fa44 CI：Firefox全42項PASS；Chromium41 PASS／1FAIL為20次資源測試在首次略過引導的交易還未讀回時就按住方向鍵，世界依規格仍暫停。open helper新增等待引導實際關閉再開始操作，不新增sleep／timeout，也不放寬20次零殘留斷言。實際錯誤見evidence/ci-regression-failures.json；該失敗版本沒有標全綠，已由最終e6444e5完整CI驗證修正。

上述引導時序修正已用3 workers並行重複3次、共60次進出通過（49.9s），所有資源仍回基準。該修正只影響測試時序，最終產品e6444e5完整CI已通過。

最後視覺契約修正：手機頁首28→32px、探索指令18→24px，依project §4.3，不改產品規格或能力／經濟。實際DOM量測15組文字／底色／透明合成全≥4.5；地圖標籤另以黑／白底求保守界限，keyboard focus3px／offset2px。五寬＋200%文字＋長閱讀共7項Chromium重新通過（31.5s），證據computed-contrast.json。本修正產品提交已通過最終CI，精選截圖與來源SHA亦已更新。

最後產品的額外完整操作驗證：scripts/verify-p2-keyboard.mjs 在320×900、768×1024、1024×768三種viewport，以200%文字、真正Tab巡訪與原生Enter／方向鍵，全程各54次操作完成探索→教學→4題勝利→60幣→40幣帽→卸下／再穿→refresh→PIN報告；三組全PASS，餘額20／樣本4。不是實體平板或真人試用。可重跑命令與證據見handoff及evidence/keyboard-200.json。

交付狀態：DONE為P2-01～07、P2-10、P2-12～18（15項）；IN_REVIEW為P2-11與U01-M；P2-08／09 BLOCKED；U01-T／Q1／Q2／A／V／I維持TODO依賴（合計10項未完成）。正式release仍按預期拒絕DRAFT。真人可先讀[可玩性基準](playability-baseline.md)，並依human-review逐項記錄；沒有虛構兒童或平板證據。

最後證據提交僅文件、精選畫面與獨立驗證腳本scripts/verify-p2-keyboard.mjs，未改src／public／package／build／CI。完整綠燈對應產品e6444e5及CI測試merge be544a77；文件／JSON／links／lint另驗，不把不同提交混稱同一輪測試。
