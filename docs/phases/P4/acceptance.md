# P4 工程驗證

Phase IN_PROGRESS，不是正式P4通過。基準93a5dbd＋本批工具，執行者Codex；真人reviewer待指派。

| 條件 | 實際證據 |
|---|---|
| 75能力逐項教學／primary練習／check／五題族 | src/content/coverage.ts，實際12候選完整、63缺口；報告docs/content/curriculum-coverage.json |
| 次要標籤不能冒充主測量 | coverage.test.ts測試G60只有次要標籤，仍缺practice/check |
| 重排／標點微改不能灌family | 對prompt、選項、來源正規化，保留item IDs，重複check不增加eligible families；語意不同仍需真人證明 |
| 練習題洩漏、跨unit family洩漏、衝突正解 | coverage.test.ts明確拒絕，受污染候選不計獨立覆蓋 |
| 逐項審核hash／身份／日期／版本 | review-audit.test.ts；U01 canonical格式實際149筆全部hash吻合、無stale；四課554筆均缺真實核准 |
| draft與release分離 | draft盤點exit0、缺口明列；release預期exit1，逐項列未審項ID與缺skill／unit，不稱草稿已通過正式gate |

人工語意獨立性、內容正確性與真實reviewer身份，不能由上述程式測試代替。此批只改驗證工具／報告，不改播放器或學習數值，UI沿用93a5dbd證據。最終命令結果追加下方。

最終15測試／4檔PASS（2.96s），typecheck／lint PASS。真實draft inventory exit0，75節點12候選完整／63缺口、554簽核0有效，U01原149筆hash全吻合；`--write`不變更任何既有ledger。正式release實際exit1，逐項內容審核、圖片與世界語音核准、缺skill與U05～24均被拒絕；摘要與報告hash在evidence/release-rejection.json。完整輸出留本機/tmp/j101-p4-release-final.json，可由同命令再生。

隔離CLI測試以副本製造矛盾簽核：exit1且ledger逐字保持；過期hash核准重置NOT_RUN／reviewer與日期清空；原工作樹ledger前後一致。機械重複正規化保留小數點等有意義標點，只忽略空白與尾端句號／問號／驚嘆號，避免把1.5誤認成15。未執行新UI測試，因本批不改runtime或畫面；沿用93a5dbd產品證據。
