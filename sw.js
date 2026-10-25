/* Codepfad Service Worker: lädt die App zuerst aus dem Netz (damit Updates sofort ankommen)
   und fällt offline auf den Zwischenspeicher zurück. Bei jeder Änderung CACHE erhöhen. */
const CACHE = "codepfad-v1";
const CORE = [
  "./", "index.html", "styles.css", "app.js", "manifest.webmanifest",
  "lessons/_base.js", "lessons/c.js", "lessons/py.js", "lessons/js.js",
  "c-worker.js", "js-worker.js",
  "vendor/picoc.js", "vendor/skulpt.min.js", "vendor/skulpt-stdlib.js", "vendor/jscpp.min.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (e) => { if (e.data === "skip") self.skipWaiting(); });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !isFont) return;
  const big = url.pathname.includes("/vendor/") || isFont;
  if (big) {
    // große, selten geänderte Dateien: erst Zwischenspeicher
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html"))));
});
