# openfilm/openfilm: competitor deep-dive

> Subagent report, 2026-11-11. Studied at commit `758b1a3888819bf191db191f690c4ca2fcb292af`. Paths are relative to the repo root.

OpenFilm is a general-purpose agent video tool with a full editor. It is not a library of styles, so it competes with lemo-opuscar only in part.

**1. Metadata**
- 5,704 stars, 542 forks, 42 open issues. Created 2026-10-04 (8 days after lemo-opuscar); last push 2026-11-09.
- TypeScript/JavaScript; MIT; npm `openfilm` v0.3.2 (`packages/openfilm/package.json`).
- Topics: ai-video, claude-code, codex, coding-agents, html, motion-graphics, video-agent, video-editor.

**2. Positioning**
- "The open source AI video agent. One HTML file, one function, one real editor" (`README.md`).
- Target: anyone with a coding agent wanting launch films, explainers, ads, social clips, music videos or edits of their own footage (`apps/desktop/src/agent-prompt.md`).

**3. Architecture and rendering**
- A film is a folder with `film.html`; each `<section>` is a track; clips are `<iframe>` pages, `<video>`, `<img>`, `<audio>` with media fragments `#t=` and `at` (`MANUAL.md`, `manual/edit/SKILL.md`).
- Each shot page exposes `window.film.frame(t)` and must draw the same picture for the same t; canvas, WebGL, three.js, SVG, CSS or GSAP. Very close to lemo-opuscar's `render(t)`.
- Rendering: playwright-core + headless Chromium + ffmpeg (`src/render.mjs`); 4K, motion blur, alpha, resume, `--loudness=-14`.
- Install: `npx skills add openfilm/openfilm`; `skills/openfilm/SKILL.md` is a stub that runs `npx openfilm` and follows the printed manual. Three core sub-skills: `edit`, `media`, `canvas` (`packages/openfilm/manual/`). Electron desktop app (`apps/desktop`).

**4. Content scope** (catalogs in `packages/openfilm/library/`)
- 14 templates (brand-intro, how-to, flash-sale, travel-vlog, news-flash…), built around footage placeholders.
- ~136 text animations, ~130 transitions, ~119 effects, ~100 motions, 66 filters, ~100 stickers.
- Community "how to make a kind of film" skills from external `openfilm/skills`; offline seed lists only `replicate` (`skill-catalog-seed.json`). Full community count unknown.

**5. Audio**
- Free CC0 library (`library/audio.json`): 1,222 music tracks tagged with bpm and energy, 5,436 SFX, downloaded on first use from openfilm.dev; 20 SFX bundled.
- No local voice-over: TTS needs a paid service (ElevenLabs, Cartesia, Inworld, Azure, Google, OpenAI); voice catalog of 2,219 voices (`library/voices.json`).
- Local Whisper with word timing, writes WebVTT (`src/local-asr.mjs`).
- Captions are a Studio caption track; manual says never draw subtitles inside a page.
- `get music` / `get sfx` generate audio through paid services.

**6. Workflow and quality controls**
- `openfilm look` (`src/look.mjs`): draws a contact sheet twice in shuffled order to catch non-deterministic pages; reports page errors, failed fonts, missing sounds, text cut off; `look --full` scans for flashes, frozen frames, black; `look --loudness` measures the mix.
- The agent must look before claiming something works.
- No treatment/shot-list/cue-map method; closest is the canvas storyboard layout (`manual/canvas/SKILL.md`).

**7. Customization and editing**
- Studio is a full browser editor: move/restyle elements, edit text, trim, volume and speed, named versions saved with git.
- User edits kept as `overrides` the agent preserves.
- Export to MP4, GIF, stems, subtitles, slides, Final Cut XML, Premiere, DaVinci Resolve, JianYing (`studio/server/fcpxml.mjs`, `nle.mjs`, `jianying.mjs`).
- Custom providers and skills via `openfilm skill add`. No brand-kit feature.

**8. Compatibility**
- Agent-agnostic: Claude Code, Codex, Copilot, Cursor, OpenCode, Qwen, Kimi, MiniMax, DeepSeek, Antigravity, CodeBuddy, plus its own agent on the user's key (`apps/desktop/src/agent-definitions.mjs`).

**9. Requirements and cost**
- Node 22.2+, ffmpeg, git; ~100 MB Chromium downloaded on first run. No account needed to make, edit or render.
- Generative AI optional but built in: image/video generation via fal, OpenRouter (e.g. Seedance), Google, OpenAI; own keys or an OpenFilm account balance (`studio/server/providers/openfilm.mjs`). Pexels and Pixabay stock search.
- The canvas workflow (pictures to video nodes, consistent characters) is built around generative AI.

**10. Licensing**
- Code MIT; name and logo are trademarks (`TRADEMARK.md`).
- Library described as CC0 (`manual/media/SKILL.md`, `src/library-search.mjs`); no per-asset source credits found.

**11. Versus lemo-opuscar**
- Strengths: NLE-style editor shared by person and agent; large CC0 music and SFX library with search in any language; many agents; footage and generative AI integration plus NLE export; automated determinism and visual checker; desktop app with ffmpeg and Chromium included.
- Weaknesses: no curated film styles, style prompts or demo films (14 templates, mostly footage placeholders); no direction method; no free local TTS; no procedural score or foley; only two example films (`examples-index/examples.json`).

**12. Same-nature fit: 3/5.** Same code-rendered `frame(t)` pages, headless Chrome and ffmpeg pipeline, installed as an agent skill, but sold as an editor and asset platform with optional generative AI rather than a curated style library that turns a topic into a directed film.
