# Vincentwei1021/video-shotcraft: competitor deep-dive

> Subagent report, 2026-11-11. Studied at commit `3ac67b75dd0b3bc2fd807c17f6b7ce35373eef3d`. Paths are relative to the repo root. SKILL.md and all of `references/` are written in Chinese; only the README comes in five languages.

**1. Metadata**
- 18,553 stars, 1,754 forks, 3 open issues. Created 2026-07-19 (about 2 months before lemo-opuscar). Last push 2026-11-09.
- TypeScript, Apache-2.0. Topics include claude-code-skills, codex, remotion, product-video.

**2. Positioning**
- "Make a promo for my product": the agent captures your real pages, picks shot recipes, animates them in Remotion and delivers an MP4 you can keep editing. "Not a video generator" (`README.md`).
- Target: makers of web/desktop products wanting launch or promo films; SKILL.md says the current focus is web and desktop product promos.

**3. How it works**
- Remotion 4.0.484 + React 19 (`template/package.json`), optional three.js / react-three-fiber. Page capture with Puppeteer and ffmpeg; BGM beat analysis with librosa via uv.
- Install: give the agent the repo link, `npx skills add`, or symlink into `~/.claude/skills` / `~/.codex/skills`. `.claude-plugin/plugin.json` exists.
- Three modes after a read-only product check (`SKILL.md`): Ink Press template swap (`template/TEMPLATE.md`); autonomous free creation (`references/pipeline.md`, 8 stages); guided co-creation with sign-offs (`references/guided-free-creation.md`). Plus a single-shot mode.
- The agent reads a recipe card, then copies tuned demo source (`demos/<cat>/<card>/*.tsx`, 226 TSX files). Components in `assets/lib/` are copied too (PageCam 2.5D camera, Caption, FlashCut, DigitRoll).
- Deterministic rendering: no `Date.now()` or `Math.random()`, seeded pseudo-randomness (`SKILL.md` rule 9).

**4. Content scope**
- 124 recipe cards, 150 shot variants, 10 categories: opening, camera, transition, typography, UI entrance, interaction, data, effects, rhythm, outro (`gallery/api/library.json`; `references/shots/`).
- 1 complete template film (Ink Press, 36.2 s) and 1 sequence skeleton (`references/sequences/promo-energy-arc.md`).
- 8 colour palettes (`template/src/themes/palettes.json`).
- 1920×1080 at 30 fps; vertical 9:16 not built in (`references/publish-upload-post.md:33`).
- Motion vocabulary cards, not whole-film "styles".

**5. Audio**
- No TTS or voiceover pipeline (no Kokoro, edge-tts or Whisper in docs); narration is left to sibling video-talkcraft.
- BGM: 5 bundled Mixkit tracks (`assets/audio/bgm/`). Beat sync: librosa grid fit and kick/snare/hihat classification, post-render cut error ≤3 frames (`references/music-beat-sync.md`).
- SFX: searched and downloaded per project from Freesound via a stdlib CLI, no API key, CC0 by default with a credits manifest (`assets/scripts/sfx-source.py`, `references/sfx-sourcing.md`).
- No LUFS normalisation; docs say their measurements are not LUFS (`references/sound-design.md:77`).
- Films with BGM are delivered in two versions, with and without BGM.
- Captions burned in by a Remotion component; no SRT/VTT except in the JianYing export.

**6. Workflow and quality controls**
- Brief and decision table → up to 3 text directions → HTML styleframe checked by screenshot → feature-to-shot map → storyboard → capture → per-shot `remotion still` self-checks → sound → final QA (`references/pipeline.md`).
- Mandatory final QA by a clean-context subagent writing a P/F/V/S/B/D/A/Q checklist with frame-number evidence (`references/final-review.md`).
- Case-law style aesthetics rulebook (`references/aesthetic-rules.md`).
- CI runs tsc on all demos, vitest and a smoke render (`.github/workflows/pr-checks.yml`).

**7. Customization**
- Visual tokens must come from the product's own design system (`SKILL.md` rule 2).
- Motion Workbench: CapCut-style browser editor (Vite + Remotion Player) with shot, caption and SFX tracks; edit copy, colour, size, retime, swap shots, export (`workbench/`, `references/workbench.md`).
- Optional exports: JianYing draft (`jianying-export/`), Upload-Post social publishing (`publish/`).
- Remotion source of every film is delivered. No "fork a style into my styles".

**8. Compatibility**
- Claude Code and Codex (`agents/openai.yaml`). No specific model named.

**9. Requirements and cost**
- Node/npm, ffmpeg/ffprobe, uv (beat analysis only), Puppeteer; Remotion downloads its own headless Chrome.
- No API keys required; optional `UPLOAD_POST_API_KEY`.
- README says companies may need a paid Remotion licence; SKILL.md has the agent repeat this for commercial use.

**10. Licensing**
- Code and docs Apache-2.0.
- Freesound audio keeps per-file licences; BGM under Mixkit free licence, one track untraceable (`assets/audio/ATTRIBUTION.md`); several template SFX "source unverified" (`template/public/audio/ATTRIBUTION.md`).
- Cards re-implement techniques studied in brand promos (ClickUp, Notion, Figma…) and personal Douyin/X posts, explicitly without permission (`references/shots/ATTRIBUTION.md`).

**11. Strengths vs. lemo-opuscar**
- ~1.27x the stars and an earlier start; far larger motion library with live Gallery; Workbench editor, JianYing export, social publishing; real product screenshots styled from the product's design; beat-sync method, mandatory independent review subagent, CI; Codex support; five README languages and an AtomGit mirror for mainland China.

**Weaknesses vs. lemo-opuscar**
- No voiceover/TTS/Whisper check; no procedural score (5 stock tracks); no LUFS mastering; product promos only, landscape only; no whole-film style system or user-forkable styles; Remotion commercial licence exposure; unclear audio provenance; README sponsor/affiliate blocks, and the skill asks users to credit the author and submit to a showcase after every delivery.

**Sibling repos (same author, all Remotion-based)**
- video-talkcraft (~2.3k): voiceover-driven explainers, word-level sync, 109 motion cards.
- anything2explainer (~3.2k): "topic in, narrated explainer out", with TTS, subtitles and chapter bar; going by its description, probably closer to lemo-opuscar's topic-to-film pitch than video-shotcraft.

**12. Same-nature fit: 3/5.** Same kind of thing (Claude Code skill, finished film fully in code, no generative video, QA loops), but takes a product and its screenshots rather than a topic, has no narration, and offers a motion-recipe library instead of complete film styles.
