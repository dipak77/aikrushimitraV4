# AI Krushi Mitra — Offline-First & Sync Strategy

> **Version:** 1.0 | **Status:** Approved | **Owner:** Technical Architect  
> **Last Updated:** 2026-06-28

---

## 1. Local Cache Storage Matrix

| Data Class | Local Tech | Cache TTL | Sync Mechanism |
|------------|------------|-----------|----------------|
| **User Profile** | `localStorage` | Infinite (Session) | Sync on connection change |
| **Market Prices** | `IndexedDB` (Zustand) | 4 Hours | Fetch fresh APMC indices |
| **Weather Forecast** | `IndexedDB` (Zustand) | 1 Hour | Force reload if coordinate shifts |
| **Agri-Insights (RAG)**| Service Worker cache | 7 Days | Background service worker reload |
| **Leaf-scan diagnostics**| `IndexedDB` | 30 Days | Cache locally first, upload diagnostic logs on network restoration |

---

## 2. Sync Logic (Offline Queue)

```
[User takes Action (e.g., Scan leaf)]
               │
      [Check Internet]
        ├── YES ──► POST to /api/vision ──► Render results & upload logs
        └── NO  ──► Save image in IndexedDB ──► Queue upload task
                                                        │
                                            [Wait for Online event]
                                                        │
                                            Upload queued tasks in background
```
