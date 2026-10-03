# The Diary of Marie-Antoinette

A scroll-driven walk through Versailles in Marie-Antoinette's footsteps — the Royal Gate,
the Hall of Mirrors, her bedchamber, the gardens and the Queen's Hamlet — painted in ink and
watercolour. Scroll down to walk forward, scroll up to walk back.

**Live site:** https://mellymarcelia.github.io/versailles-scroll/ · **Repository:** _this repo_

## How it works
- **One pre-rendered film** (5 scenes + 4 transitions, ~38 s, 1080p; 720p on phones) is scrubbed by scroll
  position: `scroll progress → point on the film's timeline → video.currentTime` (`app.js`).
- **Seamless transitions:** each transition was generated with Seedance 2.5 keyframes — its
  first frame is the *actual last frame* of the previous scene clip and its last frame is the
  *actual first frame* of the next one, so every seam is frame-matched.
- **Smooth scrubbing:** the film is fetched as a Blob (always seekable), encoded with a short
  keyframe interval (GOP 6), and seeks are smoothed and coalesced on every animation frame.
- **Sound:** the clips' generated audio is removed; one continuous soundtrack plays under the
  whole page (opt-in via the sound button), so audio never cuts at a seam. Scroll-synced sound effects (gate, doors, window, chandeliers, trees) are triggered by the film timeline with Web Audio.
- **Fallbacks:** `prefers-reduced-motion` shows the five scene paintings as cross-fading stills;
  a VP9 WebM is served to browsers without H.264.

## Project files
| File | Purpose |
|---|---|
| `index.html`, `style.css`, `app.js` | The website and scroll-scrub engine |
| `PLAN.md` | Step 1: research, concept, visual direction, technical plan |
| `prompts/prompts.md` | Style block and every image/video prompt used |
| `PROCESS.md` | Production log: workflow, decisions, credits |
| `scripts/build-media.sh` | Encode the film for scrubbing, extract posters, prepare music |
| `scripts/frames.sh`, `scripts/seamcheck.sh` | Extract seam frames / measure seams |
| `scripts/qa.py` | Playwright test: scrolls forward and backward, checks timeline + overlays |

## Run locally
```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Tools
Built in **Claude** connected to the **Magnific MCP** (instead of Codex): planning, prompt writing, image/video/music/sound generation, ffmpeg processing and the website code. All creative decisions (story, style, scenes, camera, typography, sound) were made and reviewed by me.

## Credits
Concept, art direction and build: Melly Marcelia. Images, film and music generated with
Magnific (Nano Banana 2, Ideogram 4.5, Seedance 2.5, Lyria 3 Pro) via the Magnific MCP.
Scroll technique adapted from [oso95/scroll-world](https://github.com/oso95/scroll-world).
Style inspired by fashion illustrators @beezoonu and @audrey.aan.

## Publish on GitHub Pages
1. Push this repository to GitHub.
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   branch `main`, folder `/ (root)` → **Save**.
3. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.
   Put that link at the top of this README.
