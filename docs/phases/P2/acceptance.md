# P2 驗收紀錄

2026-10-16（Asia/Taipei）｜Phase **IN_PROGRESS：三引擎 CI 執行中**｜正式 gate **NO-GO**。

工程 reviewer 為本 session Codex；真人 reviewer 尚待指派。P0／P1 真實擁有者核准已保存於 [predecessor-approval.json](evidence/predecessor-approval.json)，不延伸為 P2 教材、視覺或實機簽核。原始歷史與失敗沒有刪除，見 [execution-history.md](execution-history.md)。

## 版本與證據範圍

| 項目 | 真實值 |
|---|---|
| 基準 | main `99b8805bbb36db54237370bbfb4f3ad8d18efba2` |
| 產品程式 | `0fc369de7a5c8ba19e396c67beb025d1b1d64405` |
| 最新待驗 CI head | `911fa44dcc813f244299dfa3f89a66c68a340018`，只比產品版多 catalog 測試等待與 progress |
| 工作分支／PR | `phase/p2-adventure`／[draft PR57](https://github.com/dannythreeka/Japanese101/pull/57) |
| 本機環境 | Ubuntu 24.04，Node 22.23.2，npm 10.9.8，Playwright 1.58.0；依 lockfile，未更動 OS |
| 教材／圖片 | `u01-2-draft`、item v2／`journey-art-v2`，全部 DRAFT |
| 世界／回合／經濟 | `town-v1`／`battle-rules-v0.1`／`economy-v0.1` revision 1，原型數值沿用設計附錄 |
| 學習排程／DB | `learning-v1.1-spaced`／v8；舊資料先備份，不清真實資料 |
| 正式入口 | 未切換；隔離 preview 與兩個 review route 不代表正式 U01 接入 |

本機完整 Chromium 24 項 PASS；Firefox 24 項亦 PASS。最新完整三引擎 CI：[38863606990](https://github.com/dannythreeka/Japanese101/actions/runs/38863606990)，尚未結案。最終資料將保存 `evidence/ci-final.json`，不以 dcab575 舊綠燈代替。

## 完整 25 項 task 對照

以下工程通過是隔離 DRAFT 內容下的功能驗證；需要真人的 task 不因可操作就 DONE。tasks.md 為狀態主表，工程 task 已依本機驗證同步，完整三引擎屬最終 P2-09。

| Task | 實際交付／驗證 | 工程結果／正式狀態 |
|---|---|---|
| P2-01 | content/contracts runtime schema、版本歷史、Attempt 全 outcome fixtures、題族分區 | PASS／DONE |
| P2-02 | learning/rules 固定時鐘：60%、零樣本、5 題族／2 日／48h／4/5、SRS 到期、三題補救間隔 | PASS／DONE |
| P2-03 | 旅行手帳 tokens／7 共用元件、狀態頁、64px／焦點／五寬；修正 P1 詞卡長列表、書寫控制及精確存檔文案 | PASS／DONE |
| P2-04 | choice/order/reading/audio；確認、鎖定、手動繼續、鍵盤、真音訊門檻、失敗原答案重試、暫停 | PASS／DONE |
| P2-05 | 固定計畫與續學、跨戰鬥有效樣本、小節不因提早勝利虛增、2/3/4 建議、隔日 due | PASS／DONE |
| P2-06 | 原子 receipt 後顯示實領、refresh 不重播、PIN 後玩家／期間／樣本／逐題／能力摘要 | PASS／DONE，完整三引擎 gate 回歸中 |
| P2-07 | 繁中／日文、教材 ja、教學 ruby、切語言保留答案、四類鍵盤與地點清單替代 | PASS／DONE，完整三引擎 gate 回歸中 |
| P2-08 | 完整循環隔離預覽已實作，正式 U01-I／P2-11 未放行 | BLOCKED：正式整合不可先 DONE |
| P2-09 | 自動化／Codex 視覺工程證據已做；真人日語、視覺／可玩性與實體平板未做 | BLOCKED：十五完整 gate 未全過 |
| P2-10 | 已驗收設計沿用，需求／原型參數分開 | PASS／DONE，未重做 |
| P2-11 | 14 圖、四方向／行走／戰鬥姿態、3 裝備、source/hash/frameWindows；已看實際三場景圖 | 工程 PASS／IN_REVIEW，真人 NOT_RUN |
| P2-12 | BFS、方向／鍵盤／地點清單、障礙／鏡頭／安全落點、失焦與 pointercancel 停止 | PASS／DONE |
| P2-13 | 2 居民、靠近互動／防重入、重讀／退出／4 本地 WAV、道館先修／教學入口 | PASS／DONE |
| P2-14 | 3 行動、敵方預告、HP／Attempt 同交易、答錯／提示／跳過／耗盡／失敗／撤退／上限／重送 | PASS／DONE |
| P2-15 | 首勝60／重玩10／失敗0；合法末回合 Attempt、receipt、雙分頁、防溢位／版本與原子購買 | PASS／DONE；最新 WebKit gate 回歸中 |
| P2-16 | 試穿不改資料、買／穿／卸、空包、已擁有／不足／版本／失敗、戰鬥快照鎖定、手機／平板 | PASS／DONE |
| P2-17 | v5→v8 保全、A/B 延遲隔離、世界／內容／戰鬥恢復、scoped backup 匯出、真斷站冷啟冒險 | PASS／DONE；全庫匯入仍 P5 |
| P2-18 | world／encounter／equipment／question／skill／asset 引用驗證、壞 fixtures、正式拒絕 DRAFT | PASS／DONE |
| U01-M | 唯一 ID／配額／先修／50 題分配與全課測量計畫已交稿 | IN_REVIEW；日語內容負責人未凍結 |
| U01-T | 9 教學卡、4 閱讀、6 聽力稿、中日說明與教學 ruby 已有草稿 | TODO；正式依賴 U01-M 未滿 |
| U01-Q1 | Q01–25、正解／解析／干擾理由／技能／family／版本 | TODO；正式依賴 U01-T 未滿 |
| U01-Q2 | Q26–50，不與 Q1 重複；四主線／14 題型及素材引用 | TODO；正式依賴 U01-T 未滿 |
| U01-A | 6 聽力＋8 教學 WAV、PCM／音量／時長／hash／來源完整 | TODO；真人逐檔審聽與 U01-T 未滿 |
| U01-V | 逐項 review-ledger 與審閱工具已準備 | TODO；非原作者日語審核 NOT_RUN，前置未滿 |
| U01-I | 草稿四主線、6 真 WAV、保存／離線已測 | TODO；正式依賴 U01-V 未滿 |

## G2-1～G2-15

工程結果與正式 gate 分開；「工程 PASS」不代表真人／實機已過。

| 需求 | 實測步驟／預期與實際 | 工程結果 | 完整 gate／缺口 |
|---|---|---|---|
| G2-1 | 4 renderers＋四主線實作；25/5/3/4/6/50 檢查，9 教學／65 題／14 WAV 可逐項審閱 | PASS | BLOCKED：U01-V／I 與真人教材 |
| G2-2 | 存位置→重開；題目／feedback 重整，未領勝利由手帳續接，計畫 queue 保持 | PASS | PASS 工程；正式整合待 P2-08 |
| G2-3 | 固定時鐘答題→隔日 due→手帳進道館→重開同 queue→到期答對進 3 天 | PASS | PASS 工程；非真實跨日人測 |
| G2-4 | 五題三獨立正確＝60%，提示／跳過／重試與零分母邊界；遊戲規則不改 mastery | PASS | PASS 工程 |
| G2-5 | A 世界／戰鬥／購買→切 B→分欄核對／匯出；舊 A 延遲仍限 A | PASS | PASS 工程 |
| G2-6 | 五寬、768×1024／1024×768、200% CSS 文字、四 renderer 鍵盤與地點清單 | PASS 自動化 | BLOCKED：實體平板設定／觸控仍待 |
| G2-7 | 注入 quota：無 Attempt／無 HP 變化；重試只有一筆。提交成功後讀取失敗僅重讀、不再扣款／傷害 | PASS | PASS 工程 |
| G2-8 | 點地面／鍵盤走路、牆／河不可達、五目的地可達；keyup／blur／cancel 停止 | PASS | PASS 工程；實體觸控待 G2-15 |
| G2-9 | 純規則邊界＋UI 三招／預告／撤退／手動繼續，無倒數；刷新保存回合 | PASS | PASS 工程；策略體感待真人 |
| G2-10 | 兩頁同時領一場、直接舊結果 URL、重玩／非法勝利／跳過末題、只一筆合法 receipt | PASS | PASS 工程 |
| G2-11 | 同物雙頁只扣一次；不同物競爭、故障 rollback、canonical catalog revision、三件試穿／買／卸 | PASS | PASS 工程；商品數值適合度待真人 |
| G2-12 | map／shop／battle 共來源、frameWindows 與三裝備對位；Codex 逐圖核對 | PASS 工程視覺 | BLOCKED：P2-11 真人來源／權利／視覺 |
| G2-13 | v5 保留、同版壞資料／變版先備份、安全入口、不假發獎；匯出 owned 原始資料及 owned backups | PASS | PASS 工程；完整還原 P5 |
| G2-14 | 下載完整包→原站真正停止→關頁／新頁冷啟→WAV／戰鬥／領幣／買裝備／重整仍在 | PASS Chromium／Firefox；WebKit gate 執行中 | BLOCKED 正式 U01-I；缺包不得報完成 |
| G2-15 | 三引擎 CI 全 P1＋P2、screenshots／trace，Codex 實看畫面 | CI 執行中 | BLOCKED：實體平板、真人完整循環與可玩性 |

## UI-01～UI-14 與視覺工程核對

| UI | 實際入口與核對 | 結果／證據 |
|---|---|---|
| 01 首次設定 | 暱稱、年級、自述偏好、2/3/4 建議、可略過／重播；不要求帳號／mic | PASS；first journey setup、final-visual/welcome-*；Codex 已看 |
| 02 冒險入口／續玩 | 玩家名、手帳續戰、保存位置／計畫與未領獎勝利 | PASS；完整循環／tomorrow／版本 E2E |
| 03 小鎮 | 地形／碰撞／人物／DOM 分層、地點清單等價、鍵盤停止與不可達 | PASS；五寬 town-*、keyboard／world tests |
| 04 道館／教學 | 一句目標、9 卡、先修連結、朗讀、返回，不把看卡當答對 | PASS；teach 操作及 dojo-* |
| 05 題目 | 指令／確認／音訊／四型、日文、未選不可交，排序點選鍵盤替代 | PASS；four renderers／six clips／long reading |
| 06 回饋 | 原選項、正解、解說、再聽、人按繼續；不重算 HP | PASS；storage／committed answer／full cycle |
| 07 結果 | 實際戰況／樣本／提示／review date、receipt、休息／回鎮 | PASS；full cycle／pending reward／防重播 |
| 08 正式模擬 | P2 不交付正式 timed mock | NOT_RUN／DEFERRED P5，未偷換為完成 |
| 09 家長報告 | PIN、玩家／期間／樣本、無資料、skill 名稱／弱項／逐題追溯 | PASS；parent PIN report、final-visual/parent-empty.png |
| 10 資料設定 | 新資料匯出含 owned backups；既有設定／玩家刪除／mic 同意由 P1 回歸 | 工程 PASS；完整匯入／還原 DEFERRED P5 |
| 11 戰鬥 | HP／敵預告／三招／可收合場景／暫停續選／撤退／回合恢復 | PASS；battle rules、storage pause、長閱讀五寬 |
| 12 商店 | 3 商品、價格／試穿／不足／已擁有／catalog／提交／失敗／讀取復原 | PASS；shop-*、雙頁／catalog／purchase-read tests |
| 13 背包 | 三欄位、穿戴／卸下、空包、戰鬥鎖定、三場景一致 | PASS 工程；真人視覺 NOT_RUN |
| 14 手帳／對話 | 5 有效作答累積、due、年級建議、不強迫每日、兩居民重讀／朗讀 | PASS；tomorrow／20 visits／world tests |

共用 state preview 在 `/#/__review/ui`；default、selected、focus、disabled、loading、error 均有實際可視元件。64px、Dialog Escape／焦點進出與五寬已驗；error／empty／offline／storage 不是只看靜態元件，另以真 quota、缺音、缺包、read failure、版本與斷站情境操作。200% 為 CSS 字級／行高加倍的桌面模擬，不冒稱實體設定。

實看圖見 [final-visual](evidence/final-visual/) 與 [gear-visual](evidence/gear-visual/)：米白／深藍讀題區清楚、場景與題目分層，320 長題可縱向捲動且不橫向溢出；768 商店雙欄、1024 長閱讀寬度受控。首次設定 dialog 可內部捲動、Escape 略過，未擋住退出。帽冠／臉／fox 耳不裁切、圍巾位於嘴下、側背包在身後，背面為外側口袋。這些僅是 Codex 工程初審，**不能填真人 PASS**。

## 保存／恢復與外部門檻

- [final-unit.txt](evidence/final-unit.txt)、[final-typecheck.txt](evidence/final-typecheck.txt)、[final-lint.txt](evidence/final-lint.txt)、[final-journey.txt](evidence/final-journey.txt)。
- [release-gate.txt](evidence/release-gate.txt) 是預期拒絕 DRAFT 的失敗結果，不是工程測試失敗被掩蓋。
- 本機完整 trace 在忽略目錄 `test-results/p2-final`／`p2-final-firefox`，CI 全部 trace／畫面上傳 workflow artifacts（14 天）；精選可長期閱讀圖與 metadata 已提交，retention 過期可按 handoff 重跑。
- 真人逐項 ledger 全 NOT_RUN，見 [human-review.md](human-review.md) 與 [review-ledger](../../content/U01/review-ledger.json)。
- P2 完整 gate 只有全部 25 task＋15 項及真人／實機證據通過才 COMPLETE；ENGINEERING_READY 也不等於正式放行或可自動合併。

911fa44 CI實際結果：Firefox42項PASS；Chromium41 PASS／1 FAIL為首次引導尚未保存關閉就按方向鍵的測試時序，已補等待真實 dialog 關閉並以3workers／3重複／60進出PASS，未改產品或斷言。下一輪全CI仍須完成，不能引用前一失敗當全綠。
