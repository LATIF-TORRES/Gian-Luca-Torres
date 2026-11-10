/* Service Worker: macht A&T installierbar und lädt die App schneller.
   Netzwerk zuerst, damit Updates sofort ankommen; ohne Netz aus dem Zwischenspeicher.
   Anfragen an die KI (Google, Anthropic) laufen nie über den Zwischenspeicher. */
var NAME = "a-und-t-v19";
var DATEIEN = ["./", "index.html", "manifest.webmanifest", "css/style.css",
  "js/lib/marked.min.js", "js/lib/purify.min.js", "js/daten.js", "js/speicher.js", "js/halal-welt.js", "js/depot.js", "js/yuh.js", "js/ki.js",
  "js/gemini.js", "js/lokal.js", "js/stimme.js", "js/einrichtung.js", "js/wissen.js", "js/export.js", "js/import.js", "js/rat.js", "js/akhi.js", "js/neuigkeiten.js", "js/app.js", "a-und-t-192.png", "a-und-t-512.png"];

self.addEventListener("install", function (ev) {
  ev.waitUntil(caches.open(NAME).then(function (c) { return c.addAll(DATEIEN); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (ev) {
  ev.waitUntil(caches.keys().then(function (alle) {
    return Promise.all(alle.filter(function (k) { return k !== NAME; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (ev) {
  var url = new URL(ev.request.url);
  if (ev.request.method !== "GET" || url.origin !== location.origin) return;
  ev.respondWith(fetch(ev.request).then(function (antwort) {
    var kopie = antwort.clone();
    caches.open(NAME).then(function (c) { c.put(ev.request, kopie); });
    return antwort;
  }).catch(function () { return caches.match(ev.request); }));
});
