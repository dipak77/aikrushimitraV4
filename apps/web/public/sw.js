// =============================================================================
// AI Krushi Mitra — Service Worker (system-context.md §4)
// Tiered caching strategies for offline-first farm advisory
// =============================================================================

const CACHE_VERSION = 'akm-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Assets to pre-cache on install (Cache-First strategy)
const STATIC_ASSETS = [
  '/',
  '/app/',
  '/manifest.json',
];

// ─── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 SW: Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('akm-') && name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log(`🗑️ SW: Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ─── FETCH ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests (chat, vision POST calls are queued by offlineDb)
  if (event.request.method !== 'GET') return;

  // Skip WebSocket upgrade requests
  if (url.pathname.startsWith('/ws/')) return;

  // ── Strategy 1: Cache-First for static assets, fonts, icons, crop images ──
  const isAppPath = url.pathname === '/app' || url.pathname === '/app/';
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|svg|png|jpg|jpeg|webp|ico)$/) ||
    url.pathname === '/' ||
    isAppPath
  ) {
    const cacheKey = isAppPath ? '/app/' : event.request;
    event.respondWith(
      caches.match(cacheKey).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(cacheKey, responseClone));
          }
          return networkResponse;
        });
      }).catch(() => {
        // Fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
    );
    return;
  }

  // ── Strategy 2: Stale-While-Revalidate for market prices and weather ──
  if (
    url.pathname.includes('/api/market') ||
    url.pathname.includes('/api/weather') ||
    url.pathname.includes('/mandi-bhav')
  ) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const networkFetch = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || networkFetch;
        });
      })
    );
    return;
  }

  // ── Strategy 3: Network-First for API calls (with stale fallback) ──
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(API_CACHE).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // ── Strategy 4: Network-first for SSG pages (crop guides, disease guides) ──
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }
});

// ─── BACKGROUND SYNC (offline-strategy.md §2) ───────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-diagnostics') {
    event.waitUntil(syncPendingDiagnostics());
  }
  if (event.tag === 'sync-activity-logs') {
    event.waitUntil(syncPendingActivityLogs());
  }
});

async function syncPendingDiagnostics() {
  try {
    // Open IndexedDB and read pending items
    const db = await openDB();
    const tx = db.transaction('pendingSync', 'readonly');
    const store = tx.objectStore('pendingSync');
    const items = await getAllFromStore(store);

    for (const item of items) {
      if (item.type === 'diagnostic') {
        try {
          await fetch('/api/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          });
          // Remove from pending queue on success
          const deleteTx = db.transaction('pendingSync', 'readwrite');
          deleteTx.objectStore('pendingSync').delete(item.id);
        } catch (e) {
          console.warn('SW: Failed to sync diagnostic, will retry:', e);
        }
      }
    }
  } catch (e) {
    console.error('SW: Background sync error:', e);
  }
}

async function syncPendingActivityLogs() {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingSync', 'readonly');
    const store = tx.objectStore('pendingSync');
    const items = await getAllFromStore(store);

    for (const item of items) {
      if (item.type === 'activity_log') {
        try {
          await fetch('/api/activity/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          });
          const deleteTx = db.transaction('pendingSync', 'readwrite');
          deleteTx.objectStore('pendingSync').delete(item.id);
        } catch (e) {
          console.warn('SW: Failed to sync activity log, will retry:', e);
        }
      }
    }
  } catch (e) {
    console.error('SW: Background sync error:', e);
  }
}

// ─── IndexedDB Helpers ───────────────────────────────────────────────────────
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('akm_offline_db', 2);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingSync')) {
        db.createObjectStore('pendingSync', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('conversationCache')) {
        db.createObjectStore('conversationCache', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
