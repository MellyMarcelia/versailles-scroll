# Prompts — Le Carnet de Marie-Antoinette (final)

Every prompt below is the one actually used for the published film, sound and stills.
All generation ran through the **Magnific MCP**. The early test prompts (paper-border
style, 4 scenes) were replaced after review; see `PROCESS.md` for why.

## Models and settings

| Asset | Model (Magnific slug) | Settings |
|---|---|---|
| Scene stills | Nano Banana 2 (`imagen-nano-banana-2-flash`) | 16:9, 4K, approved gate passed as **style reference** to later stills |
| Still edits (closed gate, full-bleed) | Ideogram 4.5 (`ideogram-4-5`), `preciseEdit: true` | edits the approved still in place, keeps framing |
| Exact 16:9 crop | `images_crop` | start frames set the clip's aspect ratio, so they must be exactly 16:9 |
| Video clips | Seedance 2.5 (`bytedance-seedance-pro-2.5`) | keyframe mode, 16:9, 720p, 4–5 s, one model for every clip |
| Seam frames | `video_extract_frames` (`"last"` / `0`) | free; frames stay on Magnific and are passed by identifier |
| Join | `video_concatenate` | then upscaled with `video_upscale` (Magnific Precision, 1080p) |
| Music | Lyria 3 Pro (`google-lyria-3-pro`) | 90 s requested, instrumental |
| Sound effects | `audio_sfx_generate` (ElevenLabs) | one-shots 3–4 s; ambience 12–15 s with `loop: true` |

## Chaining rule (the seam)

```
scene clip i       : keyframes.start = still i
transition i → i+1 : keyframes.start = LAST frame of scene clip i      (extracted, not the still)
                     keyframes.end   = FIRST frame of scene clip i+1   (extracted, not the still)
```
Every clip **starts already drifting forward** and **ends in a slow forward drift**; any
expressive move (tilt, arc, crane, swoop) happens in the middle. That keeps camera speed
continuous at each seam in both scroll directions.

---

## Style block (shared by every still)

```
Delicate hand-drawn fashion-illustration style: loose fine ink linework in warm grey-brown, soft translucent watercolour and marker washes in blush pink (#F2C6CF), rose (#D9849B) and champagne gold (#CDB27A) on warm cream paper (#FBF7F2), with touches of sage green and pale sky blue. Soft diffused daylight, no hard shadows, airy and romantic Parisian sketchbook mood. Hand-drawn, slightly imperfect lines. Not photorealistic, not 3D, not anime. No people, no text, no letters, no logos.
```
Stills 2–5 start with: *"Match the exact illustration style, line weight, washes and palette of the reference image(s)."*

## Scene stills

**1. Royal Gate**
```
[STYLE] Eye-level view from the cobbled Place d'Armes of the Palace of Versailles, looking straight at the gilded Royal Gate, centred, one-point perspective. The tall wrought-iron gate with golden fleur-de-lis railings and the royal crown crest. Beyond it, the Marble Courtyard and the palace façade in pale cream stone with gold accents. Pink and gold dawn sky wash. Wide 16:9 composition.
```
Edit → closed gate (Ideogram precise edit):
```
Close the two gilded gate doors: both wrought-iron gate leaves are now fully shut, meeting in the centre, so the courtyard is only visible through the golden bars. Keep everything else exactly the same: same framing, same hand-drawn ink and watercolour illustration style, same blush pink and champagne gold palette, same palace, railings, crown crest, sky and cobblestones. No people, no text.
```

**2. Hall of Mirrors**
```
[STYLE] Eye-level view standing at the entrance of the Hall of Mirrors in the Palace of Versailles, one-point perspective looking straight down the long gallery, centred. Arched mirrors along the right wall reflecting the windows, tall arched windows on the left letting in soft garden light, rows of crystal chandeliers, gilded statues holding candelabra, a painted vaulted ceiling suggested in loose washes, polished parquet floor. Wide 16:9 composition.
```

**3. Marie-Antoinette's bedchamber**
```
[STYLE] Eye-level view from just inside the doorway of Marie Antoinette's bedchamber at Versailles, seen at a gentle three-quarter angle. The grand bed with its tall plumed canopy and draped curtains stands centre-left, with a low gilded balustrade in front of it; walls hung with floral silk in blush pink and cream; a carved fireplace with a tall mirror; a tall window on the right glowing with soft daylight. Plenty of open floor space in front of the bed. Wide 16:9 composition.
```

**4. Gardens**
```
[STYLE] View from the palace terrace looking out over the gardens of Versailles, centred, one-point perspective. Symmetrical parterres of clipped boxwood in sage green, the tiered Latona fountain in the foreground with soft sprays of water, the long green lawn of the Royal Way leading to the Grand Canal shimmering in the distance, rows of trees on both sides, pastel pink and gold late-afternoon sky. Wide 16:9 composition.
```

**5. Queen's Hamlet**
```
[STYLE] Eye-level view across the calm lake of the Queen's Hamlet at Versailles, centred. The Queen's House, a rustic half-timbered cottage with a thatched roof, wooden balconies and galleries and pots of pink flowers, stands on the far bank, with the round stone Marlborough Tower and smaller thatched cottages nearby, weeping willows and climbing roses, a small wooden footbridge, the buildings softly reflected in the still water. Warm pink and gold sunset sky. Wide 16:9 composition.
```

### Full-bleed edit (applied to all five stills)
```
Extend the painting so it fills the entire 16:9 frame edge to edge: replace the blank cream paper border and the faded, fading-out edges with more of the same scene, fully painted all the way to every edge. Full-bleed illustration, no border, no vignette, no white margins, no fade to paper. Keep the centre of the image exactly the same: same composition, same [scene], same hand-drawn ink and watercolour style, same palette. No people, no text.
```
The gardens needed a stronger version that names every edge ("extend the sky to the top
corners, the trees to the left and right edges, the paths to the bottom edge… absolutely no
white paper anywhere").

---

## Video clips (Seedance 2.5, 720p)

Shared ending for every clip prompt:
```
The whole clip stays a hand-drawn ink and watercolour illustration, fully painted edge to edge, full-bleed, no border, no white margins, no vignette: lines and washes stay crisp and consistent, colours stay blush pink, champagne gold and cream [+ sage green outdoors], no photorealism, no 3D look. No people, no text.
```

| # | Clip | Len | Keyframes | Prompt (before the shared ending) |
|---|---|---|---|---|
| 1 | Gate opens | 5 s | start: closed-gate still | Single continuous shot, no cuts. The two gilded wrought-iron gate doors, closed at first, slowly and gracefully swing open inward away from the camera. As they open, the camera begins gliding slowly forward at eye level, passes through the open Royal Gate and continues across the cobbled Marble Courtyard toward the cream palace façade and its tall central doors. Gentle, smooth, graceful motion. In the final second the camera settles into a slow, steady forward drift. |
| T1 | Doors → staircase → Hall | 4 s | start: last of 1 · end: first of 2 | Single continuous shot, no cuts. Continuing the slow steady forward drift, the camera glides through the tall central doors of the palace, then gently rises up a sweeping marble staircase with gilded railings, the view tilting softly upward as it climbs, then levels out at the top and glides forward to arrive at the entrance of the Hall of Mirrors, matching the end frame exactly. Smooth, graceful, flowing motion with a gentle change of height and angle, no sudden turns, never pulls back. |
| 2 | Hall of Mirrors | 4 s | start: hall still | Single continuous shot, no cuts. The camera is already gliding slowly forward at eye level down the centre of the Hall of Mirrors and gently tilts upward to admire the painted vaulted ceiling and the crystal chandeliers passing overhead, then softly tilts back down to eye level, mirrors and tall arched windows drifting by on both sides. Smooth, graceful, unhurried motion, no sudden turns. In the final second the camera settles into a slow, steady forward drift. |
| T2 | Salon of Peace → bedchamber | 4 s | start: last of 2 · end: first of 3 | Single continuous shot, no cuts. Continuing the slow steady forward drift, the camera glides on to the far end of the Hall of Mirrors, passes through the wide arched opening that is already open into a small gilded salon, and drifts in a gentle, smooth curve toward an open doorway on the far side whose doors already stand wide open, then glides through it and arrives at the view into Marie Antoinette's bedchamber, matching the end frame exactly. Everything stays physically consistent: windows stay windows, mirrors stay mirrors, walls and doors never change shape, nothing morphs or transforms, no new doors appear. Smooth, graceful, flowing motion, no sudden turns, never pulls back. |
| 3 | Bedchamber | 4 s | start: bedchamber still | Single continuous shot, no cuts. The camera is already gliding slowly forward at eye level into Marie Antoinette's bedchamber, then makes a slow, gentle arc to the right around the gilded balustrade and the grand canopied bed, the bed turning softly in view, until the camera faces the tall window glowing with daylight. Smooth, graceful, unhurried motion, no sudden turns. In the final second the camera settles into a slow, steady forward drift toward the window. |
| T3 | Window → sky → terrace | 4 s | start: last of 3 · end: first of 4 | Single continuous shot, no cuts. Continuing the slow forward drift toward the tall window, the window opens and the camera floats out through it, then cranes gracefully upward into the open sky above the palace roofline, tilting down to look over the sunlit terrace, then gently descends and levels out to arrive at the view over the Latona fountain and the gardens, matching the end frame exactly. Smooth, graceful, flowing crane motion with a gentle change of height and angle, no sudden turns, never pulls back. |
| 4 | Gardens | 4 s | start: gardens still | Single continuous shot, no cuts. The camera is already gliding slowly forward from the palace terrace and gently rises above the Latona fountain, the clipped sage-green parterres opening up below, then continues forward along the long green Royal Way toward the Grand Canal shimmering in the distance. The fountain water sparkles softly. Smooth, graceful, unhurried motion, no sudden turns. In the final second the camera settles into a slow, steady forward drift along the garden. |
| T4 | Over the treetops → lake | 4 s | start: last of 4 · end: first of 5 | Single continuous shot, no cuts. Continuing the slow forward drift over the gardens, the camera rises softly into a high bird's-eye view over the treetops of the park, glides across the green canopy, then makes a gentle descending swoop with a slow sideways arc between weeping willows, coming down to eye level at the edge of the calm lake of the Queen's Hamlet, matching the end frame exactly. Smooth, graceful, flowing aerial motion with a gentle change of height and angle, no sudden turns, never pulls back. |
| 5 | Queen's Hamlet | 5 s | start: hamlet still | Single continuous shot, no cuts. The camera glides forward low over the calm lake of the Queen's Hamlet, skimming the water, then sweeps in a wide, graceful arc around the side of the thatched Queen's House, rising gently as it goes to reveal the round stone Marlborough Tower, the little wooden footbridge and more thatched cottages among the willows, the whole village opening up in the warm sunset light. The scene is alive: weeping willows sway in the breeze, ripples and soft sparkles move across the water, a few swans glide on the lake, pink rose petals drift through the air. In the last second the camera eases to a gentle, almost still, high view of the whole hamlet and its reflection. Smooth, graceful, flowing motion, no sudden turns. Everything stays physically consistent, buildings never change shape. |

Total: 5 + 4 + 4 + 4 + 4 + 4 + 4 + 4 + 5 = **38 s**.

### What changed between attempts
- **Gate:** first version started open; re-made from a closed-gate still so the first scroll opens it (5 s instead of 4 s).
- **T2:** "turn through a side door" made the model morph a window into a door. Fixed by following the real route (Salon of Peace, already-open doorway) and adding "nothing morphs, no new doors appear".
- **Hamlet:** first version was a plain drift; re-made with a low skim, wide rising arc and living details.

---

## Sound

**Music** (Lyria 3 Pro). The first wording, which named a historical style, was rejected by the content filter; this one passed:
```
Soft, dreamy, romantic instrumental piece. Delicate harpsichord melody, gentle pizzicato and legato strings, a light solo flute and a soft music-box shimmer. Slow tempo around 70 BPM, calm, elegant and wistful, classical baroque feel. Gentle, even dynamics, no drums, no percussion, no vocals. Ends softly and resolves on the home key.
```

**Sound effects** (triggered by film position in `app.js`):

| File | Length | Prompt |
|---|---|---|
| `sfx-gate.mp3` | 4 s | Large ornate wrought-iron palace gate slowly swinging open: a long, deep metallic creak of old hinges and a soft clank of the iron latch at the start, outdoors, elegant and gentle, no voices, no music |
| `sfx-door.mp3` | 3 s | Tall heavy wooden palace double doors slowly opening: a gentle brass latch click followed by a soft low wooden creak, quiet elegant interior, no voices, no music |
| `sfx-window.mp3` | 3 s | Tall old French casement window being opened: a small metal latch click, a light wooden creak, then a soft gust of fresh outdoor breeze, no voices, no music |
| `amb-chandelier.mp3` | 12 s, loop | Crystal chandelier pendants gently tinkling and chiming in a soft draft, delicate sparkling glass sounds, calm and quiet, large empty palace hall with a light reverb, no voices, no music |
| `amb-garden.mp3` | 15 s, loop | Gentle breeze through leafy trees and weeping willows in a peaceful garden, soft rustling leaves, distant songbirds, calm and airy, no voices, no music |
