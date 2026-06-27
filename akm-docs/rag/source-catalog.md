# AI Krushi Mitra — RAG Source Catalog

> **Version:** 1.0 | **Status:** Approved | **Owner:** Agronomist Partner  
> **Last Updated:** 2026-06-28

---

## 1. Verified Agricultural Sources

| Code | Source Name | Category | Primary Crops | Access Protocol |
|------|-------------|----------|---------------|-----------------|
| **ICAR-01** | Indian Council of Agricultural Research | Crop Cultivation Guides | Soybean, Cotton, Paddy | Static JSON import |
| **KVK-MH** | Krishi Vigyan Kendra (Maharashtra) | Regional Pest alerts | Onions, Grapes | Daily web scrape |
| **APMC-IN** | Agmarknet (Ministry of Agriculture) | Market Mandi Prices | All commercial grains | REST API (15-min TTL) |
| **IMD-MH** | Indian Meteorological Department | Weather Forecasts | All crops | OpenWeather proxy |

---

## 2. Ingestion pipeline ingestion rules

To prevent incorrect or unverified advice:
1.  **Peer Review:** No document is loaded into the embedding index without verification from an agronomist.
2.  **No Scraping Forums:** Self-published farmer forum comments are excluded from indexation (prevents misinformation propagation).
3.  **Strict MSP Checks:** Minimum Support Price parameters are updated directly from central government gazette notifications.
