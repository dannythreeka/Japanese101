# P0 gate 與驗收結果

狀態：**BLOCKED／NO-GO**。可獨立執行的P0工程工作已交付；仍缺內容／UX真人審核、實際承接確認與可存取preview的SHA驗證。**不標COMPLETE，不解除P1-依賴。**

基準：main@91006716d38a9afb63bb061bbb652577c7c79a26。工程分支phase/p0-baseline，draft PR [#53](https://github.com/dannythreeka/Japanese101/pull/53)。已提交批次：b481099（盤點）、935631a（規格／藍圖）、637ab42（工具／CI）、3b0d877（操作probe／狀態）。後續證據commit僅補文件／測試產物；最終SHA以PR head／git log為準。

## Task 驗收

| Task | 狀態 | 預期／實際／證據 | Reviewer |
|---|---|---|---|
| ENV-01 | DONE | 同session shell、repo、Node/npm、Chromium localhost與截圖；CI三引擎。`.nvmrc`、ENGINEERING_RULES、baseline、ci/summary.json | Codex工程驗證 |
| P0-01 | DONE | App.tsx全部21 route entries（含redirect）、主要feature、8 game_modes分類；舊文件提示、八finding連task及步驟 | Codex規格／source核對 |
| P0-02 | DONE | 五份入口＋137列需求索引，phase gates／十畫面及六資料狀態／audio／mic全有方法、證據位置、角色 | Codex結構與連結核對 |
| P0-03 | IN_REVIEW | 24單元、75能力、60文法候選、14類題型、配額／先修DAG、五題族規則；10個驗證器案例通過。真人日語內容審核缺席，未凍結 | 作者Codex；真人reviewer待指派 |
| P0-04 | DONE | 原始六檢查與Node22結果保存；三引擎CI smoke有home.png／trace。原始lint仍紅，已有P1-13；不當全綠 | Codex；CI run連結見baseline |
| P0-05 | IN_REVIEW | 九流程實作／probe、五寬＋200%共55圖／觀測；F01–07已觀測，F04為API spy。初步視覺審視已做，真人UX／實機未做 | Codex初審；真人UX／QA待指派 |
| P0-06 | BLOCKED | CI補齊typecheck／data／blueprint／lint／unit／build／三引擎及artifact；Vercel正式入口、Pages移除待合併。preview轉登入，無法GET版本SHA | Codex工程；Vercel權限需擁有者 |
| P0-07 | BLOCKED | 六條gate逐項記錄、P1第一批PR已排；責任人／人工簽核與preview尚缺 | 產品／QA真人待確認 |

所有證據在docs/verification/。實測commit與截圖紀錄分開：UI/probe針對runtime src@9100671（本PR從未修改runtime src）；CI工具基準637ab42，GitHub PR runner合成merge 838b7416cfad50d9cb764bcf36cab907d970bb7d，三引擎PASS；後續3b0d877僅增加port選項與測試環境metadata，最終CI另列baseline。檢查不使用真孩子紀錄。

## project §3.1 六項 gate

| 條件 | 結果 | 證據／限制 |
|---|---|---|
| 1 所有路由與功能分類 | PASS | docs/spec-reconciliation.md |
| 2 F-01～08獨立追蹤與步驟 | PASS | 同上＋defects.md＋probes／截图；P0只要求追蹤，不冒充已修 |
| 3 歷史文件適用版本 | PASS | SPEC／KICKOFF／INVENTORY／HANDOFF開頭提示 |
| 4 CI實際執行並保存初始結果 | PASS（基準建立；lint失敗） | initial-*、final-*、CI artifacts；失敗已建立P1-13，未移除檢查 |
| 5 單一正式入口與部署證據 | PARTIAL／BLOCKED | Vercel既有production SHA可由GitHub核對、正式別名HTTP200；本分支preview遭登入保護，待版本JSON驗證 |
| 6 每項實際責任人 | BLOCKED | 角色已列tasks／matrix；真人內容／UX／最終產品驗收承接未確認 |

完整P0另需P0-03真人內容簽核，不能以表中前四項PASS宣稱完成。

## 責任名單與待簽核

| 角色 | 實際已做／可證明的人員 | 承接／簽核狀態 |
|---|---|---|
| P0工程執行 | 本session Codex agent | 已執行並提交；人類長期工程owner未另獲指定 |
| 產品方向來源／repo擁有者 | dannythreeka（使用者已確認兒童／JLPT與授權P0） | 不把方向授權當本次gate簽核；待確認驗收承接 |
| 日語內容審核 | 未指定 | 待有實際日語能力的真人reviewer；重點CONTENT_BLUEPRINT列出的候選句型與順序 |
| UX／QA | Codex已作工程與視覺初審；真人未指定 | 待指定可兼任者審圖／操作並記錄姓名、日期、結果 |
| 主機／Vercel管理 | dannythreeka已在主機操作AppArmor；Vercel管理台承接未確認 | 需提供可驗證preview的授權方式；不修改外部保護設定 |

## NO-GO解除項目（具體工作）

1. P0-03：真人審CONTENT_BLUEPRINT及manifest（含潛在重複／超出核心的文法候選），填reviewer／版本／日期／結果；需要改動時回到工程修正結構與配額後重驗。
2. P0-05／07：確認產品、內容、UX／QA、工程的實際承接者（可兼任），取得需真人部分的簽核，不填假姓名。
3. P0-06：擁有者提供可存取的preview（或受保護preview的合法測試存取方式），GET /version.json的JSON sha應等於對應branch部署SHA，並開首頁核對；不以登入HTML HTTP200算PASS。
4. P0-07：上述通過後重審六項gate，記錄簽核commit，才能放行P1-01／02／03及13。P1-13修lint是可靠度階段工作，本P0只建立真實基準，不為gate綠燈提前跨Phase。

主機AppArmor目前暫時載入，重開機可能失效。持久化不是此P0工具驗收的隱含前提；交接已說明，後續維護由主機管理者處理。沒有更動核心／Wi-Fi／apt或交易服務。
