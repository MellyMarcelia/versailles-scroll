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
| Site | What I took from it |
|---|---|
| Apple AirPods Pro product page | Scroll-scrubbed frame sequence; text appears only while the image holds still. |
| Igloo Inc (igloo.inc) | A whole world behind one scroll; minimal UI chrome, strong progress cues. |
| NYT "Snow Fall" | Pacing long-form story to scroll; text as short beats, not paragraphs. |
| SBS "The Boat" | Illustrated scrollytelling — proof that a drawn world can carry a scroll story. |
| The Pudding (pudding.cool) | Clear "scroll" affordances and a clean ending. |

*(Fill in your own notes after visiting each — scroll cue, text pacing, ending.)*

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
