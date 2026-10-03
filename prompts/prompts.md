# Prompts — Carnet de Versailles

Paste the **STYLE** block word-for-word into every prompt. Never edit it per scene.

## STYLE (shared by every image and video prompt)

```
Delicate hand-drawn fashion-illustration style: loose fine ink linework in warm grey-brown, soft translucent watercolour and marker washes in blush pink (#F2C6CF), rose (#D9849B) and champagne gold (#CDB27A) on warm cream paper (#FBF7F2), with touches of sage green and pale sky blue. Plenty of untouched white paper; the drawing fades softly into blank textured watercolour paper at the edges. Soft diffused daylight, no hard shadows, airy and romantic Parisian sketchbook mood. Hand-drawn, slightly imperfect lines. Not photorealistic, not 3D, not anime. No people, no text, no letters, no logos.
```

---

## Scene stills (image model: GPT 2.5 or Nano Banana 2 — 16:9, 2K)

Generate **scene 1 first**. Once approved, pass it as a style reference image for 2–4
(add: "Match the exact illustration style, line weight and palette of the reference image.").

### still_1_gate
```
[STYLE] Eye-level view from the cobbled Place d'Armes of the Palace of Versailles, looking straight at the gilded Royal Gate, centred, one-point perspective. The tall wrought-iron gate with golden fleur-de-lis railings and the royal crown crest stands slightly open. Beyond it, the Marble Courtyard and the palace façade in pale cream stone with gold accents. Pink and gold dawn sky wash. Wide 16:9 composition.
```

### still_2_hall
```
[STYLE] Eye-level view standing at the entrance of the Hall of Mirrors in the Palace of Versailles, one-point perspective looking down the long gallery, centred. Arched mirrors along the right wall reflecting the windows, tall arched windows on the left letting in soft garden light, rows of crystal chandeliers, gilded statues holding candelabra, a painted vaulted ceiling suggested in loose washes, polished parquet floor. Wide 16:9 composition.
```

### still_3_bedchamber
```
[STYLE] Eye-level view from the doorway into Marie Antoinette's bedchamber at Versailles, centred. The grand bed with a tall plumed canopy, floral silk wall hangings in blush pink and cream, a low gilded balustrade in front of the bed, a carved fireplace with a mirror, a tall window on the far wall glowing with daylight. Wide 16:9 composition.
```

### still_4_gardens
```
[STYLE] View from the palace terrace looking out over the gardens of Versailles, centred, one-point perspective. Symmetrical parterres of clipped boxwood in sage green, the tiered Latona fountain in the foreground, the long green lawn of the Royal Way leading to the Grand Canal shimmering in the distance, rows of trees on both sides, pastel pink and sky-blue sky. Wide 16:9 composition.
```

---

## Video clips (Seedance 2.5 — `bytedance-seedance-pro-2.5`)

Settings for every clip: keyframe mode, **4 s**, **16:9**, no sound.
Test at **480p**, final at **720p**. Never combine keyframes with references.

Motion contract (keep in every clip): *starts already moving slowly forward, ends in a
slow steady forward drift, never pulls back, never cuts.*

### dive_1_gate — start frame: `still_1_gate`
```
Single continuous shot, no cuts. The camera is already gliding slowly forward at eye level and continues straight ahead through the open gilded Royal Gate, across the cobbled Marble Courtyard toward the cream palace façade and its tall central doors. Gentle, smooth, graceful motion. In the final second the camera settles into a slow, steady forward drift. The whole clip stays a hand-drawn ink and watercolour illustration on paper: lines and washes stay crisp and consistent, colours stay blush pink, champagne gold and cream, no photorealism, no 3D look. No people, no text.
```

### dive_2_hall — start frame: `still_2_hall`
```
Single continuous shot, no cuts. The camera is already gliding slowly forward at eye level and continues down the centre of the Hall of Mirrors, chandeliers passing gently overhead, mirrors on the right and garden windows on the left drifting by. Gentle, smooth, graceful motion. In the final second the camera settles into a slow, steady forward drift. The whole clip stays a hand-drawn ink and watercolour illustration on paper: lines and washes stay crisp and consistent, colours stay blush pink, champagne gold and cream, no photorealism, no 3D look. No people, no text.
```

### conn_1_gate_to_hall — start: `dive_1_gate_last.png`, end: `dive_2_hall_first.png`
```
Single continuous shot, no cuts. Continuing the same slow steady forward drift, the camera glides through the tall central doors of the palace, along a short gilded corridor, and arrives at the entrance of the Hall of Mirrors, matching the end frame exactly. The camera only moves forward, never pulls back, never rotates sharply. The whole clip stays a hand-drawn ink and watercolour illustration on paper: lines and washes stay crisp and consistent, colours stay blush pink, champagne gold and cream, no photorealism, no 3D look. No people, no text.
```

### (later) dive_3_bedchamber — start frame: `still_3_bedchamber`
```
Single continuous shot, no cuts. The camera is already gliding slowly forward at eye level and drifts into Marie Antoinette's bedchamber, passing the gilded balustrade and the canopied bed on the left, moving toward the tall glowing window on the far wall. Gentle, smooth, graceful motion. In the final second the camera settles into a slow, steady forward drift toward the window. The whole clip stays a hand-drawn ink and watercolour illustration on paper: lines and washes stay crisp and consistent, colours stay blush pink, champagne gold and cream, no photorealism, no 3D look. No people, no text.
```

### (later) conn_2_hall_to_bedchamber — start: `dive_2_hall_last.png`, end: `dive_3_bedchamber_first.png`
```
Single continuous shot, no cuts. Continuing the same slow steady forward drift, the camera turns gently through a gilded side door of the Hall of Mirrors, through a small antechamber, and arrives at the doorway of Marie Antoinette's bedchamber, matching the end frame exactly. The camera only moves forward, never pulls back. The whole clip stays a hand-drawn ink and watercolour illustration on paper: lines and washes stay crisp and consistent, colours stay blush pink, champagne gold and cream, no photorealism, no 3D look. No people, no text.
```

### (later) dive_4_gardens — start frame: `still_4_gardens`
```
Single continuous shot, no cuts. The camera is already gliding slowly forward from the terrace and gently rises over the Latona fountain and the clipped parterres, travelling along the Royal Way toward the Grand Canal shimmering in the distance. Gentle, smooth, graceful motion that slows to a calm, almost still view at the end. The whole clip stays a hand-drawn ink and watercolour illustration on paper: lines and washes stay crisp and consistent, colours stay blush pink, sage green and cream, no photorealism, no 3D look. No people, no text.
```

### (later) conn_3_bedchamber_to_gardens — start: `dive_3_bedchamber_last.png`, end: `dive_4_gardens_first.png`
```
Single continuous shot, no cuts. Continuing the same slow steady forward drift, the camera glides through the tall window of the bedchamber as it opens, out onto the sunlit palace terrace, arriving at the view over the gardens, matching the end frame exactly. The camera only moves forward, never pulls back. The whole clip stays a hand-drawn ink and watercolour illustration on paper: lines and washes stay crisp and consistent, colours stay blush pink, champagne gold, sage green and cream, no photorealism, no 3D look. No people, no text.
```
