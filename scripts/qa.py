"""Playwright check for the scroll page.

Serves the repo, loads the page, scrolls forward and backward through the
journey, and records screenshots + video.currentTime at each stop so the
scroll -> timeline mapping can be verified.

Usage: python3 scripts/qa.py [--reduced] [--mobile]
"""
import http.server, socketserver, threading, sys, json, os, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "raw", "qa")
os.makedirs(OUT, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass

Handler = functools.partial(Quiet, directory=ROOT)
httpd = socketserver.TCPServer(("127.0.0.1", 0), Handler)
port = httpd.server_address[1]
threading.Thread(target=httpd.serve_forever, daemon=True).start()

reduced = "--reduced" in sys.argv
mobile = "--mobile" in sys.argv
tag = ("reduced-" if reduced else "") + ("mobile-" if mobile else "")

with sync_playwright() as p:
    browser = p.chromium.launch()
    vp = {"width": 390, "height": 844} if mobile else {"width": 1440, "height": 900}
    page = browser.new_page(viewport=vp, reduced_motion="reduce" if reduced else "no-preference")
    errors = []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(f"http://127.0.0.1:{port}/index.html")
    if not reduced:
        page.wait_for_selector(".stage.is-ready, body.reduced", state="attached", timeout=60000)
    page.wait_for_timeout(500)

    results = []
    stops = [0, 0.05, 0.12, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.97, 1.0, 0.5, 0.1]
    for i, s in enumerate(stops):
        page.evaluate("s => window.scrollTo(0, s * (document.documentElement.scrollHeight - innerHeight))", s)
        page.wait_for_timeout(900)
        info = page.evaluate("""() => {
            const v = document.querySelector('.stage__video');
            const vis = [...document.querySelectorAll('.entry')].map(e => +getComputedStyle(e).opacity);
            return {
              time: +v.currentTime.toFixed(3), duration: v.duration,
              seekableEnd: v.seekable.length ? v.seekable.end(0) : 0,
              entries: vis.map(x => +x.toFixed(2)),
              rail: [...document.querySelectorAll('.rail__item')].findIndex(li => li.classList.contains('is-current')),
              finale: document.querySelector('.finale').classList.contains('is-visible')
            };
        }""")
        info["stop"] = s
        results.append(info)
        page.screenshot(path=os.path.join(OUT, f"{tag}{i:02d}-{int(s*100):03d}.png"))
    print(json.dumps(results, indent=1))
    print("console errors:", errors)
    browser.close()
httpd.shutdown()
