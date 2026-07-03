# AI Krushi Mitra — Sprint Backlog Roadmap

> **Version:** 3.0 | **Status:** Approved | **Owner:** Product Owner  
> **Last Updated:** 2026-07-01

---

## 1. Complete Roadmap Breakdown

```mermaid
gantt
    title AI Krushi Mitra Rollout Schedule
    dateFormat  YYYY-MM-DD
    
    section Phase 1: MVP Coding
    Sprint 1: Core Layout UI              :done, 2026-06-01, 2026-06-07
    Sprint 2: RAG Backend & Prompts      :done, 2026-06-08, 2026-06-14
    Sprint 3: Voice & Schemes API         :done, 2026-06-15, 2026-06-21
    Sprint 4: Views dynamic integration   :done, 2026-06-22, 2026-06-28

    section Phase 2: Pilot Rollout
    Onboarding & OTP login                :done, 2026-06-29, 2026-07-05
    Offline Caching & Sync Queue          :done, 2026-07-06, 2026-07-12
    User Feedback & Prompt Tuning         :done, 2026-07-13, 2026-07-20
    SMS & Network Integration             :done, 2026-07-21, 2026-07-30

    section Phase 3: Growth & Monetization (P1 & P2)
    Sprint 5: Soil & Yield Estimators     :active, 2026-08-01, 2026-08-15
    Sprint 6: Community & Pest Alerts     : 2026-08-16, 2026-08-30
    Sprint 7: FPO SaaS & Premium Advisors : 2026-09-01, 2026-09-15

    section Phase 4: Innovation (P3)
    Sprint 8: Drone & IoT Dashboards      : 2026-09-16, 2026-09-30
    Sprint 9: NDVI Satellite & Ledger     : 2026-10-01, 2026-10-15

    section Phase 9: Hardening & Action Plan
    Sprint 23: Security & Critical       :active, 2026-07-01, 2026-07-15
    Sprint 24: Backend & Observability    : 2026-07-16, 2026-07-30
    Sprint 25: DB & RAG Enhancements     : 2026-08-01, 2026-08-15
    Sprint 26: Soil, Yield & i18n        : 2026-08-16, 2026-08-30
```

---

## 2. Sprint Backlog Details

### 🟢 Phase 1: MVP Coding (Complete)
*   **Sprint 1: Core Layout UI**
    *   *Reference:* [brand-identity.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/design-system/brand-identity.md), [design-tokens.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/design-system/design-tokens.md)
    *   *Deliverables:* Establish bento layout grid, color tokens, and primary styles in `index.css`.
*   **Sprint 2: RAG Backend & Prompts**
    *   *Reference:* [pipeline-architecture.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/rag/pipeline-architecture.md), [prompt-library.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/ai/prompt-library.md)
    *   *Deliverables:* Set up TF-IDF keyword lookup, cosine vector similarities matching `gemini-2.5-flash` model structure.
*   **Sprint 3: Voice & Schemes API**
    *   *Reference:* [api-contracts.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/api-contracts.md), [content-types.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/content/content-types.md)
    *   *Deliverables:* Integrate live schemes fetching matching language contexts.
*   **Sprint 4: Views Dynamic Integration**
    *   *Reference:* [database-schema.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/database-schema.md)
    *   *Deliverables:* Implement dynamic Firestore service mapping crops, calendars, and APMC market prices.

### 🟢 Phase 2: Pilot Rollout (Complete)
*   **Sprint 5a: Onboarding & OTP Login**
    *   *Reference:* [auth-model.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/auth-model.md), [personas.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/personas.md)
    *   *Deliverables:* Created 10-digit phone login layout, 30s count-down timer, and dynamic multilingual onboarding slide wizard.
*   **Sprint 5b: Offline Caching & Sync Queue**
    *   *Reference:* [offline-strategy.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/offline-strategy.md)
    *   *Deliverables:* Created browser IndexedDB offline caches (`weather_cache`, `mandi_cache`) and `diagnostic_queue` auto-uploading scans on online restore.
*   **Sprint 5c: Text Chat & Output Filters**
    *   *Reference:* [prompt-library.md (Section 3 disclaimers)](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/ai/prompt-library.md)
    *   *Deliverables:* Configured output filtering appending relevant disclaimers for scheme compliance and price forecasts.
*   **Sprint 5d: CI/CD Pipeline Automation**
    *   *Reference:* [ci-cd-pipeline.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/devops/ci-cd-pipeline.md)
    *   *Deliverables:* Configured GitHub Actions lint, test, build, and deploy steps.

### 🔵 Phase 3: Growth & Monetization (Upcoming)
*   **Sprint 5: Soil & Yield Estimators**
    *   *Reference:* [feature-hierarchy.md (P1 - Soil & Yield)](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/feature-hierarchy.md), [api-contracts.md](/c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/api-contracts.md#L45-L60)
    *   *Deliverables:* Connect Soil NPK analysis slider parameters to dynamic advisory recommendations.
*   **Sprint 6: Community & Pest Alerts**
    *   *Reference:* [feature-hierarchy.md (P1 - Community)](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/feature-hierarchy.md), [database-schema.md (Section 2.2 Alerts)](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/database-schema.md)
    *   *Deliverables:* Set up farmer Q&A community boards and push-triggered local pest outbreak alerts.
*   **Sprint 7: FPO SaaS & Premium Advisors**
    *   *Reference:* [monetization.md (P2 features)](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/monetization.md), [business-model.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/business-model.md)
    *   *Deliverables:* Launch subscription gateway (Premium advisory) and FPO cooperative dashboard aggregate reports.

### 🟡 Phase 4: Innovation (Complete)
*   **Sprint 8: Drone & IoT Dashboards**
    *   *Reference:* [feature-hierarchy.md (P3 features)](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/feature-hierarchy.md)
    *   *Deliverables:* Set up telemetry streams for soil moisture/pH IoT sensors and DJI drone visual diagnostics overlays.
*   **Sprint 9: NDVI Satellite & Ledger**
    *   *Reference:* [ontology.md (Knowledge graph dependencies)](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/knowledge-graph/ontology.md)
    *   *Deliverables:* Implement Sentinel-2 satellite imagery indexes and block-chain crop provenance traceability ledger.

### 🔴 Phase 5: Architecture Hardening (Complete)

> **Goal:** Close every gap between the architecture specification `.md` files and the actual codebase. Each sprint maps to one or more architecture documents.

*   **Sprint 10: API Contracts & Rate Limiting** *(api-contracts.md + system-context.md §3.1)*
    *   *Reference:* [api-contracts.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/api-contracts.md), [system-context.md §3-5](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/system-context.md)
*   **Sprint 11: Firestore Security Rules & Database Schema** *(database-schema.md + auth-model.md)*
    *   *Reference:* [database-schema.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/database-schema.md), [auth-model.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/auth-model.md)
*   **Sprint 12: Error Handling & Performance Budgets** *(system-context.md §5-6)*
    *   *Reference:* [system-context.md §5 Error Handling](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/system-context.md), [system-context.md §6 Performance](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/system-context.md)
*   **Sprint 13: Offline Service Worker & Sync Queue** *(offline-strategy.md + system-context.md §4)*
    *   *Reference:* [offline-strategy.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/offline-strategy.md), [system-context.md §4 Offline Architecture](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/system-context.md)
*   **Sprint 14: Deployment Topology & ADR Compliance** *(deployment-topology.md + adr/*.md)*
    *   *Reference:* [deployment-topology.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/deployment-topology.md)

### 🟣 Phase 6: Design System Implementation (Complete)

> **Goal:** Synchronize core design tokens, accessibility specs (WCAG 2.1 AAA), and brand guidelines across the UI.

*   **Sprint 15: Design Tokens & CSS Architecture** *(design-tokens.md)*
    *   *Reference:* [design-tokens.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/design-system/design-tokens.md)
*   **Sprint 16: Rural Accessibility & Brand Tone** *(accessibility.md + brand-identity.md)*
    *   *Reference:* [accessibility.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/design-system/accessibility.md), [brand-identity.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/design-system/brand-identity.md)

### 🟢 Phase 7: Product Strategy & User Journeys (Complete)

> **Goal:** Validate end-to-end product flows for all 5 personas and monetize services cleanly.

*   **Sprint 17: Persona Workflows & Feature Hierarchy** *(personas.md + feature-hierarchy.md + user-journeys.md)*
    *   *Reference:* [personas.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/personas.md), [feature-hierarchy.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/feature-hierarchy.md), [user-journeys.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/user-journeys.md)
*   **Sprint 18: Monetization & Business Model Integration** *(business-model.md + monetization.md + vision.md)*
    *   *Reference:* [business-model.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/business-model.md), [monetization.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/monetization.md), [vision.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/vision.md)

### 💙 Phase 8: Product Roadmap Completion & Resiliency (Complete)

> **Goal:** Finalize platform resilience, verify AI/RAG limits, risk mitigation matrices, and CI/CD pipelines across all remaining documentation.

*   **Sprint 19: AI & RAG Pipeline Optimization** *(memory-strategy.md + prompt-library.md + pipeline-architecture.md)*
    *   *Reference:* [memory-strategy.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/ai/memory-strategy.md), [prompt-library.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/ai/prompt-library.md)
*   **Sprint 20: Knowledge Graph & Content Localization** *(ontology.md + content-types.md + localization.md)*
    *   *Reference:* [ontology.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/knowledge-graph/ontology.md), [localization.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/content/localization.md)
*   **Sprint 21: Risk Mitigation & System Resiliency** *(risk-register.md)*
    *   *Reference:* [risk-register.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/roadmap/risk-register.md)
*   **Sprint 22: DevOps CI/CD & Programmatic SEO** *(ci-cd-pipeline.md + rendering-strategy.md)*
    *   *Reference:* [ci-cd-pipeline.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/devops/ci-cd-pipeline.md), [rendering-strategy.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/seo/rendering-strategy.md)

### 🔴 Phase 9: Hardening & Action Plan (Active)

> **Goal:** Address all security vulnerabilities, modularize the monolith server, migrate static knowledge to database, improve RAG pipeline metadata/retrieval, and implement next phase features.

*   **Sprint 23: Security & Critical Hardening (COMPLETED)**
    *   *Reference:* [implementation_plan.md](file:///C:/Users/haran/.gemini/antigravity-ide/brain/5130362a-eb9f-4e2f-9da3-df21195a6808/implementation_plan.md)
    *   *Deliverables:* Remove exposed client-side API keys in Vite and Express serving layer. Add rate limiting to AI routes, verify React Error Boundaries, and create `.env.local.example`.
*   **Sprint 24: Backend Refactoring & Observability (COMPLETED)**
    *   *Reference:* [system-context.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/system-context.md)
    *   *Deliverables:* Modularize `server.js` (extract routes, socket, and logs). Setup `winston` structured logging, error handling, strict TS checks, and API docs.
*   **Sprint 25: Database Migration & RAG Enhancements (COMPLETED)**
    *   *Reference:* [pipeline-architecture.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/rag/pipeline-architecture.md)
    *   *Deliverables:* Migrate crops, schemes, and markets data to Firestore. Implement RAG metadata, hybrid search, citation tracking, and service worker offline caching.
*   **Sprint 26: Next Feature Works & UX Optimization (COMPLETED)**
    *   *Reference:* [feature-hierarchy.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/product/feature-hierarchy.md)
    *   *Deliverables:* 
        *   **Firestore Support Tickets**: Integrated client-side save and update actions storing Support Tickets in Firestore (`supportTickets` collection) with full message history.
        *   **Dynamic Chat Handlers**: Made Support widget skip the contact form and direct-ask questions for logged-in users, pre-populating their names and emails.
        *   **Google Auth Default & Login Cleanup**: Passed through the client-side Google Client ID in Next.js build-time configs, and disabled the mock phone login layout to keep as a future backlog task.
*   **Sprint 27: Real Mobile OTP Authentication (Backlog)**
    *   *Reference:* [auth-model.md](file:///c:/Users/haran/source/repos/aikrushimitraV4/akm-docs/architecture/auth-model.md)
    *   *Deliverables:* Connect login flows to a real SMS provider or Firebase Phone Authentication gateway for actual mobile OTP verifications.



