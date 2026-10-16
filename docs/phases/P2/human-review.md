# P2 真人驗收與交付紀錄

目前全部 **NOT_RUN**。P0／P1已獲擁有者核准；本頁僅處理新P2。不要以agent初審、WebKit或桌面模擬填成真人／實體裝置PASS。

## 版本與入口

- 工作分支：`phase/p2-adventure`；draft [PR57](https://github.com/dannythreeka/Japanese101/pull/57)。使用PR最新Vercel Preview，先核對`/version.json`的commit，並記在下表。舊預覽不能驗收新圖／新題。
- 已確認 deployment success 的預覽：[冒險](https://japanese101-38adwewhc-dannythreekas-projects.vercel.app/#/preview/adventure)、[全內容審閱](https://japanese101-38adwewhc-dannythreekas-projects.vercel.app/#/__review/content)，來源 `911fa44dcc813f244299dfa3f89a66c68a340018`。此網址為受保護預覽，無登入讀 `/version.json` 會得到 HTML，agent未宣稱核對成功；請擁有者登入後記錄實際JSON的SHA。後續只有測試／證據變更時不影響該產品內容，最新部署請由PR進入。詳 [preview-access](evidence/preview-access.json)。
- 冒險：`/#/preview/adventure`。使用新建的匿名驗收玩家，不清空孩子的既有紀錄。
- 教材／圖音逐項審閱：`/#/__review/content`。此頁直接看所有題幹、正解、干擾理由、先修、音訊原稿及裝備方向，不產生玩家作答或核准。
- 操作狀態：`/#/__review/ui`。正式孩子入口不顯示這些工程審閱頁。
- 教材：`u01-2-draft`，65題（50練習＋15獨立檢核候選）；配額與題型見[coverage](../../content/U01/coverage.json)。教材作者Codex，內容審核者必須是實際非原作者。
- 素材與語音版本、hash、來源及逐項記錄見[review-ledger](../../content/U01/review-ledger.json)、[教材說明](../../content/U01/review.md)、[美術設定](../../design/JOURNEY_ART.md)。

## 最小真人工作

1. 日語審核者逐項核對9教學卡、兩名居民四段對話的中日語意、25詞／5漢字／3文法、4閱讀、6聽力稿、65題中日文、唯一正解／干擾理由、先修及題族血緣；逐檔聽14段教材及4段居民WAV。補具體ID與問題。`review-ledger.json`所有項目須真實記reviewer、日期、版本、結果；非原作者不能只看總數就核准。來源／授權亦要確認。
2. UX／產品真人在至少一台實體平板走完整循環：家門移動→兩居民交談／朗讀→道館教學→戰鬥（攻擊／防守／夥伴技、提示、錯題與撤退）→領幣→商店試穿／買帽→背包卸下再穿→回鎮→refresh續玩→PIN後家長報告。另在隔離視覺fixture看三件裝備四方向與戰鬥姿態。
3. 同一台平板實測橫直向、觸控尋路／方向控制、pointercancel／切App停止、音訊、200%文字、下載完成後關網路並關頁冷啟，確認探索、戰鬥、購物與續存。記實際機型、OS與瀏覽器版本；WebKit不是這項證據。
4. 記錄迷路／誤觸／閱讀負擔、招式是否形成不同選擇、首勝60／重玩10與40／60／80商品是否合適，提出明確改動。需要改參數時agent更新版本／理由／測試；不得為了驗收臨時改低門檻。這是P2真人可玩性核對，不宣稱完成P3兒童試用。

可由同一位實際具資格者兼任角色；尚未指派的人員不填假姓名。只回報問題也可以，agent負責修正；缺陷關閉且必要證據齊備後再填PASS。

## 實測填寫表

| 欄位 | 真實值 |
|---|---|
| reviewer／角色 | 待指派 |
| 日期／時區 | NOT_RUN |
| commit／Preview URL | NOT_RUN |
| 教材／美術／語音版本 | NOT_RUN |
| 平板機型／OS／瀏覽器版本 | NOT_RUN |
| 橫直向／文字設定／輸入方式 | NOT_RUN |
| 匿名驗收玩家ID | NOT_RUN |
| 步驟／預期／實際／問題ID | NOT_RUN |
| 截圖／影片／逐項ledger位置 | NOT_RUN |
| 日語／音訊／視覺／可玩性／實機結果 | NOT_RUN |

證據不含憑證、兒童姓名、影像或可識別資料。不要把真實孩子的資料匯入公開repo。

## 簽核後agent接手

核對簽核對應的實際hash及commit；修訂項目撤銷舊review、重跑受影響檢查並重審。依序處理U01-M→T／Q1／Q2／A→V→I、P2-11→P2-08→P2-09。下游的TODO／BLOCKED不能只因草稿可玩改DONE。正式release檢查、G2十五項與全部25項task通過後才可COMPLETE；合併main與正式發布仍需另行授權。
