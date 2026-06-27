# AI Krushi Mitra — Risk Register & Mitigation Strategy

> **Version:** 1.0 | **Status:** Approved | **Owner:** Project Manager  
> **Last Updated:** 2026-06-28

---

## 1. Project Risk Matrix

| Risk ID | Description | Impact | Likelihood | Mitigation Strategy |
|---------|-------------|--------|------------|---------------------|
| **R-01**| Low network bandwidth prevents vision scans | High | High | Compress images client-side before upload; queue diagnosis requests offline in IndexedDB. |
| **R-02**| AI model hallucination recommends wrong pesticide dosage | Critical | Medium | Ground model strictly on reviewed RAG catalog; add disclaimer to consult local block agronomists. |
| **R-03**| APMC prices data stream breaks due to API changes | High | Low | Scrape state mandi fallback sites; cache last known prices with visible age tag. |
| **R-04**| Gemini API quotas are exhausted under heavy traffic | Medium | Medium | Implement Redis cache layer for identical search queries; scale API rate limiting on users. |
