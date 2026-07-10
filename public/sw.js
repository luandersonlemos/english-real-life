/* EBRL v2 — service worker leve: só habilita instalação PWA, sem cache agressivo */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Necessário para PWA no Chrome — não intercepta rede (evita tela carregando infinito)
self.addEventListener("fetch", () => {});
