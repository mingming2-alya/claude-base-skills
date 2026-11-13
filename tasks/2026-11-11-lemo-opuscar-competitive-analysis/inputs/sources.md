# 外部來源

所有 repo 都是 `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1` 的唯讀 clone，沒有執行其中任何程式。clone 本身不放進這個 repo，下表的 commit SHA 可以用來重現研究時的版本。

## 研究的 repo 與版本

| Repo | 研究時的 commit | 該 commit 時間 |
|---|---|---|
| [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | `9eb7739a0fca4c6990fe966cb8b87b1930f7193a` | 2026-11-10 12:28 +1100 |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | `5073100b7d8e45f57150dc0a592ce42e4b73d111` | 2026-11-11 05:40 +0000 |
| [OpenMontageInc/OpenMontage](https://github.com/OpenMontageInc/OpenMontage) | `fecb9a1e3cc23ef84de30b272059457a427f16f8` | 2026-11-08 22:23 -0800 |
| [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | `3ac67b75dd0b3bc2fd807c17f6b7ce35373eef3d` | 2026-11-09 23:59 +0800 |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | `1af7e69a2a613437d46095924057970a6a7df40d` | 2026-11-09 10:11 +0100 |
| [openfilm/openfilm](https://github.com/openfilm/openfilm) | `758b1a3888819bf191db191f690c4ca2fcb292af` | 2026-11-10 03:18 +0800 |

## lemo-opuscar 讀過的檔案

`README.md`、`plugin/skills/lemo-opuscar/SKILL.md`、`plugin/skills/lemo-opuscar/scripts/setup.sh`、`AGENTS.md`、`CLAUDE.md`、`DIRECTOR.md`、`TECHNIQUE.md`（前 80 行）、`MY-STYLES.md`（前 40 行）、`MAINTAINING.md`（前 30 行）、`core/README.md`（前 30 行）、`styles/watercolor/STYLE.md`（前 60 行）、`styles/watercolor/style.json`、`.claude-plugin/marketplace.json`、`plugin/.claude-plugin/plugin.json`、`package.json`、`requirements*.txt`。

## GitHub 搜尋查詢（`gh api -X GET search/repositories`，依星數排序）

第一批：

1. `claude skill video in:name,description,readme`
2. `agent skill video generation code`
3. `remotion skill claude`
4. `claude code video skill`
5. `SKILL.md video animation`
6. `manim skill claude`
7. `html to video agent`
8. `motion graphics agent skill`

第二批：

9. `repo:lemomo-ai/lemo-opuscar`（取研究對象本身的中繼資料）
10. `hyperframes`
11. `remotion skills in:name`
12. `film style agent`
13. `code-rendered film`
14. `explainer video skill claude`
15. `video agent skill styles`
16. `awesome claude video skills`

另外用 `repo:<owner>/<name>` 逐一查了 14 個候選 repo 的星數、fork、建立日期、最後推送、語言、授權。

## 中繼資料快照（2026-11-11）

| Repo | ★ | Fork | 建立 | 最後推送 | 語言 | 授權 |
|---|---:|---:|---|---|---|---|
| lemomo-ai/lemo-opuscar | 14,583 | 1,761 | 2026-09-26 | 2026-11-10 | JavaScript | MIT |
| heygen-com/hyperframes | 82,432 | 7,620 | 2026-03-10 | 2026-11-11 | TypeScript | Apache-2.0 |
| OpenMontageInc/OpenMontage | 79,495 | 10,634 | 2026-03-29 | 2026-11-09 | Python | AGPL-3.0 |
| Vincentwei1021/video-shotcraft | 18,555 | 1,754 | 2026-07-19 | 2026-11-09 | TypeScript | Apache-2.0 |
| remotion-dev/skills | 6,811 | 736 | 2026-01-19 | 2026-11-09 | TypeScript | （無） |
| openfilm/openfilm | 5,704 | 542 | 2026-10-04 | 2026-11-09 | TypeScript | MIT |
| nexu-io/html-video | 4,827 | 583 | 2026-05-27 | 2026-06-21 | HTML | Apache-2.0 |
| Vincentwei1021/anything2explainer | 3,212 | 413 | 2026-09-08 | 2026-11-09 | TypeScript | NOASSERTION |
| mromidev/claude-animated-shorts | 2,823 | 613 | 2026-11-01 | 2026-11-01 | TypeScript | MIT |
| Vincentwei1021/video-talkcraft | 2,261 | 230 | 2026-08-22 | 2026-11-09 | HTML | NOASSERTION |
| bangtutorial/bang-motion | 2,021 | 236 | 2026-09-05 | 2026-09-15 | HTML | MIT |
| Tejashmakwana/motionmaxxing | 1,522 | 155 | 2026-10-06 | 2026-10-06 | JavaScript | Apache-2.0 |
| iart-ai/motion-skills | 1,331 | 120 | 2026-06-22 | 2026-10-25 | HTML | MIT |
| BubbleBrainBB/BB-Video | 173 | 34 | 2026-10-05 | 2026-11-06 | JavaScript | MIT |
| instax-dutta/opencode-lemo-opuscar | 2 | 0 | 2026-10-10 | 2026-10-11 | JavaScript | NOASSERTION |
