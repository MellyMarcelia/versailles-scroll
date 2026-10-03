# Carnet de Versailles — Step 1: Research + Plan

> **Final version vs. this plan.** After the Step 2 test the project grew to
> **5 scenes + 4 transitions (~38 s)**: the Queen's Hamlet was added as the finale, the art
> went **full-bleed** (no paper border), every clip got its own gentle camera move, the text
> became Marie-Antoinette's diary, and the clips' audio was replaced by one continuous
> soundtrack. See `PROCESS.md` for every decision and `README.md` for the final build.

A scroll-driven walk through the Palace of Versailles, drawn as a fashion-illustration
sketchbook. Scroll forward to walk in; scroll back to walk out.

## Subject + purpose

- **Subject:** a visit to the Palace of Versailles — the gate, the Hall of Mirrors,
  Marie Antoinette's bedchamber, and the gardens — as one continuous walk.
- **Audience:** 18–30-year-olds who follow illustration, fashion and "Marie Antoinette
  aesthetic" content, and who think of Versailles as a history lesson rather than a place
  to wander.
- **Core message:** Versailles is a place to daydream in, not just to read about. The walk
  ends with an invitation to plan a visit.

## Research

### Reference: oso95/scroll-world
- Scroll position drives `video.currentTime`; the camera motion is pre-rendered.
- Chain = one clip per scene + connector clips between scenes.
- **Seam rule:** a connector's start frame = the *actual last frame* of the previous
  rendered clip; its end frame = the *actual first frame* of the next. Never the stills.
- Clips are fetched as Blobs so they are always seekable, even on hosts without byte-range
  support. A short crossfade at each seam hides leftover drift.
- Encoding: native resolution, `crf 20`, GOP 8, no audio, `+faststart`, light `unsharp`.
- Warning carried over: a camera that dives in and then pulls back out *reverses direction
  at every seam*. That reads as playful in a toy diorama but as a rewind in a real
  building, so this project uses forward-only motion (see Camera).

### Other scroll-driven sites studied

**1. Emergence** — [emergenceprojects.com](https://emergenceprojects.com)
- *What it is:* the site of an art/design studio, built as one illustrated scene: two robed
  figures in a tiled, Moorish-style room in fine black-and-white engraving style, with
  stars and orbs hanging from the ceiling.
- *Scroll:* the page itself does not move. Each scroll tick pushes the camera deeper into the
  picture: the figures slide out of frame, the arch fills the screen and the floating
  objects drift apart. It is made of dozens of layered images (no video, no 3D).
- *Text and cue:* one line only, "Play is what turns everyday life into a fairy tale", with a
  small scroll indicator under it.
- *Ending:* the floating objects become the menu (story, projects, shop, about) — the
  navigation grows out of the world instead of sitting on top of it.
- *What I took:* proof that an **illustrated, fairy-tale world** works as a scroll experience;
  one short poetic line per moment; the camera pushes *into* the drawing.

**2. Montfort Group** — [mont-fort.com](https://mont-fort.com)
- *What it is:* a commodity trading and investment group.
- *Scroll:* opens on a snowy mountain peak above the clouds with the logo; scrolling sinks the
  camera into the clouds, and each business division appears out of the fog (e.g. an oil
  tanker at sea for Montfort Trading). Built with WebGL canvases.
- *Transitions:* clouds are the connecting tissue between very different scenes, so the
  journey never cuts.
- *Text and cue:* a clear "Swipe down" cue with an arrow at the bottom of the first screen;
  large uppercase statements appear between scenes; up/down arrow buttons on the right.
- *What I took:* every change of place needs a **connecting move** (mine: gate → doors →
  staircase, window → sky → garden); a bottom-of-screen scroll cue on the opening view.

**3. Son Daven** — [sondaven.com/en](https://sondaven.com/en)
- *What it is:* an investment site for a design resort hotel in the Ukrainian Carpathians.
- *Scroll:* long, smooth-scrolled page (Lenis smooth scrolling, about 35 screen heights) with
  many small WebGL canvases for image effects and looping videos; it opens with a short
  looping animation while it loads.
- *Text:* it tells a story before it sells — a "Prologue" in poetic language ("where the wind
  becomes a voice…") and "Where the mountains speak", then local legends and places.
- *Ending:* practical — invest, download the PDF, consultation and contact form.
- *What I took:* **story first, information after** — my diary entries carry the emotion,
  and the practical "Plan your visit" comes only at the very end; a loading moment that
  already belongs to the world ("Opening the notebook…").

**4. Made in Evolve** — [madeinevolve.com](https://madeinevolve.com)
- *What it is:* an eCommerce/Shopify Plus agency in Modena, Italy.
- *Scroll:* a conventional page made to feel premium: smooth scrolling (Lenis), a very large
  headline split line by line ("We are an / eCommerce / Innovation / Agency"), case studies
  revealed as you scroll, a showreel video and a sticky menu.
- *Ending:* newsletter sign-up, press, contact.
- *What I took:* a useful **contrast** — scroll can also just reveal content. My project is the
  other approach (scroll *is* the camera), but I borrowed the restraint: large confident
  type, very few words on screen, and controls (rail, sound button) kept small.

**5. Igloo Inc** — [igloo.inc](https://www.igloo.inc) (Awwwards Site of the Year 2024)
- *What it is:* the site of a Web3 company and its portfolio.
- *Scroll:* a real-time 3D world. An intro animation flows straight into the main scene, and
  the camera travels through an icy landscape in three sections; each portfolio project is a
  procedurally grown ice crystal.
- *Transitions:* changes of area are hidden with frost, chromatic aberration and "glitch"
  effects, so the world feels continuous. Music and sound effects react to what happens.
- *Ending:* an interactive particle footer that reshapes for each link.
- *What I took:* **sound makes a world physical** (my gate creak, doors, chandeliers and
  trees), and transitions must never show a cut — I solve that by frame-matching my clips
  rather than with effects.

### Summary of what I took
| Question | Answer for my project |
|---|---|
| How does the visitor know to scroll? | "Scroll to open the gate" with an animated line, bottom centre (like Montfort's "Swipe down"), fading on the first scroll |
| How is text paced? | One short diary line per scene, in a script typeface, shown only while the camera settles (Emergence, Son Daven) |
| How are scenes connected? | Frame-matched transitions with a real connecting move — doors, staircase, window, sky (Montfort, Igloo) |
| What makes it feel like a world? | A single illustrated style throughout (Emergence) and scroll-synced sound (Igloo) |
| How does it end? | The camera comes to rest over the Hamlet: "Her notebook ends here. Yours begins." + Plan your visit / Walk again (Son Daven's story-then-practical ending) |

*Method:* Emergence and Montfort were scrolled in a browser and screenshotted; Son Daven and
Made in Evolve were inspected while loaded (page structure, videos, canvases, smooth-scroll
library); Igloo's WebGL scene was described from the
[Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html).

## The journey — 4 scenes + 3 transitions (~28 s)

| # | Clip | Length | Camera |
|---|---|---|---|
| 1 | The Royal Gate | 4 s | From the cobbled square, glide through the open gilded gate toward the palace. |
| T1 | Gate → Hall | 4 s | Through the palace doors and a gilded corridor to the head of the Hall of Mirrors. |
| 2 | Hall of Mirrors | 4 s | Glide down the gallery: mirrors, chandeliers, garden light. |
| T2 | Hall → Bedchamber | 4 s | Turn through a side door into the Queen's apartments. |
| 3 | Marie Antoinette's Bedchamber | 4 s | Drift past the canopied bed toward the tall window. |
| T3 | Bedchamber → Gardens | 4 s | Through the window, out over the terrace. |
| 4 | The Gardens | 4 s | Rise over the parterres and fountains toward the Grand Canal. Ending + CTA. |

Total 7 × 4 s = 28 s (≈27.5 s after seam crossfades) — inside the 15–30 s brief.

## Visual direction

- **Medium:** fashion-illustration sketchbook — loose fine ink line in warm grey-brown,
  translucent watercolour and marker washes, bare paper left showing, drawings that fade
  into blank textured watercolour paper at the edges.
- **Palette:**
  | Name | Hex | Use |
  |---|---|---|
  | Paper | `#FBF7F2` | Page background, unpainted areas |
  | Ink | `#3A3335` | Line work, body text |
  | Blush | `#F2C6CF` | Main wash, UI accents |
  | Rose | `#D9849B` | Highlights, buttons |
  | Champagne gold | `#CDB27A` | Gilding, gate, frames |
  | Garden sage | `#A9B89A` | Gardens, foliage |
  | Sky wash | `#DCE6EE` | Skies, mirror reflections |
- **Lighting:** soft, diffused daylight; no hard shadows; a pink-gold dawn at the gate,
  turning to clear afternoon over the gardens.
- **Materials:** gilding as champagne-gold wash, mirrors as pale sky-wash, silk as blush
  wash with ink florals, stone as bare paper with a few grey hatches.
- **Mood:** airy, romantic, a little dreamy — a daydream more than a documentary.
- **Typography:** *Cormorant Garamond* italic for headlines (French, courtly) +
  *Jost* for short labels and UI (clean, modern). Text sits on the page, never in the video.
- **Camera style:** one continuous, slow, forward-only walk at eye level. Every clip ends
  in a gentle forward drift and the next one begins with it, so forward and backward
  scrolling both read smoothly.
- **People:** none in the clips — figures change shape between frames and break
  consistency. The world itself is the subject.
- **Style inspiration:** fashion illustrators @beezoonu and @audrey.aan (TikTok) and two
  watercolour street-scene illustrations. Their images are used only as a mood reference;
  they are not fed to any model and not included in this repo.

## Technical plan

- **Stack:** static HTML/CSS + vanilla JS (scrub engine adapted from scroll-world), no
  framework. Hosted on GitHub Pages.
- **Generation:** Magnific MCP inside Codex.
  - Stills: GPT 2.5 or Nano Banana 2, 16:9, 2K. Scene 1 is approved first and then passed
    as a style reference for scenes 2–4.
  - Video: Seedance 2.5 (`bytedance-seedance-pro-2.5`) for all 7 clips, keyframe mode
    (start frame for scenes; start + end frames for transitions). One model only.
- **Seam workflow:** generate scene clips → extract their real first/last frames with
  ffmpeg → generate transitions from those frames → check each seam (PSNR + eyeball).
- **Scroll/playback:** scroll progress → global timeline → (clip, local time); smoothed
  with requestAnimationFrame; clips loaded as Blobs; neighbours preloaded; 2–3-frame
  crossfade at seams; seeks coalesced on mobile.
- **Media:** H.264 MP4, 1280×720, `crf 20`, GOP 8, no audio, `+faststart`; WebP posters
  from each clip's first frame. Target total ≈ 10–15 MB.
- **Target resolution:** 1280×720 native (Seedance 2.5's max). Optional video upscale of
  the 7 final clips only if credits allow.
- **Reduced motion:** `prefers-reduced-motion` → no video; the four scene stills cross-fade
  by section with the same text.
- **Mobile:** same 16:9 clips, centre-cropped (`object-fit: cover`), scenes composed with
  the subject centred.
- **Testing:** Playwright — screenshot either side of each seam, check
  `video.seekable`, scroll forward and backward, reduced-motion mode, phone viewport.

## Budget (Magnific credits, verify with `simulate_cost`)

| Batch | Clips | Seconds | Rate | Estimate |
|---|---|---|---|---|
| Test transition (480p) | Gate, T1, Hall | 12 s | ~200/s | ~2,400 |
| Final chain (720p) | all 7 | 28 s | ~440/s | ~12,300 |
| Stills | 4 + re-rolls | — | ~75/image | ~450 |
