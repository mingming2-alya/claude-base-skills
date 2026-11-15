#!/usr/bin/env python3
"""風格樣張板：同一份虛構內容，用 10 個風格系統各自的背景、元素與排法畫一次。

    python3 make_board.py        # 產生 board.html

每個風格分三層：背景層（.bgl）、元素層（.deco）、文字層。來源見 inputs/style-research.md 第 5 節。
"""
from pathlib import Path

STYLES = [
    ("editorial", "編輯刊物", "淺・知性沉穩", "像一本認真編的月刊：欄格、細線、襯線大字、一個朱色", "年度成果、策略說明、科普、經驗分享"),
    ("swiss", "瑞士網格", "淺・理性俐落", "把結構畫出來：窄標題欄、細字大標、出血的墨色帶、克萊因藍", "會議、提案、數據與進度回報"),
    ("bento", "便當格", "淺・產品感", "所有內容都住在圓角卡片裡，大小不一拼成一個矩形", "產品與數據總覽、儀表板式的報告"),
    ("broadsheet", "號外", "深・大膽直接", "字大到變成圖：粗黑體貼底、火橘只出現在重點", "要被記住的提案、內部推廣、觀點分享"),
    ("midnight", "深夜舞台", "深・高級有份量", "燈暗下來，聚光在一句話：深墨底、底部金色光暈、襯線字", "發表會、活動開場、高階主管場合"),
    ("washi", "剪紙拼貼", "淺・溫暖手作", "每樣東西都是剪下來貼上去的紙片：同一個光源、微微傾斜", "經驗分享、課程、文化與教育"),
    ("riso", "孔版小誌", "淺・獨立印刷", "兩色套印：黑框後面的色塊故意錯位、印章、帳冊列", "觀點、社群、展覽、活動"),
    ("geo", "幾何構成", "彩・海報感", "畫面切成緊密相連的色格：文字在文字格，幾何在幾何格", "主題演講、發表、方法論"),
    ("pop", "普普貼紙", "淺・活潑", "一張貼紙：每個色塊都有黑框和不模糊的硬陰影，卡片微傾", "新創、消費品牌、校園、活動"),
    ("blueprint", "藍圖", "深・工程感", "一張工程圖：藍底點格、文字在不透明的圖框裡、尺寸線與編號", "架構、流程、規格說明"),
]

TILE = '''<figure class="tile"><div class="frame"><div class="stage t-{id}">
<div class="bgl"></div><div class="deco"><i></i><i></i><i></i><i></i><i></i><i></i></div>
<nav><span class="on">為什麼</span><span>怎麼做</span><span>成果</span></nav>
<h2 class="ttl">常客為什麼重要</h2>
<p class="key">客人回來，<br>是因為<em>被記得</em></p>
<div class="fig f1"><b>72<small>%</small></b><span>的常客每週來三次以上</span></div>
<div class="fig f2"><b>1,840</b><span>位常客，每週至少來一次</span></div>
<ol class="st"><li><i>01</i><span>記下偏好</span></li><li><i>02</i><span>叫出名字</span></li><li><i>03</i><span>主動推薦</span></li></ol>
</div></div><figcaption><b>{n:02d}</b> <strong>{zh}</strong> <code>{id}</code> <em>{tone}</em><br>{what}<br><small>適合：{use}</small></figcaption></figure>'''

FONTS = ("https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700;900&family=Noto+Serif+TC:wght@400;700;900"
         "&family=LXGW+WenKai+TC:wght@400;700&family=Chiron+Hei+HK:wght@400;700"
         "&family=Newsreader:opsz,wght@6..72,400;6..72,600&family=IBM+Plex+Mono:wght@400;500&family=Archivo:wght@300;400;600"
         "&family=JetBrains+Mono:wght@400;500;700&family=Hanken+Grotesk:wght@400;600;700&family=Barlow:wght@500;700;900"
         "&family=Anton&family=Space+Mono:wght@400;700&family=Jost:wght@500;700&family=Gabarito:wght@700;900&family=DM+Mono:wght@400;500&display=swap")

CSS = r'''
*{box-sizing:border-box;margin:0;padding:0}
body{background:#e9e7e3;font-family:system-ui,"Noto Sans TC",sans-serif;color:#222;padding:40px 32px 80px}
header h1{font-size:26px} header p{color:#555;margin-top:6px;font-size:15px;max-width:1100px;line-height:1.6}
.board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:36px 28px;margin-top:32px}
.frame{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:6px;box-shadow:0 6px 24px rgba(0,0,0,.16)}
figcaption{margin-top:10px;font-size:15px;line-height:1.6;color:#333}
figcaption b{display:inline-block;background:#222;color:#fff;border-radius:4px;padding:0 8px;margin-right:6px}
figcaption strong{font-size:18px} figcaption code{color:#888;margin:0 6px} figcaption em{font-style:normal;color:#666}
figcaption small{color:#777}
.stage{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;transform-origin:0 0;line-height:1.5;
  font-synthesis:none;-webkit-font-smoothing:antialiased;font-feature-settings:"halt" 1}
.bgl,.deco{position:absolute;inset:0;pointer-events:none}
.deco{z-index:1}.deco i{position:absolute;display:block}
nav,.ttl,.key,.fig,.st{position:absolute;z-index:2}
nav{left:140px;top:56px;display:flex;gap:48px;font-size:22px;line-height:1}
nav span{padding-bottom:14px} nav .on{border-bottom:2px solid currentColor}
.ttl{font-weight:500} .key em,.st i{font-style:normal} .fig b{display:block;font-weight:inherit;line-height:1;white-space:nowrap}
.fig small{font-size:.4em;margin-left:.06em} .fig span{display:block} .st{list-style:none}

/* ---------------------------------------------------------------- 01 editorial 編輯刊物 */
.t-editorial{background:#F2EFE8;color:#1B1915;font-family:"Noto Sans TC",sans-serif}
.t-editorial .bgl{background:radial-gradient(1400px 900px at 92% -10%,rgba(178,58,43,.06),transparent 60%),radial-gradient(1200px 800px at -10% 110%,rgba(27,25,21,.05),transparent 60%)}
.t-editorial nav{font-family:"IBM Plex Mono","Noto Sans TC",monospace;color:#6B6558} .t-editorial nav .on{color:#1B1915}
.t-editorial .ttl{left:140px;top:156px;font:500 24px/1 "IBM Plex Mono","Noto Sans TC",monospace;letter-spacing:.06em;color:#57524A;padding-left:30px}
.t-editorial .ttl::before{content:"";position:absolute;left:0;top:4px;width:14px;height:14px;background:#B23A2B}
.t-editorial .key{left:140px;top:236px;width:940px;font:900 124px/1.22 "Newsreader","Noto Serif TC",serif}
.t-editorial .key em{color:#A3311F}
.t-editorial .deco i:nth-child(1){left:1150px;top:150px;width:1px;height:800px;background:rgba(27,25,21,.28)}
.t-editorial .deco i:nth-child(2){left:140px;top:688px;width:930px;height:5px;border-top:1px solid #1B1915;border-bottom:1px solid #1B1915}
.t-editorial .deco i:nth-child(3){left:1230px;top:150px;width:550px;height:1px;background:#1B1915}
.t-editorial .deco i:nth-child(4){left:1230px;top:548px;width:550px;height:1px;background:rgba(27,25,21,.28)}
.t-editorial .fig{left:1230px;width:550px;font-family:"Newsreader","Noto Serif TC",serif}
.t-editorial .fig b{font-size:216px;font-weight:600;letter-spacing:-.03em} .t-editorial .fig span{margin-top:14px;font:400 30px/1.5 "Noto Sans TC",sans-serif;color:#57524A}
.t-editorial .f1{top:186px} .t-editorial .f2{top:584px} .t-editorial .f2 b{font-size:168px}
.t-editorial .st{left:140px;top:736px;width:930px;display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.t-editorial .st i{display:block;font:500 22px/1 "IBM Plex Mono",monospace;color:#A3311F;margin-bottom:16px}
.t-editorial .st span{font:700 38px/1.3 "Noto Serif TC",serif}

/* ---------------------------------------------------------------- 02 swiss 瑞士網格 */
.t-swiss{background:#FAFAF8;color:#0B0B0B;font-family:"Noto Sans TC",sans-serif}
.t-swiss nav{font-family:"JetBrains Mono","Noto Sans TC",monospace;color:#717171} .t-swiss nav .on{color:#0B0B0B}
.t-swiss .ttl{left:140px;top:150px;width:300px;font:500 40px/1.3 "Archivo","Noto Sans TC",sans-serif}
.t-swiss .deco i:nth-child(1){left:480px;top:150px;width:1px;height:814px;background:#D6D6D3}
.t-swiss .deco i:nth-child(2){left:520px;top:620px;right:0;height:170px;background:#0B0B0B}
.t-swiss .deco i:nth-child(3){left:140px;top:884px;width:300px;height:80px}
.t-swiss .deco i:nth-child(3)::after{content:"01";font:300 150px/.6 "Archivo",sans-serif;color:#D6D6D3;letter-spacing:-.04em}
.t-swiss .key{left:520px;top:150px;width:1240px;font:300 136px/1.14 "Archivo","Noto Sans TC",sans-serif;letter-spacing:-.02em}
.t-swiss .key em{color:#1D3FBF}
.t-swiss .st{left:568px;top:620px;right:140px;height:170px;display:flex;align-items:center;gap:96px;color:#FAFAF8}
.t-swiss .st i{display:block;font:500 20px/1 "JetBrains Mono",monospace;color:#8FA8FF;margin-bottom:14px}
.t-swiss .st span{font:500 40px/1.2 "Noto Sans TC",sans-serif}
.t-swiss .fig{top:840px;display:flex;align-items:baseline;gap:28px;padding-top:20px;border-top:2px solid #0B0B0B}
.t-swiss .fig b{font:300 104px/1 "Archivo",sans-serif;letter-spacing:-.04em} .t-swiss .fig span{font-size:26px;color:#3D3D3D}
.t-swiss .f1{left:520px;width:560px} .t-swiss .f2{left:1140px;width:640px}

/* ---------------------------------------------------------------- 03 bento 便當格 */
.t-bento{background:#EEF1F4;color:#1C2733;font-family:"Hanken Grotesk","Chiron Hei HK","Noto Sans TC",sans-serif}
.t-bento nav{color:#5B6875;font-weight:600} .t-bento nav .on{color:#1C2733}
.t-bento .ttl{left:140px;top:138px;font-size:42px;font-weight:700}
.t-bento .key,.t-bento .fig,.t-bento .st li,.t-bento .deco i:nth-child(1){background:#FBFCFD;border:1px solid #DCE2E8;border-radius:28px;
  box-shadow:0 1px 2px rgba(28,39,51,.06),0 12px 28px rgba(28,39,51,.07)}
.t-bento .key{left:140px;top:226px;width:800px;height:500px;padding:120px 56px 0;font-weight:700;font-size:96px;line-height:1.22}
.t-bento .key::before{content:"核心洞見";position:absolute;left:56px;top:48px;padding:6px 18px;border-radius:99px;background:#FFE9E5;color:#C4381F;font-size:22px;font-weight:600;line-height:1.4}
.t-bento .key em{color:#C4381F}
.t-bento .f1{left:964px;top:226px;width:816px;height:238px;padding:36px 48px}
.t-bento .f1 b{font-size:112px;font-weight:700;display:inline-block} .t-bento .f1 span{display:inline-block;margin-left:24px;font-size:28px;color:#4A5866}
.t-bento .f1::after{content:"";position:absolute;left:48px;right:48px;bottom:40px;height:14px;border-radius:7px;background:linear-gradient(90deg,#FF6A5B 72%,#E3E8ED 72%)}
.t-bento .f2{left:964px;top:488px;width:396px;height:238px;padding:36px 40px}
.t-bento .f2 b{font-size:84px;font-weight:700} .t-bento .f2 span{margin-top:14px;font-size:24px;color:#4A5866}
.t-bento .deco i:nth-child(1){left:1384px;top:488px;width:396px;height:238px;z-index:0;
  background:linear-gradient(#FF6A5B,#FF6A5B) 60px 150px/36px 48px no-repeat,linear-gradient(#FFB4AB,#FFB4AB) 116px 118px/36px 80px no-repeat,
  linear-gradient(#FFB4AB,#FFB4AB) 172px 134px/36px 64px no-repeat,linear-gradient(#FF6A5B,#FF6A5B) 228px 86px/36px 112px no-repeat,
  linear-gradient(#FF6A5B,#FF6A5B) 284px 60px/36px 138px no-repeat,#FBFCFD}
.t-bento .st{left:140px;top:750px;width:1640px;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.t-bento .st li{height:214px;padding:40px 44px}
.t-bento .st i{display:inline-block;padding:4px 16px;border-radius:99px;background:#E6EDF4;color:#3D5166;font-size:22px;font-weight:600;line-height:1.4;margin-bottom:26px}
.t-bento .st span{display:block;font-size:46px;font-weight:700;line-height:1.2}

/* ---------------------------------------------------------------- 04 broadsheet 號外 */
.t-broadsheet{background:#121211;color:#F1ECE4;font-family:"Noto Sans TC",sans-serif}
.t-broadsheet nav{font-family:"IBM Plex Mono","Noto Sans TC",monospace;color:#817E78} .t-broadsheet nav .on{color:#F1ECE4}
.t-broadsheet .ttl{left:140px;top:176px;font:500 24px/1 "IBM Plex Mono","Noto Sans TC",monospace;letter-spacing:.08em;color:#A9A59D}
.t-broadsheet .deco i:nth-child(1){left:140px;top:150px;width:44px;height:3px;background:#E8572A}
.t-broadsheet .key{left:140px;bottom:118px;width:1060px;font:900 178px/1.1 "Barlow","Noto Sans TC",sans-serif;letter-spacing:-.01em}
.t-broadsheet .key em{color:#F06A3E}
.t-broadsheet .fig{left:1260px;width:520px;padding-top:24px;border-top:2px solid #F1ECE4}
.t-broadsheet .fig b{font:900 150px/1 "Barlow",sans-serif;letter-spacing:-.02em} .t-broadsheet .fig span{margin-top:14px;font-size:28px;color:#A9A59D}
.t-broadsheet .f1{top:150px} .t-broadsheet .f2{top:448px} .t-broadsheet .f2 b{font-size:120px}
.t-broadsheet .st{left:1260px;top:744px;width:520px}
.t-broadsheet .st li{display:flex;align-items:baseline;gap:20px;font:900 54px/1.35 "Noto Sans TC",sans-serif}
.t-broadsheet .st i{font:500 22px/1 "IBM Plex Mono",monospace;color:#F06A3E}
.t-broadsheet .st li:nth-child(1){color:#8F8C85} .t-broadsheet .st li:nth-child(2){color:#C4C0B8}

/* ---------------------------------------------------------------- 05 midnight 深夜舞台 */
.t-midnight{background:#0F1116;color:#EDE8DE;font-family:"Noto Sans TC",sans-serif}
.t-midnight .bgl{background:radial-gradient(70% 46% at 50% 114%,rgba(210,166,79,.26),rgba(210,166,79,.07) 48%,transparent 72%),radial-gradient(120% 90% at 50% 40%,transparent 60%,rgba(0,0,0,.4))}
.t-midnight nav{left:150px;top:72px;font-family:"IBM Plex Mono","Noto Sans TC",monospace;color:#8C8A86} .t-midnight nav .on{color:#EDE8DE}
.t-midnight .deco i:nth-child(1){inset:36px;border:1px solid rgba(237,232,222,.16)}
.t-midnight .deco i:nth-child(2){left:200px;top:306px;width:64px;height:2px;background:#D2A64F}
.t-midnight .ttl{left:200px;top:250px;font:500 24px/1 "IBM Plex Mono","Noto Sans TC",monospace;letter-spacing:.08em;color:#DDB466}
.t-midnight .key{left:200px;top:340px;width:860px;font:700 116px/1.28 "Noto Serif TC",serif}
.t-midnight .key em{color:#DDB466}
.t-midnight .fig{left:1150px;width:590px;display:flex;flex-direction:row-reverse;align-items:baseline;justify-content:space-between;gap:28px;padding:30px 0;border-top:1px solid rgba(210,166,79,.55)}
.t-midnight .fig b{font:700 132px/1 "Noto Serif TC",serif} .t-midnight .fig span{font-size:26px;color:#B7B2A8;max-width:230px}
.t-midnight .f1{top:250px} .t-midnight .f2{top:470px;border-bottom:1px solid rgba(210,166,79,.55)} .t-midnight .f2 b{font-size:104px}
.t-midnight .st{left:200px;top:790px;width:1540px;display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.t-midnight .st li{padding:30px 36px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.14)}
.t-midnight .st i{display:block;font:500 20px/1 "IBM Plex Mono",monospace;color:#DDB466;margin-bottom:16px}
.t-midnight .st span{font:700 38px/1.3 "Noto Serif TC",serif}

/* ---------------------------------------------------------------- 06 washi 剪紙拼貼 */
.t-washi{background:#EDE4D3;color:#2A231B;font-family:"Noto Sans TC",sans-serif;
  --cut:polygon(0.6% 1.8%,33% 0.4%,68% 1.5%,99.5% 0.7%,98.9% 34%,99.6% 67%,99.1% 98.6%,66% 99.5%,32% 98.4%,0.8% 99.2%,1.5% 65%,0.3% 33%)}
.t-washi .bgl{background:radial-gradient(ellipse 120% 120% at 50% 45%,transparent 55%,rgba(42,35,27,.1)),
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='900'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 .16 0 0 0 0 .13 0 0 0 0 .1 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='900' height='900' filter='url(%23m)'/%3E%3C/svg%3E")}
.t-washi nav{font-family:"IBM Plex Mono","Noto Sans TC",monospace;color:#6E6455} .t-washi nav .on{color:#2A231B}
.t-washi .ttl{left:140px;top:140px;padding:8px 24px;background:rgba(42,35,27,.13);rotate:-1deg;font-size:26px}
.t-washi .key{left:140px;top:232px;width:980px;height:410px;padding:62px 76px;background:#F7F1E6;clip-path:var(--cut);rotate:-1.2deg;
  font:700 112px/1.3 "LXGW WenKai TC",serif}
.t-washi .key em{color:#2B4675}
.t-washi .deco i:nth-child(1){left:150px;top:246px;width:980px;height:410px;rotate:-1.2deg;clip-path:var(--cut);background:rgba(42,35,27,.3);filter:blur(9px);z-index:0}
.t-washi .deco i:nth-child(2){left:560px;top:206px;width:170px;height:46px;background:rgba(47,76,126,.42);rotate:-4deg;z-index:3}
.t-washi .fig{background:#F7F1E6;clip-path:var(--cut);padding:38px 48px}
.t-washi .fig b{font:700 150px/1 "LXGW WenKai TC",serif} .t-washi .fig span{margin-top:12px;font-size:28px;color:#574D40}
.t-washi .f1{left:1200px;top:196px;width:560px;height:310px;rotate:1.5deg}
.t-washi .f2{left:1240px;top:548px;width:520px;height:250px;rotate:-1deg} .t-washi .f2 b{font-size:108px}
.t-washi .deco i:nth-child(3){left:1210px;top:210px;width:560px;height:310px;rotate:1.5deg;clip-path:var(--cut);background:rgba(42,35,27,.3);filter:blur(9px);z-index:0}
.t-washi .deco i:nth-child(4){left:1250px;top:562px;width:520px;height:250px;rotate:-1deg;clip-path:var(--cut);background:rgba(42,35,27,.3);filter:blur(9px);z-index:0}
.t-washi .st{left:140px;top:712px;width:940px}
.t-washi .st li{display:flex;align-items:center;gap:26px;margin-bottom:14px;padding:14px 30px;background:#E2D6C0;
  clip-path:polygon(0 8%,3% 0,97% 4%,100% 0,99.4% 92%,96% 100%,2% 96%,0 100%);font:700 40px/1.3 "LXGW WenKai TC",serif}
.t-washi .st li:nth-child(odd){rotate:-.5deg} .t-washi .st li:nth-child(even){rotate:.6deg;margin-left:28px}
.t-washi .st i{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:#2F4C7E;color:#F6F0E4;font:500 20px/1 "IBM Plex Mono",monospace}

/* ---------------------------------------------------------------- 07 riso 孔版小誌 */
.t-riso{background:#E9E5DA;color:#161514;font-family:"Noto Sans TC",sans-serif}
.t-riso .bgl{opacity:.5;mix-blend-mode:multiply;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")}
.t-riso nav{font-family:"Space Mono","Noto Sans TC",monospace;color:#5E5B55;font-weight:700} .t-riso nav .on{color:#161514}
.t-riso .ttl{left:140px;top:138px;padding:10px 26px;background:#161514;color:#E9E5DA;font:700 26px/1.3 "Noto Sans TC",sans-serif;letter-spacing:.04em}
.t-riso .key{left:140px;top:236px;width:930px;height:392px;padding:44px 56px;border:3px solid #161514;background:#E9E5DA;
  font:900 116px/1.26 "Noto Sans TC",sans-serif}
.t-riso .key em{color:#C2185B}
.t-riso .deco i:nth-child(1){left:152px;top:248px;width:930px;height:392px;background:#FF4FA3;z-index:0}
.t-riso .deco i:nth-child(2){left:1560px;top:800px;width:360px;height:280px;z-index:0;background:radial-gradient(circle,#2B3BD0 34%,transparent 36%) 0 0/22px 22px}
.t-riso .f1{left:1210px;top:176px;width:400px;height:400px;border-radius:50%;background:#2B3BD0;color:#E9E5DA;rotate:-8deg;
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.t-riso .f1 b{font:400 168px/1 "Anton",sans-serif} .t-riso .f1 span{margin-top:8px;max-width:250px;font:700 24px/1.4 "Noto Sans TC",sans-serif}
.t-riso .f2{left:1400px;top:596px;width:360px;padding:22px 30px;border:3px solid #161514;background:#E9E5DA;rotate:5deg}
.t-riso .f2 b{font:400 100px/1 "Anton",sans-serif} .t-riso .f2 span{margin-top:8px;font:700 22px/1.4 "Noto Sans TC",sans-serif}
.t-riso .deco i:nth-child(3){left:1412px;top:608px;width:360px;height:178px;background:#FF4FA3;rotate:5deg;z-index:0}
.t-riso .st{left:140px;top:694px;width:1010px}
.t-riso .st li{display:grid;grid-template-columns:96px 1fr auto;align-items:center;padding:16px 0;border-top:3px solid #161514}
.t-riso .st li:last-child{border-bottom:3px solid #161514}
.t-riso .st i{font:400 46px/1 "Anton",sans-serif;color:#C2185B}
.t-riso .st span{font:900 44px/1.25 "Noto Sans TC",sans-serif}
.t-riso .st li::after{content:"每天";padding:2px 12px;border:2px solid #161514;font:700 20px/1.5 "Space Mono","Noto Sans TC",monospace}

/* ---------------------------------------------------------------- 08 geo 幾何構成 */
.t-geo{background:#F1EEE4;color:#13151B;font-family:"Noto Sans TC",sans-serif}
.t-geo .deco{z-index:0}
.t-geo .deco i:nth-child(1){left:1114px;top:0;width:806px;height:420px;background:#172A6E;overflow:hidden}
.t-geo .deco i:nth-child(1)::before{content:"";position:absolute;left:0;bottom:0;width:300px;height:300px;border-radius:0 300px 0 0;background:#C8301B}
.t-geo .deco i:nth-child(1)::after{content:"";position:absolute;left:560px;top:-40px;width:460px;height:460px;border-radius:50%;background:#F2A71B}
.t-geo .deco i:nth-child(2){left:1114px;top:420px;width:403px;height:290px;background:#C8301B}
.t-geo .deco i:nth-child(3){left:1517px;top:420px;width:403px;height:290px;background:#F2A71B}
.t-geo .deco i:nth-child(4){left:1114px;top:710px;width:403px;height:370px;background:repeating-linear-gradient(90deg,#0A8F78 0 31px,#F1EEE4 31px 62px)}
.t-geo .deco i:nth-child(5){left:1517px;top:710px;width:403px;height:370px;background:#172A6E;clip-path:polygon(0 100%,100% 0,100% 100%)}
.t-geo .deco i:nth-child(6){left:140px;top:206px;width:76px;height:8px;background:#C8301B}
.t-geo nav{font:500 22px/1 "Jost","Noto Sans TC",sans-serif;letter-spacing:.06em;color:#5A5C63} .t-geo nav .on{color:#13151B}
.t-geo .ttl{left:140px;top:150px;font:700 32px/1.2 "Noto Sans TC",sans-serif}
.t-geo .key{left:140px;top:262px;width:920px;font:900 116px/1.22 "Jost","Noto Sans TC",sans-serif}
.t-geo .key em{color:#B92A16}
.t-geo .fig{width:403px;height:290px;padding:44px 44px 0}
.t-geo .fig b{font:700 132px/1 "Jost",sans-serif} .t-geo .fig span{margin-top:14px;font:500 26px/1.45 "Noto Sans TC",sans-serif}
.t-geo .f1{left:1114px;top:420px;color:#F1EEE4} .t-geo .f2{left:1517px;top:420px;color:#13151B} .t-geo .f2 b{font-size:104px;padding-top:14px}
.t-geo .st{left:140px;top:764px;width:920px;display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.t-geo .st i{display:grid;place-items:center;width:76px;height:76px;background:#172A6E;color:#F1EEE4;font:700 30px/1 "Jost",sans-serif;margin-bottom:22px}
.t-geo .st li:nth-child(2) i{background:#C8301B} .t-geo .st li:nth-child(3) i{background:#0A8F78}
.t-geo .st span{font:900 42px/1.25 "Noto Sans TC",sans-serif}

/* ---------------------------------------------------------------- 09 pop 普普貼紙 */
.t-pop{background:#FFF3DF;color:#151313;font-family:"Noto Sans TC",sans-serif}
.t-pop nav{font:500 22px/1 "DM Mono","Noto Sans TC",monospace;color:#5F5850} .t-pop nav .on{color:#151313}
.t-pop .ttl{left:140px;top:136px;padding:8px 28px;border:3px solid #151313;border-radius:99px;background:#FFD23F;box-shadow:5px 5px 0 #151313;font:700 26px/1.4 "Noto Sans TC",sans-serif}
.t-pop .key{left:140px;top:250px;width:960px;height:408px;padding:54px 66px;background:#FFFCF6;border:4px solid #151313;border-radius:36px;
  box-shadow:14px 14px 0 #151313;rotate:-2deg;font:900 112px/1.24 "Gabarito","Noto Sans TC",sans-serif}
.t-pop .key em{color:#2952F0}
.t-pop .f1{left:1210px;top:400px;width:570px;height:760px;padding:118px 56px 0;background:#2952F0;color:#FFFCF6;border:4px solid #151313;border-radius:48px;box-shadow:16px 16px 0 #151313}
.t-pop .f1 b{font:900 230px/1 "Gabarito",sans-serif} .t-pop .f1 span{margin-top:20px;font:700 32px/1.45 "Noto Sans TC",sans-serif}
.t-pop .f2{left:1330px;top:150px;width:320px;height:320px;border-radius:50%;background:#FFD23F;border:4px solid #151313;box-shadow:8px 8px 0 #151313;rotate:7deg;
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;z-index:3}
.t-pop .f2 b{font:900 84px/1 "Gabarito",sans-serif} .t-pop .f2 span{margin-top:8px;max-width:210px;font:700 20px/1.4 "Noto Sans TC",sans-serif}
.t-pop .deco i:nth-child(1){left:1716px;top:226px;width:64px;height:64px;background:#7EDDB0;border:3px solid #151313;rotate:45deg;box-shadow:4px 4px 0 #151313}
.t-pop .deco i:nth-child(2){left:1146px;top:196px;width:44px;height:44px;border-radius:50%;background:#FFB0D0;border:3px solid #151313}
.t-pop .st{left:140px;top:762px;width:1010px;display:flex;flex-wrap:wrap;gap:26px 28px}
.t-pop .st li{display:flex;align-items:center;gap:16px;padding:14px 34px;border:3px solid #151313;border-radius:99px;background:#FFFCF6;box-shadow:6px 6px 0 #151313;
  font:900 42px/1.3 "Noto Sans TC",sans-serif}
.t-pop .st li:nth-child(1){background:#7EDDB0} .t-pop .st li:nth-child(2){background:#FFB0D0;rotate:-1.5deg}
.t-pop .st i{font:500 22px/1 "DM Mono",monospace}

/* ---------------------------------------------------------------- 10 blueprint 藍圖 */
.t-blueprint{background:#0F3B68;color:#EAF3FF;font-family:"Noto Sans TC",sans-serif;--panel:#0B3058;--ln:rgba(234,243,255,.5)}
.t-blueprint .bgl{background:radial-gradient(circle,rgba(234,243,255,.22) 1.5px,transparent 2px) 0 0/32px 32px}
.t-blueprint nav{left:128px;top:48px;padding:14px 26px 0;height:50px;background:var(--panel);border:1px solid var(--ln);font:500 22px/1 "JetBrains Mono","Noto Sans TC",monospace;color:#A9C2E2}
.t-blueprint nav .on{color:#EAF3FF}
.t-blueprint .ttl{left:128px;top:144px;padding:14px 26px;background:var(--panel);border:1px solid var(--ln);font:500 26px/1.3 "JetBrains Mono","Noto Sans TC",monospace}
.t-blueprint .ttl::before{content:"FIG. 01 ／ ";color:#FFD27A}
.t-blueprint .key{left:128px;top:256px;width:960px;height:384px;padding:50px 58px;background:var(--panel);border:1px solid var(--ln);font:500 106px/1.3 "Noto Sans TC",sans-serif}
.t-blueprint .key em{color:#FFD27A}
.t-blueprint .deco i:nth-child(1){left:112px;top:240px;width:32px;height:32px;border-left:2px solid #FFD27A;border-top:2px solid #FFD27A}
.t-blueprint .deco i:nth-child(2){left:1072px;top:624px;width:32px;height:32px;border-right:2px solid #FFD27A;border-bottom:2px solid #FFD27A}
.t-blueprint .fig{left:1216px;width:576px;padding:30px 40px;background:var(--panel);border:1px solid var(--ln)}
.t-blueprint .fig b{font:700 124px/1 "JetBrains Mono",monospace;letter-spacing:-.04em} .t-blueprint .fig span{margin-top:12px;font-size:26px;color:#C6D8EE}
.t-blueprint .f1{top:144px;height:256px} .t-blueprint .f2{top:448px;height:192px} .t-blueprint .f2 b{font-size:84px}
.t-blueprint .deco i:nth-child(3){left:1216px;top:422px;width:576px;height:2px;background:#EAF3FF}
.t-blueprint .deco i:nth-child(3)::before,.t-blueprint .deco i:nth-child(3)::after{content:"";position:absolute;top:-9px;width:2px;height:20px;background:#EAF3FF}
.t-blueprint .deco i:nth-child(3)::after{right:0}
.t-blueprint .deco i:nth-child(4){left:0;right:0;bottom:0;height:16px;background:repeating-linear-gradient(90deg,rgba(234,243,255,.55) 0 2px,transparent 2px 64px)}
.t-blueprint .st{left:128px;top:752px;width:1664px;display:grid;grid-template-columns:repeat(3,1fr);gap:112px}
.t-blueprint .st li{position:relative;display:flex;align-items:center;gap:22px;padding:30px 34px;background:var(--panel);border:1px solid var(--ln);font:500 44px/1.3 "Noto Sans TC",sans-serif}
.t-blueprint .st li:nth-child(2){translate:0 -32px;border-color:#FFD27A}
.t-blueprint .st li:not(:last-child)::after{content:"";position:absolute;left:calc(100% + 16px);top:50%;width:80px;height:2px;background:#EAF3FF}
.t-blueprint .st i{flex:none;display:grid;place-items:center;width:52px;height:52px;border-radius:50%;border:2px solid #FFD27A;color:#FFD27A;font:500 20px/1 "JetBrains Mono",monospace}
'''

PAGE = '''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>風格樣張板</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{fonts}" rel="stylesheet">
<style>{css}</style></head><body>
<header><h1>風格樣張板：10 個風格系統</h1>
<p>同一頁虛構內容（一句重點、兩個數字、三個步驟），每個風格用自己的背景、元素和排法畫一次。這是用來定調的草樣：看「這個風格的世界」對不對，不是完成的版型。每個風格之後會替每種內容結構各設計 3–5 種排法。</p></header>
<div class="board">
{tiles}
</div>
<script>
document.querySelectorAll('.frame').forEach(f=>{{const s=f.firstElementChild;const fit=()=>s.style.transform='scale('+(f.clientWidth/1920)+')';fit();addEventListener('resize',fit);}});
</script>
</body></html>
'''

if __name__ == "__main__":
    tiles = "\n".join(TILE.format(id=i, zh=zh, tone=t, what=w, use=u, n=n) for n, (i, zh, t, w, u) in enumerate(STYLES, 1))
    out = Path(__file__).resolve().parent / "board.html"
    out.write_text(PAGE.format(fonts=FONTS, css=CSS, tiles=tiles), encoding="utf-8")
    print(f"已輸出：{out}")
