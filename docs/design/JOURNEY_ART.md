# P2 分層美術與角色設定（待真人視覺核對）

本批使用內建imagegen，13個獨立資產，完整[prompt set](journey-art-prompts.json)。來源PNG保留原始位元組於工具generated_images；正式檔案在public/assets/img/journey，逐檔來源檔名、原圖／成品hash、尺寸、容量、透明區與處理方式見[manifest](../../public/assets/img/journey/manifest.json)。WebP只做標準格式壓縮，沒有以程式重畫或把概念圖冒充互動介面。

## 設定與定位

- 玩家：深棕短髮、米白上衣、深藍背心及短褲、棕鞋；預設不烘焙帽子或背包。
- 主示範夥伴沿用既有fox species與玩家的petId，不新增種類或清除XP／成長；其他既有夥伴資料保留，正式顯示需相容回退。
- 玩家與fox各3欄×5列：前四列依序下／左／右／上，每列idle／walk A／walk B；第五列戰鬥idle／action／feedback。CSS依原尺寸分格，不把整張sheet當單一人物。地圖、商店、戰鬥共用同一來源。
- 三裝備各2×2方向表：左上front/down、右上left、左下right、右下up/back。帽子head、背包back、fox圍巾neck；定位與前後層在Character與journey.css，需實際換裝截圖核對，不以有圖就宣稱不漂移。
- 對手為原創紙燈風守衛，3×1的idle／action／feedback。兩居民與一位導師為完整人物。沒有使用參考遊戲角色、地圖、標誌或他人素材；真人權利／適齡核對仍待完成。
- terrain只有可行走底層，建築、NPC、角色、裝備各自定位；河流／橋與碰撞依world/map.ts。招牌與操作字、中文／日文、ruby均使用DOM真文字。

## 工程初審界線

Codex已實際檢視13張生成圖：整體線條／水彩／配色一致，方向與姿態可辨，建築標牌留白、裝備未烘焙於角色。格式流程驗證12張透明資產確有alpha，terrain為不透明底圖；成品合計5,177,318 bytes。這些是資產初審，尚不代表已完成跨場景定位、實體平板效能或真人P2-11／P2-09簽核。

後續在正式可操作預覽核對：四方向與動作、透明邊緣、頭部／背部／頸部定位、遮擋、所有三場景穿戴一致、320px與平板小尺寸辨識、減少動態，以及原始／成品來源與權利。審核記實際reviewer、日期、資產版本與問題，不填AI為真人核准者。
