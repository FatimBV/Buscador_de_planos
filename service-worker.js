const CACHE_NAME = "buscador-planos-v2";
const DATA_CACHE = "buscador-planos-data-v2";

const CSV_URL = "https://raw.githubusercontent.com/FatimBV/Buscador_de_planos/main/planos.csv";

const ASSETS = [
  "./",
  "Buscador_4.html",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png"
];

// Instalación
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activación
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => 
          (key !== CACHE_NAME && key !== DATA_CACHE ? caches.delete(key) : null)
        )
      )
    )
  );
});

// FETCH: lógica especial para CSV
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Si es el CSV, aplicamos estrategia Network First + fallback cache
  if (url.includes("planos.csv")) {
    event.respondWith(
      caches.open(DATA_CACHE).then(cache =>
        fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone()); // Actualiza la caché
            return response;
          })
          .catch(() => cache.match(event.request)) // Si no hay Internet → usa versión guardada
      )
    );
    return;
  }

  // Para el resto → cache first
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});