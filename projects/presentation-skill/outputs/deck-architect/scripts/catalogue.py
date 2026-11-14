#!/usr/bin/env python3
"""Build the layout catalogue: every variant of every layout, with fictional content, in one style.

    python3 catalogue.py <outdir> [--theme swiss]

Writes into <outdir>:
  catalogue.html   every variant side by side (open this to browse the library)
  deck.html        the same pages as a deck, so check.mjs can test them:
                   node check.mjs <outdir>/deck.html
  storyboard.yaml  the storyboard behind deck.html

Use it after adding a layout variant or a style: a variant must work in every style, and a style
must keep its contrast on every variant.
"""
import argparse
import sys
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import yaml  # noqa: E402
from build import deck_html, layouts_html  # noqa: E402
from deck_model import VARIANTS, VARIANT_ZH  # noqa: E402

PHOTO = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="#8d8a84"/><rect y="640" width="1600" height="360" fill="#5f5b55"/><circle cx="1180" cy="330" r="170" fill="#c9c5bd"/><rect x="240" y="420" width="420" height="300" fill="#b3aea5"/><rect x="760" y="520" width="220" height="200" fill="#a09b92"/></svg>'''

CONTENT = {
    "point": dict(key="客人回來，不是因為折扣，\n是因為==被記得==", support="訪談 30 位常客，22 位提到「店員記得我喝什麼」"),
    "number": dict(value="==72%==", label="的常客每週至少來三次", note="2026 年 3 月會員資料，共 1,840 位常客",
                   points=["平均每次消費高出 18%", "其中六成會帶朋友來", "流失率只有一般會員的一半"]),
    "stats": dict(lead="四個數字，說明常客有多重要", stats=[
        dict(heading="常客很多", value="==1,840==", label="位常客", note="每週至少來一次", bar=46),
        dict(heading="來得很勤", value="72%", label="每週來三次以上", note="占常客的比例", bar=72),
        dict(heading="花得更多", value="18%", label="客單價較高", note="與一般會員相比", bar=18),
        dict(heading="相當滿意", value="4.6", label="平均滿意度", note="滿分 5 分", bar=92)], note="資料期間：2026 年第一季"),
    "steps": dict(items=[dict(label="記下偏好", detail="第一次點單就記錄甜度與溫度"),
                         dict(label="==叫出名字==", detail="第二次來就用名字打招呼"),
                         dict(label="主動推薦", detail="依照偏好推薦當季新品"),
                         dict(label="收集回饋", detail="每月一次，問一個問題")], note="四個動作每天都做，不需要新系統"),
    "timeline": dict(events=[dict(when="1 月", label="試辦兩家店", detail="信義店、公館店"),
                             dict(when="3 月", label="==擴大到八家==", detail="加入北區所有直營店"),
                             dict(when="6 月", label="全台上線", detail="含加盟店"),
                             dict(when="9 月", label="檢討成效", detail="決定明年預算")], note="每個階段結束後停一週檢討"),
    "compare": dict(left=dict(heading="以前", items=["發折價券", "每月辦一次活動", "看營業額"]),
                    right=dict(heading="現在", items=["==記得每位常客==", "每天做四個小動作", "看回訪率"]),
                    note="成本沒有增加，改變的是每天的習慣"),
    "quote": dict(text="我換了三家咖啡店，只有這家==記得我不加糖==。", source="一位來了兩年的常客"),
    "bullets": dict(items=["每家店指定一位常客負責人", "每週回報一次==回訪率==", "每月選出一個最佳做法", "每季全區分享一次"],
                    note="先從直營店開始"),
    "image": dict(src="photo.svg", alt="吧台示意圖", caption="吧台是認識客人的==第一現場=="),
    "lanes": dict(lanes=["以前怎麼做", "現在怎麼做"], stages=[
        dict(before=["客人自己填資料卡", "店員抄進筆記本", "月底整理一次"], change="改成點單時順手記", after="點單時記偏好", detail="兩個欄位：甜度、溫度"),
        dict(before=["看筆記本找名字", "常常找不到"], change="系統自動帶出", after="==叫出名字==", detail="刷會員就顯示"),
        dict(before=["店長憑印象推薦"], change="依紀錄推薦", after="推薦當季新品", detail="每季更新一次清單"),
        dict(before=["發問卷", "回收率不到一成"], change="改成當面問", after="每月問一個問題", detail="結帳時順口問")],
        note="四個步驟都不需要新設備"),
    "table": dict(columns=["門市", "常客數", "回訪率", "負責人"],
                  rows=[["信義店", "420", "81%", "店長"], ["公館店", "==388==", "77%", "副店長"],
                        ["天母店", "305", "69%", "店長"], ["板橋店", "290", "64%", "資深店員"]],
                  note="回訪率：30 天內再次消費的比例"),
}
CHAPTERS = [dict(id="a", label="為什麼", minutes=5), dict(id="b", label="怎麼做", minutes=5), dict(id="c", label="成果", minutes=5)]
ORDER = ["point", "number", "stats", "quote", "steps", "timeline", "bullets", "compare", "lanes", "image", "table"]
CHAPTER_OF = {"point": "a", "number": "a", "stats": "a", "quote": "a", "steps": "b", "timeline": "b", "bullets": "b",
              "compare": "c", "lanes": "c", "image": "c", "table": "c"}
CLOSING = dict(type="closing", text="明天開始，\n==記得一位客人==", sub="從你的店開始", points=["記下偏好", "叫出名字", "==每週看回訪率=="])


def storyboard(theme, slides):
    return dict(
        meta=dict(title="讓客人==被記得==", subtitle="版型型錄：每一種排法都用同一份虛構內容", presenter="示範", date="2026.11",
                  minutes=15, theme=theme),
        structure=dict(start="不知道常客為什麼來", destination="知道每天要做哪四件事", axis="causal", direction="原因 → 做法 → 成果"),
        chapters=CHAPTERS, slides=slides)


def deck_data(theme):
    """Every variant as its own page. Content variants are appendix pages so they carry no tab bar."""
    slides = [dict(type="cover")]
    slides += [dict(chapter=CHAPTER_OF[k], layout=k, title=f"{k}（預設排法）", **CONTENT[k]) for k in ("point", "steps", "compare")]
    slides += [dict(type="cover", variant=v) for v in VARIANTS["cover"][1:]]
    slides += [dict(CLOSING, variant=v) for v in VARIANTS["closing"]]
    for k in ORDER:
        for v in VARIANTS[k]:
            slides.append(dict(chapter=CHAPTER_OF[k], layout=k, variant=v, title=f"{k}・{VARIANT_ZH[k][v]}",
                               appendix=True, id=f"{k}-{v}", **CONTENT[k]))
    return storyboard(theme, slides)


def grid_data(theme):
    """One page per layout; catalogue.html then shows every variant of each."""
    chapters = CHAPTERS + [dict(id="d", label="下一步", minutes=5)]  # four chapters, so a TOC page exists
    slides = [dict(type="cover")]
    slides += [dict(chapter=CHAPTER_OF[k], layout=k, title=k, **CONTENT[k]) for k in ORDER]
    slides += [dict(chapter="d", layout="point", title="point", **CONTENT["point"]), CLOSING]
    data = storyboard(theme, slides)
    data["chapters"] = chapters
    return data


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("outdir")
    ap.add_argument("--theme", default="wireframe", help="a built-in style name or a path to a theme.css (default: wireframe)")
    a = ap.parse_args()
    out = Path(a.outdir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "photo.svg").write_text(PHOTO, encoding="utf-8")
    theme = a.theme if not a.theme.endswith(".css") else str(Path(a.theme).resolve())
    data = deck_data(theme)
    for s in data["slides"]:
        s.setdefault("type", "content")
    (out / "storyboard.yaml").write_text(
        "# 版型型錄：由 scripts/catalogue.py 產生。內容是虛構的；頁數與章節安排不符合一般簡報的規則，建置時不經過 lint。\n"
        + yaml.safe_dump(data, allow_unicode=True, sort_keys=False, width=200), encoding="utf-8")
    (out / "deck.html").write_text(deck_html(data, out), encoding="utf-8")
    grid = grid_data(theme)
    for s in grid["slides"]:
        s.setdefault("type", "content")
    (out / "catalogue.html").write_text(layouts_html(grid, out, theme=theme, every=True), encoding="utf-8")
    n = sum(len(v) for v in VARIANTS.values())
    print(f"已輸出：{out}/catalogue.html、{out}/deck.html（{len(VARIANTS)} 種內容類型、{n} 種排法，風格：{a.theme}）")


if __name__ == "__main__":
    main()
