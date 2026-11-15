# SIGNAL VAULT

[![Make.fun](https://make.fun/badge/threejs-fps-02.svg)](https://make.fun/bounty/threejs-fps-02)
[![Make.fun rank](https://make.fun/badge/threejs-fps-02/quipmontek/signal-vault-fps-20261115/rank.svg)](https://make.fun/bounty/threejs-fps-02/leaderboard)
[![Make.fun reward](https://make.fun/badge/threejs-fps-02/quipmontek/signal-vault-fps-20261115/reward.svg)](https://make.fun/bounty/threejs-fps-02)

An original offline 3v3 tactical FPS: teal **WAVE** versus amber **STATIC** in
**Facility 09 / The Resonance Well**. Procedural architecture, characters, weapons,
canvas signage and synthesized audio; no paid or downloaded art assets.

## Play locally

Requires Node **22.18+** and desktop Chrome/Chromium with WebGL2.

```sh
node serve.ts
```

Open **http://127.0.0.1:8080**, then click **ENTER THE WELL**. The server binds only
to loopback. Alternatively, serve `game/` with any static HTTP server. Do not open
the HTML with `file://`; browser ES modules need HTTP. No install/build step.

| Control | Action |
| --- | --- |
| WASD / mouse | Move / look |
| Left / right mouse | Fire / aim down sights |
| R | Reload |
| Ctrl or C / Shift / Space | Crouch / walk / jump |
| E (hold, stationary) | Upload for 3 seconds / purge for 5 seconds |
| G | Throw an EMP smoke/slow field |
| B / 1–5 in armory | Armory / purchase |
| Q | Order the attacking squad toward the other relay, before upload |
| Tab / Escape | Squad roster / pause and release mouse |

## Rules

- Three routes connect two spawn areas to two relay sites. You have two allied bots
  against three opponents. Both sites can be used by the player; Q changes the bot goal.
- Ten-second preparation, 85-second live round, five-second intermission.
- Attackers upload and defend for 28 seconds. Defenders purge or run down the
  unarmed clock. Elimination wins before upload; an armed relay keeps running after
  the attacking squad dies. Eliminating all defenders secures an armed relay.
- First to five rounds. Attack/defense swaps every four rounds. Escape and the
  entry button restart a finished match.
- Round rewards, elimination/upload bonuses, three weapons, armor and EMP purchases.
  A selected weapon persists between rounds, with ammunition refilled and base armor.
- The armory and Escape pause this offline game; this is not multiplayer.

## Architecture

- `game/src/data.js`: shared map solids, routes, weapon balance, seeded RNG.
- `game/src/sim.js`: renderer-independent 60 Hz simulation, ray-box damage/occlusion,
  acceleration/collision, economy, objective, round flow, bots and grid navigation.
- `game/src/world.js`: procedural facility, lights and signage.
- `game/src/render.js`: Three.js view, actors, weapon, pooled traces and EMP meshes.
- `game/src/ui.js`: HUD, radar, roster and armory.
- `game/src/audio.js`: synthesized sound feedback.
- `game/src/main.js`: pointer lock, inputs, fixed-step accumulator and capture setup.
- `main.ts`: deterministic output producer using the unchanged official helper.

Three.js **0.187.0** and `vendor/makefun-threejs.ts` match the official kit hashes.
The game uses one local import map and no CDN, remote fonts, telemetry or network API.
Three.js attribution is in `game/THREE-LICENSE.txt`; original work is MIT licensed.

## Tests and output

```sh
node --test tests/*.test.mjs
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The test suite creates `out-a/` and `out-b/`, compares their complete manifests and
rebuilds the dossier byte-for-byte. It also checks kit hashes, syntax, limits and
JPEG dimensions. See `TESTING.md` for scope and limitations.

Optional browser smoke test / screenshot regeneration, with the server running:

```sh
python tests/browser.py
```

This developer-only script requires Python Playwright and `/usr/bin/chromium`.
In the build environment the interpreter is `/opt/manus/python/bin/python`.
The game and producer do not depend on Python or Playwright.

`screenshots/` contains four unedited 1280×720 browser JPEGs. Capture URLs
`?shot=combat`, `?shot=well`, `?shot=relay`, `?shot=armory` stage deterministic game
states, then draw the normal game renderer/HUD; they are not live-match records or
composites. The lexically first screenshot is the cover. `?seed=123` sets a live seed.

## Delivery status

This is a **local candidate**, not a submitted entry. No remote repository, push,
deployment, login, wallet creation, payment or submission has been performed.
The official gate, transcript validity and rank can only be established by the
competition's tools/server, not by this project's regression tests.

The genuine OpenCode session can be packaged with the kit CLI's native database
discovery. A local bundle and check results are kept under ignored `artifacts/`.
No transcript records are manually authored or rewritten. A source-bundle init
anchor was not established before coding; no freshness or ownership claim is made.
