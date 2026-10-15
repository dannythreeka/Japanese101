# P1 三引擎CI初次失敗保留

Run：[38734824584](https://github.com/dannythreeka/Japanese101/actions/runs/38734824584)。PR head `9175a6293d999f5ea85d4a01382801df1c5eef72`，GitHub合成merge／artifact SHA `ac56eb32e4cf659d832a949b46365488f656b35a`。

Test & Build PASS。Chromium與Firefox當次各13 PASS／1 FAIL，不能當作整輪成功；WebKit當次最後也是13 PASS／1 FAIL。

- Chromium job 116421890018：恢復測試按下新練習後過早讀到舊ID，`expect(newId).not.toBe(oldId)`失敗。修正是先等待掛載ID變更，再保留原斷言，沒有放寬結果。
- Firefox job 116421889843：原生離線WAV等待完成失敗，按鈕維持disabled並正確顯示可重試。trace console：`Media resource ...word_w_kasa.wav... NS_ERROR_DOM_MEDIA_MEDIASINK_ERR (0x806e000b) Details: OnMediaSinkAudioError`。本機Firefox同測可播放；隔離CI缺可用音訊輸出，新增runner限定PulseAudio null sink後重跑，不改交易主機、不以Audio mock取代這項測試。

[Firefox原始artifact](https://github.com/dannythreeka/Japanese101/actions/runs/38734824584/artifacts/11974795591)、[Chromium原始artifact](https://github.com/dannythreeka/Japanese101/actions/runs/38734824584/artifacts/11973396817)（GitHub保留14日）。本地抽取的Firefox失敗trace位於 `/tmp/p1-ci-firefox-offline/trace.zip`，未將大量trace提交repo。最終結果另見acceptance.md，不覆蓋這份失敗紀錄。

WebKit job 116421889941：當次33關三輪主線、其他恢復／視窗檢查通過，失敗是關頁後setOffline導航回報internal error。[原始WebKit artifact](https://github.com/dannythreeka/Japanese101/actions/runs/38734824584/artifacts/11974391906)。對照[Playwright #42775](https://github.com/microsoft/playwright/issues/42775)後，另用停止test-owned origin＋全新無SW context負控驗證真實無origin回復，保留全部素材與播放斷言；詳細方法見progress.md及e2e/helpers/offlineOrigin.ts。來源描述較新版本，1.58的本專案現象以本次CI為證。
