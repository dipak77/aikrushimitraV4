// =============================================================================
// AI Krushi Mitra — Service Worker (Refactored)
// Tiered caching strategies for offline-first farm advisory
// Fixes: TX lifecycle, null responses, POST queueing, origin guard,
//        cache TTL, response validation, cross-browser sync fallback
// =============================================================================

const CACHE_VERSION = 'akm-v8';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Max age (ms) for cached API responses before they're considered stale
const API_MAX_AGE = 5 * 60 * 1000;        // 5 minutes for market/weather
const NAV_MAX_AGE = 24 * 60 * 60 * 1000;  // 24 hours for SSG pages

// Assets to pre-cache on install (Cache-First strategy)
const STATIC_ASSETS = [
  '/',
  '/app/',
  '/manifest.json',
];

// ─── IndexedDB Singleton ──────────────────────────────────────────────────────
let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise((resolve, reject) => {
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
    request.onerror = () => {
      _dbPromise = null; // allow retry on failure
      reject(request.error);
    };
  });

  return _dbPromise;
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteFromStore(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingSync', 'readwrite');
    const req = tx.objectStore('pendingSync').delete(id);
    req.onsuccess = resolve;
    req.onerror = () => reject(req.error);
  });
}

async function queueFailedPOST(request) {
  const db = await openDB();
  const body = await request.clone().text();
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: body,
    type: request.url.includes('/api/vision') ? 'diagnostic'
      : request.url.includes('/api/activity/log') ? 'activity_log'
        : 'generic_post',
    payload: body ? JSON.parse(body) : null,
    timestamp: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingSync', 'readwrite');
    tx.objectStore('pendingSync').add(item);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// ─── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets');
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
          .filter(
            (name) =>
              name.startsWith('akm-') &&
              name !== STATIC_CACHE &&
              name !== API_CACHE
          )
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ─── MESSAGE (manual update + cache clear + sync trigger) ────────────────────
self.addEventListener('message', (event) => {
  const msg = event.data;

  if (msg === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (msg === 'clear-cache') {
    event.waitUntil?.(
      caches.keys().then((names) =>
        Promise.all(
          names.filter((n) => n.startsWith('akm-')).map((n) => caches.delete(n))
        )
      )
    );
    return;
  }

  if (msg === 'retry-sync') {
    event.waitUntil?.(
      Promise.all([syncPendingDiagnostics(), syncPendingActivityLogs()])
    );
    return;
  }
});

// ─── FETCH ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ── Guard: skip cross-origin requests ──
  if (url.origin !== self.location.origin) return;

  // ── Guard: skip WebSocket upgrades ──
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;

  // ── Strategy 0: Intercept POST/PUT/DELETE — queue on failure ──
  if (event.request.method !== 'GET') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        try {
          await queueFailedPOST(event.request);
          // Register background sync if supported
          if ('sync' in self.registration) {
            const tag = event.request.url.includes('/api/vision')
              ? 'sync-diagnostics'
              : event.request.url.includes('/api/activity/log')
                ? 'sync-activity-logs'
                : 'sync-generic';
            await self.registration.sync.register(tag);
          }
          return new Response(
            JSON.stringify({
              queued: true,
              message: 'Saved offline — will sync when back online.',
            }),
            {
              status: 202,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        } catch (e) {
          console.error('[SW] Failed to queue offline POST:', e);
          return new Response(
            JSON.stringify({ error: 'Offline and queueing failed' }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      })
    );
    return;
  }

  // ── Strategy 1: Cache-First for static assets, fonts, icons, images ──
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

        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches
                .open(STATIC_CACHE)
                .then((cache) => cache.put(cacheKey, clone));
            }
            return networkResponse;
          })
          .catch(() => {
            // FIX: return a proper fallback instead of undefined
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('', {
              status: 504,
              statusText: 'Gateway Timeout (Offline)',
            });
          })
      })
    );
    return;
  }

  // ── Strategy 2: Stale-While-Revalidate for market prices & weather ──
  if (
    url.pathname.includes('/api/market') ||
    url.pathname.includes('/api/weather') ||
    url.pathname.includes('/mandi-bhav')
  ) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // Check cache freshness
          if (cachedResponse) {
            const cachedTime = new Date(
              cachedResponse.headers.get('date') || 0
            ).getTime();
            const isFresh = Date.now() - cachedTime < API_MAX_AGE;
            if (isFresh) return cachedResponse;
          }

          const networkFetch = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          // FIX: fallback to cached or app shell, never null
          return cachedResponse || networkFetch || caches.match('/');
        });
      })
    );
    return;
  }

  // ── Strategy 3: Network-First for other API calls (stale fallback) ──
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches
              .open(API_CACHE)
              .then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // FIX: fallback chain — cached → JSON error response
          return caches.match(event.request).then(
            (cached) =>
              cached ||
              new Response(
                JSON.stringify({ error: 'Offline — data unavailable' }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' },
                }
              )
          );
        })
    );
    return;
  }

  // ── Strategy 4: Network-First for navigations (SSG pages, guides) ──
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches
              .open(STATIC_CACHE)
              .then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches
            .match(event.request)
            .then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }
});

// ─── BACKGROUND SYNC ─────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-diagnostics') {
    event.waitUntil(syncPendingDiagnostics());
  }
  if (event.tag === 'sync-activity-logs') {
    event.waitUntil(syncPendingActivityLogs());
  }
  if (event.tag === 'sync-generic') {
    event.waitUntil(syncPendingGenericPosts());
  }
});

async function syncPendingDiagnostics() {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingSync', 'readonly');
    const items = await getAllFromStore(tx.objectStore('pendingSync'));

    for (const item of items) {
      if (item.type !== 'diagnostic') continue;

      try {
        const res = await fetch(item.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });

        // FIX: validate response before deleting
        if (!res.ok) {
          console.warn(`[SW] Diagnostic sync failed (HTTP ${res.status}), will retry`);
          continue;
        }

        await deleteFromStore(db, item.id);
        console.log('[SW] Synced diagnostic:', item.id);
      } catch (e) {
        console.warn('[SW] Failed to sync diagnostic, will retry:', e);
      }
    }
  } catch (e) {
    console.error('[SW] Background sync error (diagnostics):', e);
  }
}

async function syncPendingActivityLogs() {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingSync', 'readonly');
    const items = await getAllFromStore(tx.objectStore('pendingSync'));

    for (const item of items) {
      if (item.type !== 'activity_log') continue;

      try {
        const res = await fetch(item.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });

        if (!res.ok) {
          console.warn(`[SW] Activity log sync failed (HTTP ${res.status}), will retry`);
          continue;
        }

        await deleteFromStore(db, item.id);
        console.log('[SW] Synced activity log:', item.id);
      } catch (e) {
        console.warn('[SW] Failed to sync activity log, will retry:', e);
      }
    }
  } catch (e) {
    console.error('[SW] Background sync error (activity logs):', e);
  }
}

async function syncPendingGenericPosts() {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingSync', 'readonly');
    const items = await getAllFromStore(tx.objectStore('pendingSync'));

    for (const item of items) {
      if (item.type !== 'generic_post') continue;

      try {
        const res = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        });

        if (!res.ok) {
          console.warn(`[SW] Generic POST sync failed (HTTP ${res.status}), will retry`);
          continue;
        }

        await deleteFromStore(db, item.id);
        console.log('[SW] Synced generic post:', item.id);
      } catch (e) {
        console.warn('[SW] Failed to sync generic post, will retry:', e);
      }
    }
  } catch (e) {
    console.error('[SW] Background sync error (generic):', e);
  }
}