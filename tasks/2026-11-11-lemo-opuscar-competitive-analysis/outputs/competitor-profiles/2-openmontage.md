# OpenMontageInc/OpenMontage: competitor deep-dive

> Subagent report, 2026-11-11. Studied at commit `fecb9a1e3cc23ef84de30b272059457a427f16f8` (2,285 files). Paths are relative to the repo root.

**1. Metadata**
- 79,495 stars, 10,634 forks, 340 open issues.
- Created 2026-03-29; last push 2026-11-09.
- Python, AGPL-3.0.
- Topics include claude, cursor, copilot, remotion, elevenlabs, flux, text-to-video.
- The README's clone and community links point to `calesthio/OpenMontage`, so the repo was probably moved or mirrored.

**2. Positioning**
- Pitch: "the first open-source, agentic video production system. Turn your AI coding assistant into a full video production studio" (`README.md`).
- Target users: creators and marketers making explainers, trailers, social clips, dubs and documentaries through a coding agent.

**3. How it works**
- A whole repo, not a plugin: `git clone`, then `make setup` (pip packages, `npm install` for Remotion, Piper) (`Makefile`). No `plugin.json`.
- The agent orchestrates: reads a YAML manifest (`pipeline_defs/*.yaml`), then a director skill per stage (`skills/pipelines/<p>/<stage>-director.md`), then calls Python `BaseTool` tools (132 tool classes under `tools/`).
- Every pipeline: research → proposal → script → scene_plan → assets → edit → compose (`AGENT_GUIDE.md`).
- Two renderers: Remotion (`remotion-composer/`) and HyperFrames (HTML/GSAP CLI), plus FFmpeg; the agent must offer the user both.
- Two composition modes: "templated" (stock scene types) and "atelier" (hand-written bespoke scenes, default for hero work).
- Backlot: a local FastAPI storyboard and approval board (`backlot/`).

**4. Content scope**
- 13 pipeline YAMLs, one a test smoke pipeline, so 12 real: explainer, animation, character-animation, cinematic, documentary-montage, clip-factory, hybrid, localization-dub, podcast-repurpose, screen-demo, talking-head, avatar-spokesperson. Several marked `beta`.
- Skills: 158 files in `skills/` and 93 third-party skill packs in `.agents/skills`, about 738 `.md` files total ("700+").
- Only 5 YAML style playbooks (`styles/`), plus the Ink Theater doodle style.
- Reference-video cloning ("make something like this YouTube Short").

**5. Audio**
- Voice: Piper TTS free and offline; 15+ cloud voice services (ElevenLabs, Google, OpenAI, Azure, Fish, Cartesia…) via `tools/audio/tts_selector.py`.
- Music: user drop folder (`music_library/`), Pixabay and Freesound search, Suno/ElevenLabs/Lyria/ACE-Step generation (ACE-Step on RunPod). Proposal stage must include a music plan. No procedural music synthesis found.
- SFX: ElevenLabs SFX via MiniCut CLI (`tools/audio/minicut_sfx.py`), mixing guidance in `skills/creative/sound-design.md`.
- Loudness: −14 LUFS is guidance in skill docs, not seen enforced.
- Subtitles: WhisperX transcription, `subtitle_gen`, Remotion word-level captions.

**6. Workflow and quality controls**
- Reviewer meta-skill with "CHAI" critique rules and JSON-schema validation (`skills/meta/reviewer.md`, `schemas/`).
- Human approval gates at proposal, script, scene plan, assets and publish.
- Pre-compose "slideshow risk" check (`lib/slideshow_risk.py`).
- Post-render final review: ffprobe, frame sampling, audio levels (`tools/video/video_compose.py` ~line 1115).
- Append-only decision log; budget caps (default $10) and per-action approval above $0.50 (`tools/cost_tracker.py`).

**7. Customization**
- Custom style playbooks generated into `styles/custom/` (`lib/playbook_generator.py`), schema-checked.
- "taste-direction" skill sets design direction.
- New tools and pipelines by dropping in files.
- No dedicated brand-kit feature.

**8. Agent compatibility**
- `CLAUDE.md`, `AGENTS.md`, `CODEX.md`, `CURSOR.md`, `COPILOT.md`, `.windsurfrules`, `.cursor/rules`, `.codex/prompts`, `.claude/commands`, all pointing to `AGENT_GUIDE.md`. Ollama "coming soon".

**9. Requirements and cost**
- Python 3.10+, Node 22+, FFmpeg. Optional GPU packages for local video models (WAN, Hunyuan) (`requirements-gpu.txt`).
- Generative AI is central: showcase films use Veo, Kling, Seedance; 20+ video and 15+ image generators via fal, Atlas, Runway, HeyGen and others (`.env.example`, `docs/PROVIDERS.md`). Quoted demo costs $1.33 to ~$5 per film.
- Zero-key path: Piper + stock/archive footage + Remotion.

**10. Licensing**
- Code AGPL-3.0 (strong copyleft).
- Ink Theater assets: OFL font and CMU mocap clips (`ink-theater/THIRD_PARTY_NOTICES.md`).
- Third-party skill pack licences vary. Rights to generated/stock output depend on each provider.

**11. Strengths and weaknesses vs. lemo-opuscar**
- Strengths: much broader scope (real footage editing, dubbing, clip extraction, avatars, screen demos); stock/archive footage, web research, reference-video analysis; many agents; heavier governance (approval gates, visual board, cost control); ~5x the stars.
- Weaknesses: only 5 preset styles vs. 66 curated with demos; premium look relies on paid gen-AI and third-party services (variable, costs money); heavy install; no procedural score or foley; no deterministic `render(t)` contract; AGPL limits commercial embedding; not tuned for one model.

**12. Same-nature fit: 3/5.** It turns a topic into a finished, styled film driven by agent skills, and atelier mode resembles code-authored films, but it is a broad, gen-AI-first production platform rather than a curated library of code-rendered film styles.
