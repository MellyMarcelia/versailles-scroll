/* Le Carnet de Marie-Antoinette — scroll-scrub engine
 *
 * One pre-rendered film (5 scenes + 4 transitions, joined end to end).
 * Scroll position → a point on the film's timeline → video.currentTime.
 * Scroll down plays forward, scroll up plays backward.
 *
 * Adapted from the ideas in oso95/scroll-world (blob loading, seek coalescing,
 * iOS priming, reduced-motion stills), rewritten for a single-file film.
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Configuration
  // dur    = seconds of film in this segment (rescaled to the real video length)
  // weight = how much scrolling the segment gets (1 = one screen height)
  // ---------------------------------------------------------------------------
  var CONFIG = {
    video: "assets/video/journey.mp4",          // 1080p H.264 — laptops and desktops
    videoSmall: "assets/video/journey-720.mp4", // 720p H.264 — phones (lighter to decode while scrubbing)
    videoFallback: "assets/video/journey.webm", // 1080p VP9 — browsers without H.264
    motion: "assets/video/motion.json",         // per-frame motion, for steady camera speed
    segments: [
      { scene: 0, dur: 5, weight: 2.2 },   // gate opens
      { dur: 4, weight: 1.1 },             // → staircase → hall
      { scene: 1, dur: 4, weight: 1.8 },   // Hall of Mirrors
      { dur: 4, weight: 1.1 },             // → side door
      { scene: 2, dur: 4, weight: 1.8 },   // bedchamber
      { dur: 4, weight: 1.1 },             // → out the window
      { scene: 3, dur: 4, weight: 1.8 },   // gardens
      { dur: 4, weight: 1.1 },             // → over the trees
      { scene: 4, dur: 5, weight: 2.0 },   // Queen's Hamlet
      { hold: true, dur: 0, weight: 1.2 }  // last frame holds for the ending
    ],
    scenes: [
      {
        place: "The Royal Gate",
        date: "16 May 1770",
        text: "I was fourteen when the golden gate opened for me. Behind it waited a palace that would never belong to me alone.",
        still: "assets/stills/scene-1-gate.webp",
        show: [0.42, 0.95]   // part of the segment where the entry is visible
      },
      {
        place: "The Hall of Mirrors",
        date: "May 1770",
        text: "A thousand candles, a thousand mirrors, a thousand eyes. I learned to smile at all of them.",
        still: "assets/stills/scene-2-hall.webp",
        show: [0.12, 0.9]
      },
      {
        place: "The Queen's Bedchamber",
        date: "December 1778",
        text: "Even here I was never alone. The whole court crowded in to watch me become a mother.",
        still: "assets/stills/scene-3-bedchamber.webp",
        show: [0.12, 0.9]
      },
      {
        place: "The Gardens",
        date: "1774",
        text: "Queen at eighteen, I ran to the gardens, where the roses didn't care who I was.",
        still: "assets/stills/scene-4-gardens.webp",
        show: [0.12, 0.9]
      },
      {
        place: "The Queen's Hamlet",
        date: "1785",
        text: "And further still, I built a little village where nobody bowed.",
        still: "assets/stills/scene-5-hamlet.webp",
        show: [0.1, 0.72]
      }
    ]
  };

  // ---------------------------------------------------------------------------
  // Elements
  // ---------------------------------------------------------------------------
  var root = document.documentElement;
  var stage = document.querySelector(".stage");
  var video = document.querySelector(".stage__video");
  var stillsBox = document.querySelector(".stage__stills");
  var intro = document.querySelector(".intro");
  var cue = document.querySelector(".cue");
  var entriesBox = document.querySelector(".entries");
  var railList = document.querySelector(".rail__list");
  var finale = document.querySelector(".finale");
  var track = document.querySelector(".track");
  var loader = document.querySelector(".loader");
  var loaderText = document.querySelector(".loader__text");
  var soundBtn = document.querySelector(".sound");
  var music = document.querySelector(".music");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(pointer: coarse)").matches;
  if (reduced) document.body.classList.add("reduced");

  // ---------------------------------------------------------------------------
  // Timeline: segments → cumulative weights and film times
  // ---------------------------------------------------------------------------
  var segs = [];
  var totalWeight = 0;

  // Motion-balanced timeline.
  // motion.json holds how much the picture changes between consecutive frames
  // (measured with ffmpeg). Scroll distance is shared out partly by time and
  // partly by visible motion, so slow stretches and the near-still frames at
  // each clip seam pass quickly and fast moves get more room: the camera seems
  // to move at a steady speed instead of pausing and lurching at each seam.
  var MOTION_BLEND = 0.55;   // 0 = plain time, 1 = purely by motion
  var motion = null;         // per-frame-interval motion values
  var W = null;              // cumulative scroll weight at each frame boundary
  var frameDt = 0;

  function buildMotionTable(videoDuration, filmWeight) {
    if (!motion || !motion.length || !videoDuration) { W = null; return; }
    var sorted = motion.slice().sort(function (a, b) { return a - b; });
    var cap = 2.5 * sorted[Math.floor(sorted.length / 2)];
    var mean = 0, m = motion.map(function (x) { var v = Math.min(x, cap); mean += v; return v; });
    mean /= m.length;
    W = [0];
    var acc = 0;
    m.forEach(function (v) { acc += MOTION_BLEND * v / mean + (1 - MOTION_BLEND); W.push(acc); });
    for (var k = 0; k < W.length; k++) W[k] = W[k] / acc * filmWeight;
    frameDt = videoDuration / m.length;
  }

  function weightAt(t) {                 // film time → scroll weight
    var x = t / frameDt, k = Math.min(W.length - 2, Math.max(0, Math.floor(x)));
    return W[k] + (W[k + 1] - W[k]) * Math.min(1, Math.max(0, x - k));
  }

  function timeAt(w) {                   // scroll weight → film time
    var lo = 0, hi = W.length - 1;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (W[mid] <= w) lo = mid; else hi = mid; }
    var span = W[hi] - W[lo];
    return (lo + (span > 0 ? (w - W[lo]) / span : 0)) * frameDt;
  }

  function buildTimeline(videoDuration) {
    var nominal = CONFIG.segments.reduce(function (s, g) { return s + g.dur; }, 0);
    var scale = videoDuration ? videoDuration / nominal : 1;
    var filmWeight = CONFIG.segments.reduce(function (s, g) { return s + (g.hold ? 0 : g.weight); }, 0);
    buildMotionTable(videoDuration, filmWeight);
    var t = 0, w = 0;
    segs = CONFIG.segments.map(function (g) {
      var t1 = t + g.dur * scale;
      var w1 = (W && !g.hold) ? weightAt(t1) : w + g.weight;
      var seg = { scene: g.scene, hold: !!g.hold, t0: t, t1: t1, w0: w, w1: w1 };
      t = seg.t1; w = seg.w1;
      return seg;
    });
    totalWeight = w;
    // never seek past the last decodable frame
    if (videoDuration) segs.forEach(function (s) { s.t1 = Math.min(s.t1, videoDuration - 0.04); s.t0 = Math.min(s.t0, s.t1); });
  }

  // progress 0..1 → { time, segIndex, local 0..1 }
  function locate(progress) {
    var w = Math.max(0, Math.min(1, progress)) * totalWeight;
    for (var i = 0; i < segs.length; i++) {
      var s = segs[i];
      if (w <= s.w1 || i === segs.length - 1) {
        var local = (w - s.w0) / Math.max(1e-6, s.w1 - s.w0);
        local = Math.max(0, Math.min(1, local));
        var time = s.hold ? s.t1
          : W ? Math.min(s.t1, Math.max(s.t0, timeAt(w)))
          : s.t0 + (s.t1 - s.t0) * local;
        return { time: time, index: i, local: local };
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Layout: track height = total scroll distance
  // ---------------------------------------------------------------------------
  var vh = window.innerHeight;
  var lastWidth = window.innerWidth;

  function layout() {
    vh = window.innerHeight;
    track.style.height = Math.round(totalWeight * vh + vh) + "px";
  }

  function scrollProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  }

  // ---------------------------------------------------------------------------
  // Build entries, rail and reduced-motion stills
  // ---------------------------------------------------------------------------
  var entryEls = [], railEls = [], stillEls = [];

  CONFIG.scenes.forEach(function (sc, i) {
    var art = document.createElement("article");
    art.className = "entry";
    art.innerHTML =
      '<p class="entry__meta"><strong></strong>, <span></span></p>' +
      '<p class="entry__text"></p>';
    art.querySelector("strong").textContent = sc.place;
    art.querySelector("span").textContent = sc.date;
    art.querySelector(".entry__text").textContent = sc.text;
    entriesBox.appendChild(art);
    entryEls.push(art);

    var li = document.createElement("li");
    li.className = "rail__item";
    li.innerHTML = '<button type="button"><span class="rail__label"></span><span class="rail__dot"></span></button>';
    li.querySelector(".rail__label").textContent = sc.place.replace(/^The /, "");
    li.querySelector("button").setAttribute("aria-label", "Go to " + sc.place);
    li.querySelector("button").addEventListener("click", function () { goToScene(i); });
    railList.appendChild(li);
    railEls.push(li);

    var img = document.createElement("img");
    img.alt = "";
    img.loading = i === 0 ? "eager" : "lazy";
    img.src = sc.still;
    stillsBox.appendChild(img);
    stillEls.push(img);
  });

  function goToScene(i) {
    var seg = segs.find(function (s) { return s.scene === i; });
    if (!seg) return;
    var sc = CONFIG.scenes[i];
    var w = seg.w0 + (seg.w1 - seg.w0) * ((sc.show[0] + sc.show[1]) / 2);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: (w / totalWeight) * max, behavior: reduced ? "auto" : "smooth" });
  }

  document.querySelector('[data-action="restart"]').addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });

  // ---------------------------------------------------------------------------
  // Overlays: intro, entries, rail, finale
  // ---------------------------------------------------------------------------
  function fade(local, a, b) {
    // 0 outside [a,b], 1 inside, with soft edges of 10% of the segment
    var edge = 0.1;
    if (local < a || local > b) return 0;
    var inV = Math.min(1, (local - a) / edge);
    var outV = Math.min(1, (b - local) / edge);
    return Math.max(0, Math.min(inV, outV));
  }

  var lastScene = -1;

  function updateOverlays(loc) {
    // intro fades over the first ~half screen of scrolling
    var introV = Math.max(0, 1 - window.scrollY / (vh * 0.45));
    intro.style.opacity = introV.toFixed(3);
    intro.style.transform = "translateY(calc(-50% - " + ((1 - introV) * 24).toFixed(1) + "px))";
    intro.style.visibility = introV < 0.01 ? "hidden" : "visible";
    cue.style.opacity = introV.toFixed(3);
    cue.style.visibility = introV < 0.01 ? "hidden" : "visible";

    var seg = segs[loc.index];
    var current = -1;

    entryEls.forEach(function (el, i) {
      var v = 0;
      if (seg.scene === i) v = fade(loc.local, CONFIG.scenes[i].show[0], CONFIG.scenes[i].show[1]);
      el.style.opacity = v.toFixed(3);
      el.style.transform = "translateY(" + ((1 - v) * 12).toFixed(1) + "px)";
    });

    // current scene for the rail: the scene we're in, or the one we just left
    for (var i = loc.index; i >= 0; i--) {
      if (segs[i].scene !== undefined) { current = segs[i].scene; break; }
    }
    if (current !== lastScene) {
      railEls.forEach(function (li, i) {
        li.classList.toggle("is-current", i === current);
        li.classList.toggle("is-past", i < current);
        li.querySelector("button").setAttribute("aria-current", i === current ? "step" : "false");
      });
      stillEls.forEach(function (img, i) { img.classList.toggle("is-current", i === Math.max(0, current)); });
      lastScene = current;
    }

    // finale: last part of the Hamlet + the hold
    var last = segs.length - 1;
    var showFinale = loc.index === last || (loc.index === last - 1 && loc.local > 0.8);
    finale.classList.toggle("is-visible", showFinale);
    document.body.classList.toggle("finale-on", showFinale);
  }

  // ---------------------------------------------------------------------------
  // Video scrubbing: smoothed target + seek coalescing
  // ---------------------------------------------------------------------------
  var ready = false;
  var target = 0, shown = 0;
  var seeking = false;

  video.addEventListener("seeking", function () { seeking = true; });
  video.addEventListener("seeked", function () { seeking = false; });

  function tick() {
    var loc = locate(scrollProgress());
    target = loc.time;
    updateOverlays(loc);

    if (ready && !reduced) {
      // ease toward the scroll target; snap when close
      var diff = target - shown;
      shown = Math.abs(diff) < 0.002 ? target : shown + diff * 0.16;
      if (!seeking && Math.abs(video.currentTime - shown) > 0.012) {
        video.currentTime = shown;
      }
    }
    tickSound(ready && !reduced ? shown : target);
    requestAnimationFrame(tick);
  }

  // ---------------------------------------------------------------------------
  // Loading: fetch the film as a Blob so it is always fully seekable
  // ---------------------------------------------------------------------------
  function setProgress(p) {
    loader.style.setProperty("--progress", p.toFixed(3));
    loaderText.textContent = "Opening the notebook… " + Math.round(p * 100) + "%";
  }

  function finishLoading() {
    loader.classList.add("is-done");
  }

  function pickSource() {
    var h264 = video.canPlayType('video/mp4; codecs="avc1.640028"');
    if (!h264) return CONFIG.videoFallback;
    var small = isTouch || Math.min(screen.width, screen.height) < 700;
    return small ? CONFIG.videoSmall : CONFIG.video;
  }

  function loadVideo() {
    var motionReady = fetch(CONFIG.motion)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (m) { motion = m; })
      .catch(function () { motion = null; });
    return fetch(pickSource()).then(function (res) {
      if (!res.ok) throw new Error("Video not found (" + res.status + ")");
      var total = Number(res.headers.get("Content-Length")) || 0;
      if (!res.body || !total) return res.blob();
      var reader = res.body.getReader();
      var chunks = [], received = 0;
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return new Blob(chunks, { type: res.headers.get("Content-Type") || "video/mp4" });
          chunks.push(r.value);
          received += r.value.length;
          setProgress(received / total);
          return pump();
        });
      }
      return pump();
    }).then(function (blob) {
      video.src = URL.createObjectURL(blob);
      return new Promise(function (resolve, reject) {
        video.addEventListener("loadedmetadata", resolve, { once: true });
        video.addEventListener("error", function () { reject(new Error("Video could not be decoded")); }, { once: true });
      });
    }).then(function () {
      return motionReady;
    }).then(function () {
      buildTimeline(video.duration);
      layout();
      video.currentTime = locate(scrollProgress()).time;
      shown = video.currentTime;
      video.addEventListener("seeked", function onFirst() {
        video.removeEventListener("seeked", onFirst);
        ready = true;
        stage.classList.add("is-ready");
        finishLoading();
      });
    });
  }

  // iOS: a muted video that has never played may not paint seeked frames
  function primeVideo() {
    var p = video.play();
    if (p && p.then) p.then(function () { video.pause(); }).catch(function () {});
  }
  window.addEventListener("touchstart", primeVideo, { once: true, passive: true });

  // ---------------------------------------------------------------------------
  // Sound: continuous music + scroll-synced sound effects (Web Audio)
  //
  // - Music plays under the whole journey, so it never cuts at a seam.
  // - One-shots (gate, doors, window) fire when the film crosses their moment,
  //   in either scroll direction (the gate creaks closed too when scrolling up).
  // - Ambience loops (chandeliers, trees) fade in and out with the film position.
  // Everything sits behind one master volume controlled by the sound button.
  // ---------------------------------------------------------------------------
  var SOUND = {
    musicLevel: 0.5,
    // [segment index, fraction through the segment]
    oneShots: [
      { file: "assets/audio/sfx-gate.mp3",   at: [0, 0.06], level: 0.9 },  // gate swings open
      { file: "assets/audio/sfx-door.mp3",   at: [1, 0.10], level: 0.8 },  // palace doors
      { file: "assets/audio/sfx-door.mp3",   at: [3, 0.60], level: 0.7 },  // doorway into the bedchamber
      { file: "assets/audio/sfx-window.mp3", at: [5, 0.08], level: 0.8 }   // bedchamber window opens
    ],
    // fade in from → full from → full until → silent at
    ambience: [
      { file: "assets/audio/amb-chandelier.mp3", level: 0.55,
        shape: [[1, 0.55], [2, 0.0], [2, 1.0], [3, 0.5]] },               // Hall of Mirrors
      { file: "assets/audio/amb-garden.mp3", level: 0.5,
        shape: [[5, 0.45], [6, 0.1], [9, 1.0], [9, 1.0]] }                // gardens → Hamlet → end
    ]
  };

  var actx = null, master = null, buffers = {}, loops = [], soundOn = false;
  var lastSoundTime = null, cueCooldown = {};

  function segTime(ref) {
    var s = segs[Math.min(ref[0], segs.length - 1)];
    return s.t0 + (s.t1 - s.t0) * ref[1];
  }

  function loadBuffer(url) {
    if (buffers[url]) return buffers[url];
    buffers[url] = fetch(url)
      .then(function (r) { if (!r.ok) throw new Error(url); return r.arrayBuffer(); })
      .then(function (data) {
        return new Promise(function (res, rej) { actx.decodeAudioData(data, res, rej); });
      })
      .catch(function () { return null; });   // a missing sound is skipped, never fatal
    return buffers[url];
  }

  function initAudio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    actx = new AC();
    master = actx.createGain();
    master.gain.value = 0;
    master.connect(actx.destination);

    // music: the <audio> element routed through Web Audio (volume works on iOS too)
    var musicGain = actx.createGain();
    musicGain.gain.value = SOUND.musicLevel;
    actx.createMediaElementSource(music).connect(musicGain);
    musicGain.connect(master);

    // ambience loops start silent and are faded by tickSound()
    SOUND.ambience.forEach(function (a) {
      var g = actx.createGain();
      g.gain.value = 0;
      g.connect(master);
      var loop = { def: a, gain: g };
      loops.push(loop);
      loadBuffer(a.file).then(function (buf) {
        if (!buf) return;
        var src = actx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        src.connect(g);
        src.start();
      });
    });
    SOUND.oneShots.forEach(function (o) { loadBuffer(o.file); });
    return true;
  }

  function playOnce(def) {
    loadBuffer(def.file).then(function (buf) {
      if (!buf || !soundOn) return;
      var src = actx.createBufferSource();
      var g = actx.createGain();
      g.gain.value = def.level;
      src.buffer = buf;
      src.connect(g);
      g.connect(master);
      src.start();
    });
  }

  function trapezoid(t, shape) {
    var a = segTime(shape[0]), b = segTime(shape[1]), c = segTime(shape[2]), d = segTime(shape[3]);
    if (t <= a || t > d + 0.001 && d > c) return 0;
    if (t < b) return (t - a) / Math.max(0.001, b - a);
    if (t <= c) return 1;
    return Math.max(0, 1 - (t - c) / Math.max(0.001, d - c));
  }

  // called every animation frame with the film time currently on screen
  function tickSound(t) {
    if (!actx || !soundOn || !segs.length) { lastSoundTime = t; return; }
    var now = actx.currentTime;

    loops.forEach(function (l) {
      l.gain.gain.setTargetAtTime(l.def.level * trapezoid(t, l.def.shape), now, 0.12);
    });

    if (lastSoundTime !== null && lastSoundTime !== t) {
      var lo = Math.min(lastSoundTime, t), hi = Math.max(lastSoundTime, t);
      // ignore big jumps (rail clicks, restart) so we don't fire a burst of sounds
      if (hi - lo < 3) {
        SOUND.oneShots.forEach(function (o, i) {
          var at = segTime(o.at);
          if (at > lo && at <= hi && !(cueCooldown[i] > performance.now())) {
            cueCooldown[i] = performance.now() + 1500;
            playOnce(o);
          }
        });
      }
    }
    lastSoundTime = t;
  }

  function setSound(on) {
    soundOn = on;
    soundBtn.setAttribute("aria-pressed", String(on));
    soundBtn.textContent = on ? "Turn sound off" : "Turn sound on";
    if (on) {
      if (!actx && !initAudio()) { soundBtn.hidden = true; return; }
      actx.resume();
      music.play().catch(function () {});
      master.gain.cancelScheduledValues(actx.currentTime);
      master.gain.setTargetAtTime(1, actx.currentTime, 0.4);
    } else if (actx) {
      master.gain.cancelScheduledValues(actx.currentTime);
      master.gain.setTargetAtTime(0, actx.currentTime, 0.25);
      setTimeout(function () { if (!soundOn) music.pause(); }, 1200);
    }
  }

  soundBtn.addEventListener("click", function () {
    setSound(soundBtn.getAttribute("aria-pressed") !== "true");
  });
  music.addEventListener("error", function () { soundBtn.hidden = true; });

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  buildTimeline(0);
  layout();

  window.addEventListener("resize", function () {
    // ignore height-only resizes on touch (URL bar show/hide) to avoid jumps
    if (isTouch && window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    layout();
  });

  if (reduced) {
    finishLoading();
  } else {
    loadVideo().catch(function (err) {
      // Fall back to the stills so the story still works
      console.error(err);
      document.body.classList.add("reduced");
      reduced = true;
      finishLoading();
    });
  }

  requestAnimationFrame(tick);
})();
