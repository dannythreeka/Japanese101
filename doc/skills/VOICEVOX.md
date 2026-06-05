# VOICEVOX 音檔生成指南

本專案使用 [VOICEVOX](https://voicevox.hiroshiba.jp/) 技術生成日語學習音檔。音檔主要用於五十音、單字以及遊戲指令的發音。

## 生成機制

我們使用 `scripts/generate-audio.ts` 腳本來自動化生成流程。該腳本支援兩種模式：

1.  **公共 API 模式 (預設)**：使用 [tts.quest](https://api.tts.quest/) 提供的 V3 API。這是一個異步過程，適合少量生成或環境未安裝 VOICEVOX 時。
2.  **本地引擎模式 (推薦)**：直接連接本地執行的 VOICEVOX 引擎 (預設埠 50021)。這比公共 API 快得多且更穩定，推薦用於大批量生成（200+ 個檔案）。

## 如何生成音檔

### 1. 測試環境 (生成單一音檔)
執行以下指令來驗證連線是否正常：
```bash
npm run gen:voice:test
```
這將會生成「やった！」(phrase_yatta.wav) 到 `public/assets/audio/`。

### 2. 批量生成
若要掃描所有資料（五十音與單字）並補齊缺失的音檔：
```bash
npm run gen:voice
```

### 3. 使用本地引擎 (加速生成)
1. 下載並啟動 [VOICEVOX 桌面版](https://voicevox.hiroshiba.jp/)。
2. 執行：
```bash
VOICEVOX_URL=http://localhost:50021 npm run gen:voice
```

## 如何增加新的音檔項目

音檔生成是基於專案內的 JSON 資料驅動的：

1.  **五十音**：修改 `src/data/kana.json` 中的條目。
2.  **單字**：修改 `src/data/vocabulary.json`。
3.  **遊戲片語**：在 `scripts/generate-audio.ts` 中的 `GAME_PHRASES` 常數中定義。

增加資料後，執行 `npm run gen:voice`，腳本會自動偵測並僅為新項目生成音檔。

## 當前使用的參數

為了讓學習者能更清晰地聽辨發音，我們在**本地模式**下調整了以下參數（公共 API 模式目前使用其預設值）：

*   **話者 (Speaker)**: 2 (四國めたん / Shikoku Metan, Normal)
*   **語速 (Speed Scale)**: 0.87 (稍微放慢)
*   *音調 (Intonation Scale)**: 1.15 (增加抑揚頓挫)
*   **音高 (Pitch Scale)**: 0.02 (稍微調高，使其聽起來較具親和力)

## 授權說明

本專案選用的角色為「四國めたん」。
VOICEVOX 及其角色（如四國めたん、ずんだもん）均支援**免費商用**，但必須遵守各角色的利用規約。

*   [VOICEVOX 利用規約](https://voicevox.hiroshiba.jp/term/)
*   [四國めたん 利用規約](https://zunko.jp/con_ongen_kiyaku.html)
