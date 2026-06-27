# AI Krushi Mitra — Feature Hierarchy & Prioritization

> **Version:** 1.0 | **Status:** Approved | **Owner:** Product Strategy Agent  
> **Last Updated:** 2026-06-28

---

## Prioritization Framework

Features are prioritized using the **RICE** framework adapted for agricultural impact:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Reach** | How many farmers does this feature serve? |
| **Impact** | How much does it reduce crop loss or increase income? |
| **Confidence** | How validated is the farmer need? |
| **Effort** | Engineering complexity and time to build |

Priority levels:
- **P0 (Must Ship)**: Core value proposition — without these, the product has no reason to exist
- **P1 (Next Release)**: Growth features that deepen engagement and expand use cases
- **P2 (Revenue)**: Monetization features that sustain the platform
- **P3 (Innovation)**: Future-looking features that create long-term competitive moats

---

## P0 — Must Ship (MVP)

### 1. AI Chat Assistant
| Attribute | Detail |
|-----------|--------|
| **User Need** | "I need expert farming advice instantly in my language" |
| **Personas** | Ramesh, Sunita, Priya |
| **Input Modes** | Voice (primary), Text, Follow-up questions |
| **Languages** | Marathi, Hindi, English (launch); +9 languages (6 months) |
| **AI Backend** | Gemini 2.5 Flash + RAG pipeline |
| **Key Behaviors** | Conversational, cites sources, admits uncertainty, suggests camera scan when relevant |
| **Offline** | Queue messages, deliver when connected |
| **Success Metric** | ≥2 conversations/user/week, ≥85% accuracy |

**Sub-features:**
- [ ] Multilingual chat interface with voice input/output
- [ ] Context-aware responses (user's crops, location, season)
- [ ] RAG-grounded answers with source citations
- [ ] Conversation history (last 30 days)
- [ ] Quick-reply suggestions ("Ask about treatment", "Show prevention")
- [ ] Safety guardrails (no medical/legal advice for humans)

---

### 2. Crop Disease Detection
| Attribute | Detail |
|-----------|--------|
| **User Need** | "What disease is this? How do I fix it?" |
| **Personas** | Ramesh, Priya |
| **Input** | Camera photo of affected leaf/fruit/stem |
| **Output** | Disease name, confidence %, treatment (organic + chemical), prevention |
| **AI Backend** | Gemini 2.5 Flash multimodal |
| **Languages** | Results in user's selected language |
| **Offline** | Cache last 20 diagnoses; queue new scans |
| **Success Metric** | ≥85% diagnosis accuracy, ≥4 scans/user/month |

**Sub-features:**
- [ ] Single-tap camera launch
- [ ] Multi-image support (capture multiple angles)
- [ ] Diagnosis history with crop tracking
- [ ] Treatment dosage calculator (area-based)
- [ ] Share diagnosis via WhatsApp (image + text report)
- [ ] Feedback mechanism ("Was this helpful?")

---

### 3. Live Mandi Bhav (Market Prices)
| Attribute | Detail |
|-----------|--------|
| **User Need** | "What's today's price for my crop at the nearest mandi?" |
| **Personas** | Ramesh, Sunita, Rajesh |
| **Data Source** | APMC (Agmarknet), state agricultural marketing boards |
| **Coverage** | Maharashtra (launch), then pan-India |
| **Update Frequency** | Every 15 minutes during market hours |
| **Features** | Today's price, 7-day trend, multi-market comparison |
| **Offline** | Cache last known prices with timestamp |
| **Success Metric** | ≥5 price checks/user/week |

**Sub-features:**
- [ ] Quick-view widget on dashboard (top 3 crops)
- [ ] Multi-market price comparison
- [ ] 7/30/90-day price trend charts
- [ ] Price alerts ("Notify when onion > ₹2,200/quintal")
- [ ] AI price prediction (5-day forecast)
- [ ] Export-grade pricing (APEDA rates)

---

### 4. Weather Forecast
| Attribute | Detail |
|-----------|--------|
| **User Need** | "Will it rain tomorrow? Should I spray today?" |
| **Personas** | Ramesh, Sunita |
| **Data Source** | OpenWeatherMap / IMD API |
| **Granularity** | Taluka-level (block-level where available) |
| **Coverage** | Pan-India |
| **Features** | Current, hourly (24h), daily (7-day), severe weather alerts |
| **Offline** | Cache 48-hour forecast |
| **Success Metric** | Daily active check rate ≥60% |

**Sub-features:**
- [ ] Dashboard weather widget (current + 3-day)
- [ ] Crop-specific weather advisory ("Don't spray cotton today — rain expected in 4 hours")
- [ ] Severe weather alerts (push notification)
- [ ] Historical weather data for planning
- [ ] Frost/heat wave warnings

---

### 5. Crop Calendar
| Attribute | Detail |
|-----------|--------|
| **User Need** | "When should I sow, fertilize, spray, and harvest?" |
| **Personas** | Ramesh, Sunita |
| **Customization** | Based on crop + region + season |
| **Content** | Phase-wise tasks with dates, inputs needed, reminders |
| **Source** | ICAR recommendations, KVK advisories |
| **Offline** | Fully cached after first load |
| **Success Metric** | ≥70% task completion rate |

**Sub-features:**
- [ ] Visual timeline with crop growth phases
- [ ] Push notification reminders for upcoming tasks
- [ ] Input requirements per phase (seeds, fertilizer, pesticide)
- [ ] Integration with weather (adjust schedule for rain delays)
- [ ] Multi-crop calendar view

---

### 6. Government Scheme Discovery
| Attribute | Detail |
|-----------|--------|
| **User Need** | "Which schemes am I eligible for? How do I apply?" |
| **Personas** | Ramesh, Dr. Patil |
| **Data Source** | PM-KISAN, PMFBY, state schemes, district schemes |
| **Personalization** | Filter by state, crop, land size, caste category |
| **Languages** | Marathi, Hindi, English |
| **Offline** | Cache scheme list and eligibility criteria |
| **Success Metric** | ≥3 scheme views/user/month |

**Sub-features:**
- [ ] Personalized scheme recommendations (based on profile)
- [ ] Step-by-step application guide
- [ ] Deadline tracking and reminders
- [ ] Document checklist (Aadhaar, land record, etc.)
- [ ] Link to official application portal

---

## P1 — Growth Features (Next Release)

| # | Feature | Persona | Description |
|---|---------|---------|-------------|
| 1 | **Soil Health Analysis** | Sunita | Upload soil test report → AI interprets NPK, pH, EC → fertilizer recommendation |
| 2 | **Yield Predictor** | Sunita, Rajesh | ML model estimates harvest quantity based on crop, area, weather, soil |
| 3 | **Area/Land Calculator** | Ramesh | GPS-based field area measurement with map view |
| 4 | **Pest Alert System** | All | Push notifications for pest outbreaks in nearby areas |
| 5 | **Community Forum** | Ramesh | Farmer-to-farmer Q&A with expert moderation |
| 6 | **Agricultural Knowledge Base** | All | Searchable encyclopedia of crops, diseases, techniques |
| 7 | **Sabji Mandi (Vegetable Market)** | Sunita | Specialized vegetable market price tracking |
| 8 | **Crop Insurance Integration** | Ramesh | PMFBY claim status tracking, damage documentation |

---

## P2 — Revenue Features

| # | Feature | Revenue Model | Target Persona |
|---|---------|--------------|----------------|
| 1 | **Premium Advisory** | ₹99/month subscription | Sunita (progressive farmer) |
| 2 | **Input Marketplace** | Commission on sales | Priya (input dealer) |
| 3 | **FPO Dashboard** | ₹5,000/month SaaS | Rajesh (FPO manager) |
| 4 | **Sponsored Content** | CPM advertising | Agri-brands |
| 5 | **Data Insights** | Aggregated analytics | Research institutions |
| 6 | **Custom Integrations** | API licensing | Govt departments |

---

## P3 — Innovation Features

| # | Feature | Timeline | Technology |
|---|---------|----------|-----------|
| 1 | **Drone Monitoring** | 18 months | DJI SDK + AI analysis |
| 2 | **IoT Sensor Dashboard** | 24 months | Soil moisture, pH sensors |
| 3 | **Satellite Imagery** | 18 months | NDVI from Sentinel-2 |
| 4 | **Blockchain Traceability** | 24 months | Farm-to-fork tracking |
| 5 | **AR Pest Identification** | 24 months | Real-time camera overlay |

---

## Feature Dependency Graph

```
Authentication ──────────────────────────────────────────────────┐
     │                                                            │
     ├── User Profile ───────────────────────────────────────┐   │
     │        │                                               │   │
     │        ├── AI Chat (needs: profile context, RAG)      │   │
     │        │     └── Voice Assistant (needs: chat)        │   │
     │        │                                               │   │
     │        ├── Disease Detection (needs: camera, AI)      │   │
     │        │     └── Diagnosis History                    │   │
     │        │                                               │   │
     │        ├── Market Prices (needs: location)            │   │
     │        │     ├── Price Alerts                         │   │
     │        │     └── Price Prediction (needs: ML model)   │   │
     │        │                                               │   │
     │        ├── Weather (needs: location)                  │   │
     │        │     └── Crop Weather Advisory                │   │
     │        │                                               │   │
     │        ├── Crop Calendar (needs: profile, weather)    │   │
     │        │                                               │   │
     │        └── Scheme Discovery (needs: profile)          │   │
     │                                                        │   │
     └── Analytics Tracking (needs: all views) ──────────────┘   │
                                                                  │
     RAG Pipeline (independent) ──────────────────────────────────┘
     Knowledge Graph (independent) ──────────────────────────────┘
```
