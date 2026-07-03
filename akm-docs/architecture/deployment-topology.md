# AI Krushi Mitra — Deployment Topology

> **Version:** 1.0 | **Status:** Approved | **Owner:** DevOps Engineer  
> **Last Updated:** 2026-06-28

---

## 1. Network Topology Diagram

```mermaid
graph TD
    Client["Farmer Mobile Device (Redmi 9A)"]
    CDN["Firebase CDN (Global Edge)"]
    DB["Cloud Firestore (Mumbai Region)"]
    Backend["Node.js Express Server (server.js on Google App Engine)"]
    Gemini["Google Gemini AI Platform"]
    APMC["Government APMC Portal (Data Scraping)"]

    Client -- HTTPS (SPA Assets) --> CDN
    Client -- Real-time Sync (IndexedDB) --> DB
    Client -- WebSocket / API requests --> Backend
    Backend -- Vector Searches / Image scan --> Gemini
    Backend -- Cache Refresh --> APMC
```

---

## 2. Infrastructure Specifications

1.  **Frontend CDN:** Firebase Hosting (handles all static SSR HTML pages and React bundle distribution).
2.  **API Backend:** Google App Engine (F1 standard instance hosting `server.js` Node.js server for WebSocket voice connections).
3.  **Database:** Cloud Firestore (Multi-region Mumbai location to minimize latency for Indian farmers).
4.  **Security Rules:** Whitelisted origin domains for Firebase Hosting and OAuth login APIs.
