# v4.8 引擎回歸測試簡報

用途：每次改動底盤、`assemble.py`、`check.mjs` 或 4 套風格動態套件後，跑這份確認沒有退化。內容全部虛構，不是設計範例。

涵蓋：
- 4 套風格動態套件的 11 個原語（`check.mjs --motion` 第 16 項）
- `unlisted: true` 藏牌章節不進封面路線、目錄與常駐導航
- `templates/deck.css` 畫布基礎排版能直接承接 `references/recipes/editorial-drama.md` 型態 A（兩層字版本）
- `references/recipes/bento-causal.md` 的 `data-focus-plan` 三拍聚光：換頁進入後要演完並 100% 復原（v4.8 修掉的卡在第 1 拍問題）
- 生動度稽核的原語分開計數與風格契合

預期結果：`assemble.py` 會對 counsel 禁用 `popup-fold` 印出 [WARN]（這份刻意混用 4 套套件來測引擎）。

```bash
python3 ../../deck-architect/scripts/lint.py storyboard.yaml
python3 ../../deck-architect/scripts/assemble.py storyboard.yaml
node ../../deck-architect/scripts/check.mjs deck.html --jpg --motion
```
