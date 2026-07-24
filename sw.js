// Service worker sederhana: hanya menyimpan cache untuk file aplikasi
// (HTML/manifest/ikon) supaya aplikasi tetap bisa dibuka walau tidak ada
// internet. TIDAK menyimpan cache untuk data (itu tetap lewat Google Sheets
// / Apps Script secara langsung, harus online untuk sinkron).
const CACHE_NAME = 'ar-management-shell-v2';
const SHELL_FILES = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Jangan pernah cache permintaan ke Google Apps Script (data harus selalu live).
  if (url.hostname.includes('script.google.com') || url.hostname.includes('script.googleusercontent.com')) {
    return; // biarkan browser fetch langsung ke jaringan seperti biasa
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
