# Production log

## Step 2 — Test transition (Gate → Transition → Hall, 480p)
- Stills: Nano Banana 2, 4K, 16:9. Gate approved first, then used as a **style reference**
  for every other scene. Exact 16:9 crops made with Magnific's crop tool (start frames
  set the clip's aspect ratio, so they must be exactly 16:9).
- Scene clips: Seedance 2.5, keyframe mode (start frame only), 4–5 s.
- Seam frames: extracted on Magnific with `video_extract_frames` (`"last"` / `0`) — no
  download needed.
- Transition: Seedance 2.5 with **start = previous clip's real last frame** and
  **end = next clip's real first frame**. Result: seams matched; workflow confirmed.
- Change after the test: the gate now starts **closed** (edited still with Ideogram 4.5
  precise edit) and opens as the camera glides in — 5 s instead of 4 s.

## Decisions after review
| Feedback | Change |
|---|---|
| Camera felt like one long straight zoom | Each clip gets its own gentle move inside the clip (tilt, arc, crane, aerial swoop) while every clip still starts and ends in a slow forward drift, so seams stay smooth both ways |
| Add more of Versailles | Fifth scene: the Queen's Hamlet as the finale (max length raised to 40 s) |
| Faded paper border looked unfinished on screen | All five stills repainted full-bleed (Ideogram precise edit); every clip regenerated with "fully painted edge to edge" |
| Audio cut between scenes | Clip audio stripped; one continuous soundtrack (Lyria 3 Pro) under the page |

## Final chain (720p, Seedance 2.5)
Gate 5 s → Staircase transition 4 s → Hall 4 s → Side-door transition 4 s → Bedchamber 4 s
→ Window/crane transition 4 s → Gardens 4 s → Aerial transition 4 s → Hamlet 5 s = **38 s**.

## Credits (Magnific, approximate)
Stills and edits ~2,000 · 480p test + previz chain ~8,900 · 720p final chain ~16,700 ·
music 160 · **total ~28,000**.

## Lessons
- Run `simulate_cost` before every batch; image crops cost 40 credits (AI expand), not 1.
- The style reference works best when the first approved still is passed to every later still.
- Ask for the final look (e.g. full-bleed vs border) before generating video — changing it
  later means regenerating every clip.
