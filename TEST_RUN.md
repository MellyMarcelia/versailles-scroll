# Step 2 — Test transition run (Gate → T1 → Hall)

Run this in **Codex** with the Magnific MCP connected. Prompts are in `prompts/prompts.md`.
Goal: prove one seamless transition before spending on the full chain.

## 0. Check Magnific (free)
Ask Codex:
> Using the Magnific MCP, call `video_models_show` for `bytedance-seedance-pro-2.5` and
> `images_models_list`. Tell me: supported durations, resolutions, aspect ratios, and the
> exact parameter names for start and end keyframes. Then call `account_balance`.

Note anything that differs from the plan (e.g. minimum duration not 4 s) in `PLAN.md`.

## 1. Stills (≈150 credits)
> Generate `still_1_gate` with [GPT 2.5 or Nano Banana 2], 16:9, 2K, using the prompt in
> prompts/prompts.md (with the STYLE block). Run `simulate_cost` first and show me the
> estimate. Save to `assets/stills/still_1_gate.png`.

**Approve it by eye before continuing.** Does it look like your references? If not, adjust the
STYLE block (not the scene text) and re-roll. Once approved:

> Generate `still_2_hall` the same way, passing `still_1_gate.png` as a style reference image,
> adding "Match the exact illustration style, line weight and palette of the reference image."

## 2. Scene clips (480p, ≈1,600 credits)
> Simulate the cost, then generate `dive_1_gate` and `dive_2_hall` with Seedance 2.5:
> keyframe mode, start frame = the matching still, 4 s, 16:9, 480p, no sound, prompts from
> prompts/prompts.md. Wait for both, download to `raw/dive_1_gate.mp4` and `raw/dive_2_hall.mp4`.

Watch both. Re-roll only a clip whose style turns 3D/photoreal or whose camera goes backward.

## 3. Extract the real seam frames (free)
```bash
bash scripts/frames.sh raw/dive_1_gate.mp4 raw/dive_2_hall.mp4
```

## 4. Transition clip (480p, ≈800 credits)
> Generate `conn_1_gate_to_hall` with Seedance 2.5: keyframe mode, start frame =
> `raw/dive_1_gate_last.png`, end frame = `raw/dive_2_hall_first.png`, 4 s, 16:9, 480p,
> no sound, prompt from prompts/prompts.md. Download to `raw/conn_1_gate_to_hall.mp4`.

## 5. Check the seams (free)
```bash
bash scripts/seamcheck.sh raw/dive_1_gate.mp4 raw/conn_1_gate_to_hall.mp4 raw/dive_2_hall.mp4
```
Open `raw/preview.mp4` and `raw/seams/seam_*.png`.

- **Good:** same composition either side of each seam; PSNR roughly ≥ 25 dB; no jump in
  colour, line weight or camera direction.
- **Pop at seam 1:** the transition's start frame wasn't the real last frame → redo step 3/4.
- **Pop at seam 2:** Seedance didn't land exactly on the end frame → re-roll the transition,
  or accept small drift (the page crossfades 2–3 frames).
- **Style drift mid-clip:** strengthen the "stays a hand-drawn illustration" line and re-roll.

Write down what you changed — that's your "fixed workflow" for the final run.
