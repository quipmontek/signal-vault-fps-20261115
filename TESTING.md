# Local validation and candid quality assessment

## Verified

- WebGL2 context verified before game authoring; final renders use system Chromium.
- `node --test tests/*.test.mjs`: **15 passing tests** (11 simulation + 4 artifact).
- Simulation coverage: economy/weapon/armor purchases and locks; body/head damage;
  wall occlusion; cooldown, ammunition and reload transfer; acceleration, normalized
  movement, crouch, jump and collision; EMP consumption, sight blocking, slowing and
  expiry; player upload/purge interruption; autonomous bot navigation, upload and
  purge; elimination/timeout, intermission, side swap, match win and restart.
- Two 30,000-tick same-seed/input replays have byte-identical complete states.
- Chromium test: entry button and pointer lock; mouse-accessible armory purchase;
  return to play; keyboard movement; mouse firing; reload; grenade; Tab roster;
  Escape pause. No page exceptions, failed observed HTTP responses or external
  requests. All four capture states retain a living first-person player.
- Producer runs twice. Complete output manifests (paths, byte sizes, SHA256)
  match; dossier bytes match a fresh call to the unchanged official `buildDossier`.
- Exact Three.js core/module and helper hashes checked against the kit.
- All game JavaScript passes Node's syntax check; one exact local Three.js import map.
- Four complete JPEGs, each 1280×720 and below 256 KiB; all output/game/dossier
  count and size limits checked. Browser loading verifies the reachable module graph.

Initial final-artifact result: **20 entries, 3,052,376 bytes**, including a
**519,881-byte dossier**. Dossier SHA256:
`ba0faaa7208fbe49a33019da2d2acdeeaf632008bfed2e9dbded4c457e7d272f`.
Regenerating screenshots in another browser/GPU can change image bytes; the producer
is deterministic for the committed game and screenshot files, not across GPU renders.

## Assessment

**Complete playable prototype / local competition candidate.** It implements the
core tactical-FPS loop rather than a decorative mockup: three weapons, recoil and
spread, ammunition, bots, objective, economy, round/match state, HUD and sound. The
teal/amber facility and resonance core are original and visually consistent.

It is not claimed to be tournament-grade or a guaranteed winner. Known limitations:

- Bots use simple sight/hearing memory and BFS lane movement, not sophisticated
  teamwork, utility planning or cover selection. An unattended attacking player
  can leave their team short-handed; balance has not had human playtesting.
- Geometry and character animation are deliberately stylized/blocky. Weapon models
  share a base mesh with size differences; gun handling is more distinct than art.
- Jumping affects eye/shot height but does not let actors vault solid obstacles.
- EMP is an instantaneous forward-projected field, not a bouncing projectile; it
  obscures sight and slows everyone inside, including the thrower and allies.
- This offline game's shop pauses time, including when opened during a live round;
  purchases remain locked outside preparation. There is no networking or persistence.
- The HUD still creates strings and some DOM content per frame. Geometry/materials,
  tracer lines and cloud meshes are prebuilt, but this is not allocation-free code.
- The scene has several hundred draw calls and dynamic shadows. Rendering was tested
  in software WebGL; no hardware FPS/performance target or broad browser support is
  claimed. Audio API execution was exercised, not perceptually auditioned.
- Captures use explicitly staged normal-renderer states. They show the implemented
  mechanics/visuals, not proof of a naturally occurring whole match.

## Competition / provenance boundaries

The sealed scorer and official judge/reference ladder are server-only. These local
tests do not reproduce the official AST reference gate or establish Valid=1/rank.
No source-bundle init/anchor was run before authoring. The current rules describe
freshness fallback as a note, but the exact intake/ownership path still needs checking
before any future entry. No wallet/account has been created and none is assumed.

The kit CLI packages the genuine native OpenCode database for this repository.
The original database is never edited. The CLI may perform its standard redaction
on packaged copies; private harness instructions are truthfully declared withheld.
The recorded session began from an upstream task handoff, so the explicit run record
uses the owner's original words and marks their origin as handed-off. Provider/model
pricing, timestamps and authorship are accepted only if the official check accepts
them; no usage or missing transcript content is invented to make a check pass.
