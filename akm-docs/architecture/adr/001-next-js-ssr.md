# Architectural Decision Record — Next.js SSR Hybrid App

## Context & Problem
We require high search engine rankings for localized agricultural search queries (like Mandi Bhav and crop diseases) to scale organic acquisition. Client-Side Rendered (CSR) Single-Page Applications (like our legacy React SPA dashboard) do not load quickly enough for Google's crawlers, resulting in poor crawl budgets and low index coverage.

## Proposed Strategy
Split the architecture into a hybrid rendering framework:
1.  **Next.js (App Router):** Serve all programmatic SEO landing pages (weather blocks, mandi bhav details, static pages) via Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR).
2.  **React SPA:** Mount the interactive dashboard (disease detection, chat, soil reports) at `/app/` as a client-side dashboard to maintain high performance.

## Consequences
*   **Pros:** Outstanding Core Web Vitals (LCP < 1.5s), immediate indexing of over 200+ programmatic SEO routes on search engines.
*   **Cons:** Dual rendering frameworks to compile and deploy. Managed by configuring static export rules in `next.config.js` for hosting.
