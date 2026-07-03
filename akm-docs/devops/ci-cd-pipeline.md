# AI Krushi Mitra — DevOps, Security, QA & Analytics

> **Version:** 1.0 | **Status:** Approved  
> **Last Updated:** 2026-06-28

---

# Part 1 — DevOps (Program 9)

## 1.1 Git Workflow

```
main ──────────────────────────────────────────── Production (protected)
  │                                                 │
  │   Tag: v1.0.0, v1.1.0, etc.                   Deploy via CI/CD
  │                                                 │
  ├── develop ─────────────────────────────────── Integration
  │     │                                           │
  │     ├── feature/voice-assistant-v2 ────────── Feature branches
  │     ├── feature/rag-pipeline ──────────────── (from develop)
  │     ├── feature/mandi-price-api ───────────── 
  │     └── fix/market-price-cache ────────────── Bug fix branches
  │
  └── hotfix/critical-auth-fix ────────────────── Emergency patches
                                                    (from main, merge back)
```

**Branch Naming Convention:**
- `feature/{description}` — New features
- `fix/{description}` — Bug fixes
- `hotfix/{description}` — Emergency production patches
- `chore/{description}` — Non-functional changes (deps, CI, docs)

**Merge Rules:**
- Feature → develop: Squash merge + PR review
- develop → main: Merge commit (preserves history)
- hotfix → main: Merge commit + cherry-pick to develop

## 1.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint        # ESLint/TypeScript workspace check


  unit-tests:
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test        # Vitest

  build:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build       # Next.js build
      - uses: actions/upload-artifact@v4
        with: { name: build-output, path: out/ }

  lighthouse:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/crops/soybean/
          budgetPath: .github/lighthouse-budget.json

  security-scan:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - run: npm audit --audit-level=high
      - uses: github/codeql-action/analyze@v3

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build, lighthouse, security-scan]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          projectId: aikrushimitrav1
          channelId: staging

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production  # Requires manual approval
    steps:
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          projectId: aikrushimitrav1
          channelId: live
```

## 1.3 Environments

| Environment | URL | Purpose | Config | Deploy |
|-------------|-----|---------|--------|--------|
| **Local** | `localhost:3000` | Development | `.env.local` | `npm run dev` |
| **Preview** | `pr-{id}--aikrushimitrav1.web.app` | PR preview | `.env.staging` | Auto on PR |
| **Staging** | `staging--aikrushimitrav1.web.app` | Pre-production | `.env.staging` | Auto on main merge |
| **Production** | `aikrushimitra.in` | Live users | `.env.production` | Manual approval |

## 1.4 Monitoring & Alerting

| Signal | Tool | Alert Threshold |
|--------|------|----------------|
| Error Rate | Firebase Crashlytics | > 1% of sessions |
| API Latency (p95) | Firebase Performance | > 2 seconds |
| Build Failure | GitHub Actions | Any failure on main |
| LCP Regression | Lighthouse CI | > 2.5 seconds |
| Firestore Reads | Firebase Console | > 80% of daily quota |
| AI API Errors | Custom logging | > 5% error rate |

---

# Part 2 — Security & Compliance (Program 7)

## 2.1 Threat Model (STRIDE)

| Threat | Attack Vector | Impact | Mitigation | Priority |
|--------|--------------|--------|-----------|----------|
| **Spoofing** | Forged auth tokens | Account takeover | Firebase Auth JWT validation, token refresh | P0 |
| **Tampering** | Modified API payloads | Data corruption | Input validation (Zod schemas), Firestore rules | P0 |
| **Repudiation** | Deny abusive actions | No accountability | Immutable activity logs, audit trail | P1 |
| **Info Disclosure** | API key in client bundle | Unauthorized API usage | Server-side key management, domain restrictions | P0 |
| **DoS** | API flooding | Service unavailable | Rate limiting: 30 chat/min, 10 vision/min | P0 |
| **Elevation** | Guest accessing admin | Unauthorized access | Role-based rules in Firestore, admin claim check | P0 |
| **XSS** | Malicious chat input | Script injection | React auto-escaping, CSP headers | P0 |
| **Prompt Injection** | Jailbreaking AI | Harmful content | System prompt guardrails, output filtering | P0 |

## 2.2 Secret Management

| Secret | Storage Location | Access | Rotation |
|--------|-----------------|--------|----------|
| `GEMINI_API_KEY` | Firebase Functions config / `.env` | Server-side only | 90 days |
| Firebase Client Config | Public `firebase-applet-config.json` | Client (by design) | Never (public) |
| `GOOGLE_CLIENT_ID` | Environment variable | Client (OAuth) | Annually |
| Firebase Admin SDK key | GitHub Secrets + Cloud IAM | CI/CD pipeline only | On compromise |
| Weather API key | Firebase Functions config | Server-side only | Annually |
| APMC API credentials | Firebase Functions config | Server-side only | Per vendor terms |

## 2.3 Firestore Security Rules Principles

1. **Default deny** — Root wildcard match denies all
2. **Owner-only reads** — Users can only read their own profiles
3. **Schema validation** — Every write validates data shape and bounds
4. **Immutable audit logs** — Activity logs cannot be updated or deleted
5. **No listing** — Collection listing is denied (prevents scraping)
6. **Rate limiting** — Firestore Rules cannot rate-limit, use Cloud Functions middleware

## 2.4 Compliance

| Requirement | Implementation |
|-------------|---------------|
| **Privacy Policy** | Published at `/privacy/`, covers data collection, usage, retention |
| **Consent** | Cookie banner (analytics opt-in), profile data consent on signup |
| **Data Retention** | User data: until account deletion. Logs: 1 year active, 5 year archive |
| **Right to Deletion** | Account deletion in profile → cascade delete user data |
| **Government Data** | APMC prices are public data (Open Government Data License) |
| **Minors** | App requires 18+ self-declaration (agricultural use case) |

---

# Part 3 — Quality Engineering (Program 8)

## 3.1 Test Strategy

```
                  ┌──────────────────┐
                  │  E2E Tests (5%)  │  Playwright
                  │  Critical paths  │  4 flows
                  ├──────────────────┤
                  │  Integration     │  Firebase Emulator
                  │  Tests (15%)     │  API route tests
                  ├──────────────────┤
                  │  Unit Tests      │  Vitest
                  │  (80%)           │  React Testing Library
                  │  Components      │  ~200 tests
                  │  Services        │
                  │  Utils           │
                  └──────────────────┘
```

### Unit Tests (Vitest + React Testing Library)

| Category | Examples | Coverage Target |
|----------|---------|----------------|
| Components | Button renders, Card states, Input validation | ≥ 80% |
| Services | geminiService, analyticsService, weatherService | ≥ 90% |
| Utils | firebase.ts, audio.ts, common.ts | ≥ 95% |
| Hooks | Custom hooks (useAuth, useOffline, useVoice) | ≥ 85% |
| Store | Zustand stores (user, chat, market) | ≥ 90% |

### Integration Tests (Firebase Emulator)

| Test | Description |
|------|-------------|
| Auth flow | Google login → profile creation → session persistence |
| Chat API | Message → RAG retrieval → response → storage |
| Vision API | Image upload → diagnosis → storage |
| Market API | Price fetch → cache → display |
| Firestore rules | Write validation, read authorization, edge cases |

### E2E Tests (Playwright)

| Flow | Steps | Device |
|------|-------|--------|
| **Onboarding** | Landing → Login → Profile → Dashboard | Chrome Mobile |
| **Disease Scan** | Dashboard → Camera → Scan → Results → History | Chrome Mobile |
| **Market Check** | Dashboard → Market → Select Crop → Compare | Chrome Desktop |
| **Voice Chat** | Dashboard → Voice → Speak → Response → End | Chrome Mobile |

## 3.2 AI Evaluation Framework

| Dimension | Metric | Dataset Size | Target | Evaluator |
|-----------|--------|-------------|--------|-----------|
| **Accuracy** | % correct diagnosis/advice | 500 expert-labeled | ≥ 85% | Agricultural expert panel |
| **Hallucination** | % unsupported claims | 200 conversations | ≤ 5% | RAG grounding score |
| **Localization** | Marathi/Hindi fluency | 100 responses | ≥ 4/5 native score | Native speaker review |
| **Toxicity** | Safety classifier pass | 1,000 adversarial prompts | ≥ 99.9% safe | Automated classifier |
| **Latency** | Time to first token | Production metrics | ≤ 2s (p95) | Automated monitoring |
| **Cost** | Average tokens per session | Production metrics | ≤ $0.005 | Token counter |

## 3.3 Device/Browser Matrix

| Priority | Device | OS | Browser | Screen |
|----------|--------|-----|---------|--------|
| **P0** | Redmi 9A / Realme C series | Android 10+ | Chrome | 720×1600 |
| **P0** | Samsung Galaxy A14 | Android 12+ | Chrome, Samsung Internet | 1080×2408 |
| **P0** | Generic budget (₹7-10K) | Android 10+ | Chrome | 720×1280 |
| **P1** | iPhone SE 3rd gen | iOS 15+ | Safari | 750×1334 |
| **P1** | iPhone 12/13/14 | iOS 16+ | Safari | 1170×2532 |
| **P1** | Desktop (any) | Windows 10+ | Chrome, Edge | 1920×1080 |
| **P2** | iPad 9th gen | iPadOS 15+ | Safari | 2160×1620 |
| **P2** | Samsung Tab A8 | Android 11+ | Chrome | 1920×1200 |

---

# Part 4 — Analytics (Program 10)

## 4.1 KPI Framework

| Category | Metric | Definition | Target (90d) | Tool |
|----------|--------|-----------|-------------|------|
| **Acquisition** | MAU | Unique users in 30 days | 10,000 | GA4 |
| **Acquisition** | Organic Traffic | Search-driven visits | 50,000/mo | GSC |
| **Activation** | Registration Rate | Visitors → registered users | ≥ 30% | GA4 |
| **Activation** | Onboarding Complete | Registered → profile filled | ≥ 60% | GA4 |
| **Engagement** | Sessions/User/Week | Average weekly sessions | ≥ 3 | GA4 |
| **Engagement** | Chat Sessions/User | AI chat conversations/week | ≥ 2 | Custom |
| **Engagement** | Scans/User/Month | Disease scans per month | ≥ 4 | Custom |
| **Retention** | D1 Retention | Return after 1 day | ≥ 50% | GA4 |
| **Retention** | D7 Retention | Return after 7 days | ≥ 40% | GA4 |
| **Retention** | D30 Retention | Return after 30 days | ≥ 25% | GA4 |
| **AI Quality** | Diagnosis Accuracy | Expert-validated correct % | ≥ 85% | Eval pipeline |
| **AI Quality** | Chat Helpfulness | User "helpful" rating % | ≥ 75% | In-app feedback |
| **Performance** | LCP (p75) | Largest Contentful Paint | ≤ 2.5s | CrUX |
| **Revenue** | Premium Conversion | Free → paid users | ≥ 2% | Firestore |

## 4.2 Event Taxonomy

### Navigation Events
```
page_view:            { page, referrer, language, load_time_ms }
screen_view:          { screen_name, previous_screen }
tab_switch:           { from_tab, to_tab }
language_change:      { from_lang, to_lang }
```

### Authentication Events
```
sign_up:              { method: 'google'|'phone'|'guest' }
login:                { method, returning: boolean }
logout:               { session_duration_s }
profile_complete:     { fields_filled: number }
profile_update:       { fields_changed: string[] }
```

### AI Feature Events
```
chat_message_sent:    { language, char_count, has_image, input_method }
chat_response_received: { latency_ms, token_count, citations_count, grounding_score }
chat_feedback:        { rating: 1-5, helpful: boolean }

disease_scan_started: { crop_type, camera_source: 'camera'|'gallery' }
disease_scan_completed: { disease, confidence, duration_ms, model }
disease_scan_shared:  { share_method: 'whatsapp'|'copy'|'download' }
disease_scan_feedback: { correct: boolean, actual_disease? }

voice_session_started: { language }
voice_session_ended:   { duration_s, turns, error: boolean }
```

### Content Events
```
market_price_viewed:  { state, district, crop, price, trend }
market_price_alert_set: { crop, threshold, direction: 'above'|'below' }
market_comparison:    { crops: string[], markets: string[] }

weather_checked:      { district, forecast_type: 'current'|'hourly'|'weekly' }
weather_alert_received: { alert_type, severity }

scheme_viewed:        { scheme_id, category }
scheme_eligibility_checked: { scheme_id, eligible: boolean }

crop_guide_read:      { crop, read_time_s, scroll_depth_pct }
knowledge_article_read: { article_id, read_time_s }
```

### Error Events
```
api_error:            { endpoint, status_code, error_message }
ai_error:             { type: 'timeout'|'safety'|'quota'|'network', context }
offline_fallback:     { feature, cached_age_s }
crash:                { error_message, stack_trace, view }
```

---

# Part 5 — Roadmap (Final Deliverables)

## 5.1 Initial Sprint Backlog (Sprint 1 — 2 weeks)

| # | Task | Priority | Est. | Owner |
|---|------|----------|------|-------|
| 1 | Set up monorepo structure (akm-app/) | P0 | 2h | DevOps |
| 2 | Migrate to Next.js App Router (clean) | P0 | 8h | Frontend |
| 3 | Set up Zustand stores (user, chat, market) | P0 | 4h | Frontend |
| 4 | Create design token CSS file | P0 | 3h | Design |
| 5 | Build component library (Button, Card, Input) | P0 | 8h | Frontend |
| 6 | Set up Vitest + first 20 unit tests | P0 | 4h | QA |
| 7 | Set up GitHub Actions CI pipeline | P0 | 3h | DevOps |
| 8 | Refactor server.js into API routes | P0 | 8h | Backend |
| 9 | Set up Firebase Emulator for local dev | P1 | 2h | DevOps |
| 10 | Configure robots.txt + sitemap generation | P1 | 2h | SEO |

## 5.2 Risk Register

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|-----------|
| Gemini API rate limits hit | High | Medium | Implement caching, fallback responses |
| APMC API unreliable/unavailable | High | High | Cache aggressively, multiple data sources |
| Budget phones can't run app | Critical | Medium | Performance budget enforcement, lite mode |
| AI provides incorrect advice | Critical | Medium | RAG grounding, expert review, disclaimers |
| Firebase costs exceed budget | High | Low | Monitor quotas, optimize reads, BigQuery offload |
| SEO pages don't rank | Medium | Medium | Content quality focus, backlink strategy |
| Farmer adoption is slow | High | Medium | WhatsApp integration, offline-first, FPO partnerships |

## 5.3 Definition of Done

A feature is "Done" when:
- [ ] Code is written with TypeScript strict mode
- [ ] Unit tests pass (≥80% coverage for new code)
- [ ] Integration tests pass (if API-touching)
- [ ] Lighthouse score ≥ 90 (performance, accessibility)
- [ ] Works on P0 devices (Redmi 9A, Samsung A14)
- [ ] Works in Marathi, Hindi, and English
- [ ] Offline behavior is graceful (cached fallback or queue)
- [ ] Analytics events are firing
- [ ] No console errors or warnings
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging and smoke-tested
