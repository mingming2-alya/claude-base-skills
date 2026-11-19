# 生圖需求：埃及壁畫、瑪雅抄本

_2026-11-19。依使用者決定「程式先畫，不足再生圖」。十二張新畫風裡，這兩張的程式版只到「可用」，建議生圖。其餘十張程式版已足夠。_

## 共同規格

- **比例與尺寸**：16:9，1920 × 1080 以上的 PNG。
- **構圖**：所有人物與場景只放在畫面右側約 48%（x 從 52% 到 97%）。左側 52% 只留底材（石灰岩牆或樹皮紙）的紋理，因為那裡要放標題與條列。
- **不要文字**：畫面裡不要可讀的文字、拉丁字母或數字。字符方塊、象形符號只要「看起來像」即可。
- **不要現代物件**。
- **交回位置**：放進 `img-src/`，檔名照下表。

收到圖之後，我會做四件事：

1. 把它換成該頁的場景層，邊框、王名圈、點槓數字等框飾與文字層保留程式版。
2. 用 `node render.cjs` 檢查裁切與文字對比。
3. 量測新圖的配色，補進規格。
4. 更新總覽。

## 1. 埃及壁畫｜`img-src/05-egypt-scene.png`

- **頁面**：金字塔怎麼蓋：古代的專案管理（四個步驟）。
- **為什麼要生圖**：程式版的人物比例與姿勢太僵硬，書記官的坐姿不自然。
- **畫面**：三層橫向分欄，用藍、紅、藍色帶隔開。
  - 上層：兩位盤腿而坐、在莎草紙上記錄的書記官，以及一位持杖指示的監工。
  - 中層：一群工人用繩索拉著放在木雪橇上的大石塊，最前面一人在沙上潑水。
  - 下層：工人沿泥磚坡道把石塊搬上半完成的金字塔，旁邊有尼羅河上載石塊的船。
- **配色**：

  | 顏色 | 色碼 |
  |---|---|
  | 埃及藍 | #2E5E9E |
  | 孔雀石綠 | #3E8E7E |
  | 紅赭 | #B5452E |
  | 黃赭 | #D9A441 |
  | 黑 | #1E1A18 |
  | 白色亞麻裙 | — |
  | 石灰岩底 | #E9D8B4 |

  細黑輪廓線，灰泥略有剝落。
- **建議提示詞**：

  > Ancient Egyptian tomb wall painting, three horizontal registers separated by blue-red-blue painted bands, depicting pyramid construction. Top register: two seated scribes writing on papyrus and an overseer holding a staff. Middle register: workers hauling a large limestone block on a wooden sledge with ropes, one man pouring water on the sand in front of the sledge. Bottom register: workers carrying blocks up a mud-brick ramp beside a half-built pyramid, a Nile boat loaded with stone. Classic Egyptian canon: heads in profile with frontal eyes, square shoulders, flat mineral pigments (Egyptian blue, malachite green, red ochre, yellow ochre, black, white linen kilts), fine black outlines, slightly flaked plaster on pale limestone. 16:9. All figures in the right half of the frame; the left half is plain limestone wall with subtle texture only. No legible text, no letters, no modern objects.

## 2. 瑪雅抄本｜`img-src/07-maya-scene.png`

- **頁面**：年度行事曆（四季時間軸）。
- **為什麼要生圖**：程式版缺少抄本最有特色的人物與神祇，現在比較像圖示。
- **畫面**：一段攤開的摺頁抄本，四頁並排，每頁一季的玉米農事，各有一位瑪雅人物。
  1. 拿掘棒播種。
  2. 照顧新芽。
  3. 雨神恰克替長高的玉米降雨。
  4. 把成熟的玉米收進籃子。

  每頁上方有幾列圓角字符方塊，下方有一到四的點槓數字（點代表 1）。
- **配色**：

  | 顏色 | 色碼 |
  |---|---|
  | 瑪雅藍 | #3F86A6 |
  | 紅 | #B23A2A |
  | 黃赭 | #D9A441 |
  | 綠 | #5E8A54 |
  | 黑色輪廓 | — |
  | 塗了石灰的樹皮紙 | #E8DABB |

  頁面有磨損與水漬。
- **建議提示詞**：

  > A page spread of an ancient Maya screenfold codex painted on lime-coated bark paper: four folded pages side by side, red guide lines, bold black outlines, flat colours (Maya blue, red, yellow ochre, green). Each page shows one stage of the maize year with a Maya figure: planting seeds with a digging stick; tending young sprouts; the rain god Chaac pouring rain over tall maize; harvesting ripe cobs into a basket. Rows of rounded glyph blocks above each scene, bar-and-dot numerals one to four at the bottom of each page (dots only). Worn plaster, stains, soft creases at the folds. 16:9. The codex sits only in the right half of the frame; the left half is plain bark paper. No legible text, no Latin letters.

## 選擇性升級（不急）

- **復古卡通**：角色更有表情與動態。
- **浮世繪**：浪花與攤位人物更細緻。

程式版已可用，等確定要用這兩種畫風做正式簡報時再說。
