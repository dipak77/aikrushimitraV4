# AI Krushi Mitra — Product Vision Document

> **Version:** 1.0 | **Status:** Approved | **Owner:** Product Strategy Agent  
> **Last Updated:** 2026-06-28

---

## 1. Vision Statement

**"Every Indian farmer has an AI-powered agricultural advisor in their pocket — accessible in their language, online or offline, free at the point of use."**

AI Krushi Mitra envisions a future where the knowledge gap between agricultural research institutions and India's 150 million+ farming families is completely eliminated through artificial intelligence. No farmer should lose a crop because they couldn't identify a disease in time, miss a government subsidy because they didn't know it existed, or sell at the wrong price because they lacked market information.

---

## 2. Mission Statement

To democratize agricultural knowledge by building India's most intelligent, multilingual, voice-first farming assistant that combines real-time market intelligence, AI-powered crop advisory, and government scheme discovery into a single platform accessible to every farmer regardless of literacy level, connectivity, or device capability.

---

## 3. Value Proposition

### For Farmers
| Problem | Current Solution | AI Krushi Mitra Solution |
|---------|-----------------|-------------------------|
| Cannot identify crop disease | Ask neighbors (unreliable) or wait for extension officer (days) | **Instant camera-based diagnosis** with treatment recommendations in local language |
| Don't know today's market price | Travel to mandi physically, rely on middlemen | **Real-time APMC prices** with trend analysis and sell-timing recommendations |
| Miss government schemes | Rely on word-of-mouth, visit tehsil office | **Personalized scheme matching** based on farm profile with application guidance |
| Weather-dependent decisions | Watch TV news (generic) | **Hyperlocal weather** with crop-specific advisories |
| No expert access | KVK visits (rare), input dealer advice (biased) | **24/7 AI agronomist** via voice in native language |

### For the Ecosystem
- **FPO Managers**: Aggregate market intelligence, coordinate member advisory at scale
- **Agriculture Officers**: Mass advisory distribution, pest outbreak early warning
- **Input Dealers**: Verified disease diagnosis drives correct product recommendations
- **Research Institutions**: Real-time field data from millions of farms for study

---

## 4. Core Principles

1. **Farmer-First Design**: Every feature starts with a farmer problem, not a technology capability
2. **Voice-First Interaction**: Voice is the primary input for farmers with limited literacy
3. **Offline-Capable**: Core features must work with intermittent or no connectivity
4. **Language Native**: Not translated — culturally adapted content in 12+ Indian languages
5. **Trust Through Transparency**: Every AI recommendation cites its source
6. **Zero Cost Barrier**: Core features are free; premium features fund operations
7. **Privacy Respectful**: Farmer data is never sold; minimum data collection principle

---

## 5. Success Metrics

| Metric | 90-Day Target | 1-Year Target | Measurement |
|--------|--------------|---------------|-------------|
| Monthly Active Users (MAU) | 10,000 | 500,000 | Firebase Analytics |
| Farmer Registration | 5,000 | 200,000 | Firestore user count |
| Disease Scans per Month | 20,000 | 2,000,000 | Event tracking |
| Chat Sessions per Week | 15,000 | 1,500,000 | Conversation logs |
| Mandi Price Checks per Day | 5,000 | 500,000 | API call logs |
| D7 Retention Rate | 40% | 55% | Cohort analysis |
| NPS Score | +40 | +60 | In-app surveys |
| Organic Search Traffic | 50,000/mo | 2,000,000/mo | Google Search Console |
| Voice Session Completion | 70% | 85% | Session analytics |

---

## 6. Competitive Positioning

| Competitor | Strengths | Weaknesses | Our Advantage |
|-----------|-----------|-----------|---------------|
| **Plantix** | Large disease database, image recognition | No voice, limited Indian languages, no market data | Multilingual voice-first + market + schemes |
| **AgroStar** | Strong in agri-input marketplace | Advisory tied to product sales (biased) | Unbiased AI advisory, not tied to product sales |
| **IFFCO Kisan** | Government backing, wide reach | Outdated UI, no AI, poor offline | Modern AI + offline-first architecture |
| **Kisan Suvidha** | Government data (weather, market) | No personalization, no disease detection | Personalized AI with RAG-powered knowledge |
| **BharatAgri** | Good crop calendar, precision farming | Premium pricing, limited free tier | Free core features, voice-first design |

**Our Moat**: The combination of (1) RAG-powered multilingual AI, (2) voice-first design for low-literacy users, (3) offline-capable architecture for rural connectivity, and (4) programmatic SEO generating millions of hyperlocal content pages — creates a compound advantage no single competitor matches.

---

## 7. Platform Philosophy

```
┌──────────────────────────────────────────────────────┐
│                   AI Krushi Mitra                      │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  KNOW    │  │  GROW    │  │  EARN    │            │
│  │          │  │          │  │          │            │
│  │ Disease  │  │ Calendar │  │ Market   │            │
│  │ Weather  │  │ Soil     │  │ Schemes  │            │
│  │ Advisory │  │ Yield    │  │ Price    │            │
│  └──────────┘  └──────────┘  └──────────┘            │
│                                                        │
│  ┌─────────────────────────────────────────┐          │
│  │         VOICE-FIRST AI ASSISTANT        │          │
│  │    "Your 24/7 Agricultural Expert"      │          │
│  └─────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────┘
```

The platform is organized around three farmer needs:
- **KNOW**: Understand what's happening (disease, weather, advisory)
- **GROW**: Optimize farming operations (calendar, soil, yield)
- **EARN**: Maximize income (market prices, schemes, price predictions)

All three converge through a unified **Voice-First AI Assistant** that acts as the farmer's personal agronomist.
