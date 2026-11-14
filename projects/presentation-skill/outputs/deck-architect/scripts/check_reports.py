#!/usr/bin/env python3
"""Content check for progress reports filled in by several units (multi-author quality gate).

Usage:
  python3 check_reports.py weekly.pptx [--out report.md]

Reads every slide of a PPTX built from a fixed progress-report template and flags the
problems managers complain about: "流水帳" lines with no number or concrete result,
blank sections, and risk tables left as "/" on every row.

The defaults match the common template "本週完成 / 下週工作 / 重要問題（問題描述、影響、
解決方案、完成日期、DRI）". Other labels can be passed with --this-week / --next-week /
--risk-header. Needs python-pptx (pip install python-pptx).

Exit code 0 = no problems, 1 = problems found, 2 = could not read the file.
"""
import argparse
import re
import sys
from pathlib import Path

try:
    from pptx import Presentation
except ImportError:  # pragma: no cover
    sys.exit("需要 python-pptx：pip install python-pptx")

NUMBERISH = re.compile(r"\d|％|%|完成|上線|結案|已提供|已交付|通過|done|Done|DONE")
EMPTY = re.compile(r"^[\s/／\-—–]*$")


def walk(shapes):
    for sh in shapes:
        if sh.shape_type == 6:  # group
            yield from walk(sh.shapes)
        else:
            yield sh


def slide_name(slide):
    if slide.shapes.title is not None and slide.shapes.title.text.strip():
        return slide.shapes.title.text.strip()
    # fall back to the largest-font short text near the top
    best = None
    for sh in walk(slide.shapes):
        if sh.has_text_frame and sh.text_frame.text.strip() and len(sh.text_frame.text.strip()) <= 40:
            top = sh.top or 0
            if best is None or top < best[0]:
                best = (top, sh.text_frame.text.strip().split("\n")[0])
    return best[1] if best else "（無標題）"


def paragraphs_of(cell):
    """(indent, text) for each paragraph of a table cell. Indent comes from the paragraph's
    left margin (how PowerPoint stores sub-bullets) plus any leading spaces or dash."""
    out = []
    for para in cell.text_frame.paragraphs:
        raw = para.text
        if not raw.strip():
            continue
        ppr = para._p.pPr
        marl = int(ppr.get("marL", 0)) if ppr is not None else 0
        lead = len(raw) - len(raw.lstrip())
        dash = 1 if re.match(r"^\s*[-–—‧·▪•]", raw) else 0
        out.append((marl + para.level * 100000 + (lead + dash) * 40000, raw))
    return out


def blocks_of(paras):
    """Group paragraphs into blocks: a heading plus the more-indented lines under it.

    A heading such as "RAG 維護" is fine without a number as long as one of its sub-lines
    carries the concrete result ("P1: 370 筆"). Returns a list of (heading, [all lines]).
    """
    blocks, head_indent = [], None
    for indent, raw in paras:
        line = raw.strip(" \t•·-‧▪●○◆■□–—")
        if len(line) < 4:
            continue
        if blocks and head_indent is not None and indent > head_indent:
            blocks[-1][1].append(line)
        else:
            blocks.append((line, [line]))
            head_indent = indent
    return blocks


def check(path, this_week, next_week, risk_header):
    prs = Presentation(path)
    findings, summary = [], {"slides": 0, "flagged": 0}
    for n, slide in enumerate(prs.slides, 1):
        name = slide_name(slide)
        sections, risk_rows, saw_template = {}, None, False
        for sh in walk(slide.shapes):
            if not getattr(sh, "has_table", False) or not sh.has_table:
                continue
            rows = [[c.text.strip() for c in r.cells] for r in sh.table.rows]
            for r_obj, r in zip(sh.table.rows, rows):
                cells = list(r_obj.cells)
                for i, cell in enumerate(r):
                    label = re.sub(r"\s", "", cell)
                    for key, names in (("this", this_week), ("next", next_week)):
                        if any(label.startswith(x) for x in names) and i + 1 < len(r):
                            sections[key] = (r[i + 1], paragraphs_of(cells[i + 1]))
                            saw_template = True
            if rows and any(risk_header in c for c in rows[0] + (rows[1] if len(rows) > 1 else [])):
                saw_template = True
                header_idx = 0 if any(risk_header in c for c in rows[0]) else 1
                data = [r for r in rows[header_idx + 1:]]
                risk_rows = [[c for c in r if not re.fullmatch(r"重要\s*問題", c)] for r in data]
        if not saw_template:
            continue
        summary["slides"] += 1
        issues = []
        for key, label in (("this", "本週"), ("next", "下週")):
            text, paras = sections.get(key, ("", []))
            if EMPTY.match(text or ""):
                issues.append(f"{label}欄位空白：請寫「{label}無更新」並附原因，不要留白。")
                continue
            bs = blocks_of(paras)
            vague = [h for h, ls in bs if not any(NUMBERISH.search(x) for x in ls)]
            if bs and len(vague) / len(bs) > 0.5:
                sample = "；".join(v[:24] for v in vague[:3])
                hint = ("每條寫成「做到什麼＋數字」，例如完成幾項、比例多少、比計畫快或慢幾天。" if key == "this"
                        else "每條寫成可驗收的目標：做到什麼＋數字或完成日期（ETA）。")
                issues.append(f"{label}有 {len(vague)}/{len(bs)} 項沒有數字或明確結果（例：{sample}）。{hint}")
        if risk_rows is not None and all(all(EMPTY.match(c or "") for c in r) for r in risk_rows):
            issues.append("重要問題表全空。真的沒有風險嗎？有的話寫「問題 → 影響 → 解決方案 → 日期 → 負責人」；"
                          "確定沒有，寫一行「本週無風險」，主管才知道是確認過的。")
        if issues:
            summary["flagged"] += 1
            findings.append((n, name, issues))
    return findings, summary


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pptx")
    ap.add_argument("--out")
    ap.add_argument("--this-week", default="本週完成,本週工作")
    ap.add_argument("--next-week", default="下週工作,下週預計")
    ap.add_argument("--risk-header", default="問題描述")
    a = ap.parse_args()
    if not Path(a.pptx).exists():
        print(f"找不到檔案：{a.pptx}")
        sys.exit(2)
    findings, summary = check(a.pptx, a.this_week.split(","), a.next_week.split(","), a.risk_header)
    lines = [f"# 進度回報內容檢查：{Path(a.pptx).name}", "",
             f"套用模板的頁面 {summary['slides']} 頁，需要修改 {summary['flagged']} 頁。", ""]
    for n, name, issues in findings:
        lines.append(f"## 第 {n} 頁：{name}")
        lines += [f"- {x}" for x in issues]
        lines.append("")
    if not findings:
        lines.append("沒有發現問題。")
    report = "\n".join(lines)
    if a.out:
        Path(a.out).write_text(report, encoding="utf-8")
    print(report)
    sys.exit(1 if findings else 0)


if __name__ == "__main__":
    main()
