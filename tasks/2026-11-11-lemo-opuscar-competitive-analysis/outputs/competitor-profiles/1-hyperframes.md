# heygen-com/hyperframes: competitor deep-dive

> Subagent report, 2026-11-11. Studied at commit `5073100b7d8e45f57150dc0a592ce42e4b73d111`. Paths are relative to the repo root.

**1. Metadata**
- 82,431 stars, 7,620 forks, 242 open issues.
- Created 2026-03-10; last push 2026-11-11.
- TypeScript, Apache-2.0. Plugin version 0.9.32 (`.claude-plugin/plugin.json`).
- Topics include claude-code, mcp, gsap, puppeteer, html-to-video.
- Contributors: skipped (shallow clone).

**2. Positioning**
- Tagline: "Write HTML. Render video. Built for agents."
- An open-source framework that turns HTML, CSS and seekable animation into deterministic MP4 files.
- Users: developers and AI coding agents. It is also the rendering core behind HeyGen's hosted Studio app, which has a paid Pro plan.
- It presents itself as an HTML alternative to Remotion (README "HyperFrames vs Remotion").

**3. How it works**
- Pipeline: a composition is HTML with `data-start`, `data-duration` and track attributes. Each scene registers a paused GSAP, Lottie, Three.js, Anime.js or WAAPI timeline. Puppeteer seeks headless Chrome frame by frame, then FFmpeg encodes and mixes the audio.
- Monorepo packages: cli, core, engine, producer, studio, player, shader-transitions, aws-lambda, gcp-cloud-run, sdk (`packages/`).
- Install routes: Claude plugin marketplace (`claude plugin marketplace add heygen-com/hyperframes`); `npx skills add` or `npx hyperframes skills update`; CLI `npx hyperframes init/preview/render`; a remote MCP server at `mcp.heygen.com` (`server.json`); desktop Studio app.
- The skills call many CLI verbs: check, snapshot, capture, beats, audio, diff, cloud render (`packages/cli/src/commands/`).

**4. Content scope**
- 9 published skills (`skills/`) plus 6 repo-internal ones (`.claude/skills`).
- The registry has 456 items: 210 blocks, 238 components and 8 examples (`registry/registry.json`): transitions, titles, charts, carousels, code reveals and 3D.
- 13 "frame presets". The skill itself calls them slide-deck looks and says not to use them as a film's default look (`skills/hyperframes/assets/frame-presets`, `references/look.md`).
- 7 film-type guides: launch, explainer, music, data, vertical, 3D, character (`references/types/`).
- 5 "style-sampling" episode templates (Collage, Finance, Kurzgesagt-like Science, 3D Brand, 3D True Crime). They are a paid Pro feature, pulled from the server and not stored in the repo (`skills/style-sampling/SKILL.md`).

**5. Audio**
- Voice: HeyGen Starfish (word timestamps); ElevenLabs with your own key; local Kokoro, 54 voices (`skills/media-use/audio/references/tts.md`). Free plan: 3 minutes of Voice Turbo per month.
- Music: HeyGen catalog of 10k+ tracks (requires sign-in) or a HeyGen-generated track; local fallback Lyria, then MusicGen (`bgm.md`). Writing music in code is explicitly discouraged (`references/sound.md` §3).
- Sound effects: 19 bundled Pixabay files, plus HeyGen and Openverse search.
- Transcription: Parakeet or Whisper. Captions: dedicated reference docs and caption blocks.
- Loudness target: −16 to −14 LUFS, true peak ≤ −1 dBTP, via `normalize-audio` (`sound.md` §5).

**6. Agent workflow and quality controls**
- `story.md`: write 3 storylines; the user picks one, saved as `STORYLINES.md`.
- `SPEC.md` (`spec.md`): every adjective becomes a number, with a BANNED list of default looks and a per-shot list.
- `check --json` lint warns on `line_unread`, `dead_stretch`, `text_below_floor`, `film_silent` and similar.
- `snapshot --review` produces contact sheets, including a 360px phone-width sheet. The agent writes `REVIEW.md` with P0/P1/P2 notes and can hand a fresh review to a sub-agent (`review.md`).
- Determinism contract bans `Date.now()`, unseeded random and network fetches (`SKILL.md` Contract).
- The agent renders only after the user approves the preview.

**7. Customization**
- `frame.md` / `DESIGN.md` brand spec at the project root.
- `capture <url>` pulls a website's brand tokens; Figma tokens via `/figma`.
- Copying a reference film's style ("From a reference" in `look.md`); `/reverse-any-video` rebuilds a video frame by frame (Pro).
- Variables (`data-var-*`) keep copy, colours and media editable; visual editing in Studio.
- Unknown: there is no first-class "fork a style into my styles" library.

**8. Compatibility**
- Claude Code, Codex, Cursor, Gemini CLI, Copilot CLI and VS Code, OpenCode, IBM Bob (`docs/guides/plugins.mdx`, `.codex-plugin`, `.cursor-plugin`, `gemini-extension.json`). Not tied to any one model.

**9. Requirements and cost**
- Node 22+ and FFmpeg. No GPU needed for rendering.
- Free with no key, but HeyGen sign-in is pushed hard for music, assets and voice. Credits pay for generated video and images, avatars and cloned voices. Reverse and style templates need Pro.
- Cloud render through HeyGen; self-hosted options on AWS Lambda and GCP Cloud Run.
- Telemetry on by default, with skill "usage beacons" (opt out with `HYPERFRAMES_NO_TELEMETRY`).

**10. Licensing**
- Code Apache-2.0. Bundled SFX: Pixabay Content License. Parakeet model: CC-BY-4.0.
- Some blocks vendor GSAP under the GSAP Standard License, not OSI open source (`CREDITS.md`).
- Pro templates are proprietary and hosted on HeyGen's server.

**11. Strengths and gaps vs. lemo-opuscar**
- Strengths: ~5.6x the stars; full engine with editor, preview and Studio; 456 reusable blocks; many agents; cloud and distributed rendering; rigorous lint and review tooling; brand ingestion from websites and Figma; avatars and generative media for those who pay; backed by HeyGen.
- Gaps: no free library of finished film styles each with style prompt and demo film (5 style templates are paywalled, 13 presets are deck looks); no procedural score; best voice/music/assets push toward HeyGen sign-in or credits; telemetry; generative AI video is an option, so outputs are not purely code-rendered; broad rather than tuned for one model.

**12. Same-nature fit: 4/5.** Through `/hyperframes` it is an agent skill that turns a topic into a finished, deterministic, code-rendered film, with story and spec planning and an audio mix. It differs in being a general engine plus block catalog rather than a curated, free style library, and in pushing generative media from HeyGen.
