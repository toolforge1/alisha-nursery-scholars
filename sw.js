const CACHE = "alisha-nursery-scholars-v17";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const isPage = event.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
    if (isPage) {
      try {
        const response = await fetch(event.request, { cache: "no-store" });
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put("./index.html", copy));
        }
        return response;
      } catch (_) {
        return (await caches.match("./index.html")) || Response.error();
      }
    }
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    } catch (_) {
      return (await caches.match("./index.html")) || Response.error();
    }
  })());
});