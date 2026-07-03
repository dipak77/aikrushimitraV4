# AI Krushi Mitra — Target Personas & User Journeys

> **Version:** 1.0 | **Status:** Approved | **Owner:** User Research Agent  
> **Last Updated:** 2026-06-28

---

## Persona 1: Ramesh — The Small Farmer

### Profile
| Attribute | Detail |
|-----------|--------|
| **Age** | 45 years |
| **Location** | Yavatmal, Vidarbha, Maharashtra |
| **Land** | 3 acres (rainfed) |
| **Crops** | Cotton, Soybean (Kharif); Wheat (Rabi) |
| **Education** | 8th standard |
| **Language** | Marathi (primary), basic Hindi |
| **Device** | Redmi 9A (₹7,000), 2GB RAM |
| **Connectivity** | 2G/3G, intermittent; no WiFi |
| **Digital Literacy** | Low — uses WhatsApp, YouTube |
| **Monthly Income** | ₹8,000–15,000 (seasonal) |

### Goals
1. Identify cotton bollworm before it destroys the crop
2. Get best price for soybean without middleman cheating
3. Know which government schemes he's eligible for
4. Understand when to sow, spray, and harvest

### Pain Points
1. **Cannot read English** — most agricultural apps are in English
2. **Poor connectivity** — app crashes when loading heavy content
3. **Small screen** — complex UIs are unusable on 5" budget phone
4. **No expert access** — nearest KVK is 60km away, visits once/quarter
5. **Information overload** — doesn't know which advisory to trust

### Journey: "My cotton leaves are turning yellow"

```
Step 1: Ramesh notices yellow spots on cotton leaves (field, morning)
   ↓
Step 2: Opens AI Krushi Mitra, taps camera icon
   ↓
Step 3: Points phone at affected leaf, takes photo
   ↓
Step 4: AI identifies "Bacterial Blight" (85% confidence)
   ↓
Step 5: Shows treatment in Marathi:
        "कॉपर ऑक्सिक्लोराइड 3 ग्रॅम/लिटर फवारणी करा"
   ↓
Step 6: Shows prevention steps for next season
   ↓
Step 7: Ramesh saves diagnosis, shares screenshot on WhatsApp to neighbor
```

### Design Implications
- Voice input is primary (reading is difficult)
- Images must be < 100KB (2G network)
- Text must be in Marathi with simple vocabulary
- Touch targets minimum 48px (rough hands, small screen)
- Offline mode must cache last 10 diagnoses

---

## Persona 2: Sunita — The Progressive Farmer

### Profile
| Attribute | Detail |
|-----------|--------|
| **Age** | 35 years |
| **Location** | Nashik, Maharashtra |
| **Land** | 15 acres (drip irrigation) |
| **Crops** | Grape, Onion, Pomegranate |
| **Education** | B.Sc. Agriculture |
| **Language** | Marathi, Hindi, basic English |
| **Device** | Samsung Galaxy A34 (₹20,000) |
| **Connectivity** | 4G stable; home WiFi |
| **Digital Literacy** | High — uses banking apps, e-commerce |
| **Monthly Income** | ₹40,000–80,000 |

### Goals
1. Optimize grape yield per acre using precision agriculture
2. Track export-grade quality metrics for pomegranate
3. Compare mandi prices across Nashik, Pune, Mumbai for best selling point
4. Plan irrigation schedule based on weather forecast
5. Get soil test interpretation without visiting lab

### Pain Points
1. **Data fragmentation** — uses 4 different apps for weather, market, calendar, advisory
2. **No yield prediction** — cannot estimate harvest quantity for forward contracts
3. **Soil report complexity** — gets lab report but cannot interpret pH, NPK values
4. **Export compliance** — doesn't know pesticide residue limits for EU/US markets

### Journey: "Should I sell onions today or hold?"

```
Step 1: Sunita opens AI Krushi Mitra dashboard (morning, farm office)
   ↓
Step 2: Checks Mandi Bhav widget: Nashik onion ₹1,800/quintal
   ↓
Step 3: Taps "Compare Markets" — sees Pune at ₹2,100, Mumbai at ₹2,300
   ↓
Step 4: AI advisory: "Prices expected to rise 8-12% in next 5 days 
        based on supply reduction and festival demand"
   ↓
Step 5: Decides to hold for 3 days
   ↓
Step 6: Sets price alert: "Notify when Nashik onion crosses ₹2,200"
   ↓
Step 7: Gets push notification 4 days later — sells at ₹2,350
        (saved ₹5,500 per quintal compared to Day 1 price)
```

### Design Implications
- Dashboard with data-dense widgets (she can handle complexity)
- Charts and trend visualizations for market data
- Multi-market comparison feature
- Price alerts and push notifications
- Export market data integration

---

## Persona 3: Rajesh — The FPO Manager

### Profile
| Attribute | Detail |
|-----------|--------|
| **Age** | 42 years |
| **Location** | Amravati, Maharashtra |
| **Role** | CEO, Vidarbha Farmers Producer Organization |
| **Members** | 250 small farmers across 12 villages |
| **Education** | MBA (Agri-Business) |
| **Language** | Hindi, Marathi, English |
| **Device** | Laptop (primary), Pixel 7a (secondary) |
| **Connectivity** | Fiber broadband (office), 4G (field) |
| **Digital Literacy** | Expert — manages ERP, accounting |

### Goals
1. Send bulk crop advisories to 250 members simultaneously
2. Negotiate better mandi prices by aggregating produce
3. Track government scheme enrollment for all members
4. Generate monthly reports for board meetings
5. Identify common diseases across member farms for early warning

### Pain Points
1. **No aggregation tools** — manually collects data from 250 farmers via phone calls
2. **Scheme tracking nightmare** — each farmer has different eligibility
3. **No early warning** — pest outbreaks spread across villages before he knows
4. **Report generation** — spends 2 days/month compiling manual reports

### Journey: "Bollworm outbreak spreading across 3 villages"

```
Step 1: Member farmer Ramesh reports bollworm on AI Krushi Mitra
   ↓
Step 2: System detects 5 similar reports from same block in 48 hours
   ↓
Step 3: FPO Dashboard shows outbreak heat map
   ↓
Step 4: Rajesh clicks "Send Advisory" — AI generates:
        "बोंड अळीचा प्रादुर्भाव आढळला. त्वरित 5% निंबोळी अर्क फवारणी करा"
   ↓
Step 5: Advisory pushed to all 250 members via app notification + SMS
   ↓
Step 6: System tracks advisory compliance (who sprayed, who didn't)
   ↓
Step 7: Follow-up advisory sent to non-compliant farmers after 48 hours
```

### Design Implications
- Desktop-first dashboard with data tables
- Bulk advisory creation and distribution
- Member management with farm profiles
- Outbreak detection and alert system
- Report generation and export (PDF, Excel)

---

## Persona 4: Priya — The Input Dealer

### Profile
| Attribute | Detail |
|-----------|--------|
| **Age** | 32 years |
| **Location** | Akola, Maharashtra |
| **Business** | "Krishi Seva Kendra" agri-input shop |
| **Customers** | ~150 farmers, walk-in + phone |
| **Education** | B.Com + pesticide license |
| **Language** | Hindi, Marathi |
| **Device** | Vivo V29 (₹25,000) |
| **Connectivity** | 4G, shop WiFi |
| **Digital Literacy** | Moderate — uses Tally, WhatsApp Business |

### Goals
1. Correctly diagnose disease when farmer brings sample leaf
2. Recommend right product (not just highest-margin one)
3. Build trust and repeat customers through reliable advice
4. Track seasonal demand patterns for inventory planning
5. Share advisory content with customers via WhatsApp

### Pain Points
1. **Misdiagnosis risk** — wrong diagnosis = wrong product = crop loss = reputation damage
2. **Too many products** — 200+ pesticide/fungicide brands, hard to know which works
3. **No credibility** — farmers trust input dealer less than government extension
4. **Inventory waste** — overstocks products that don't sell that season

### Journey: "Farmer walks in with a damaged sugarcane leaf"

```
Step 1: Farmer brings damaged sugarcane leaf to Priya's shop
   ↓
Step 2: Priya opens AI Krushi Mitra, scans the leaf
   ↓
Step 3: AI identifies "Red Rot Disease" with treatment protocol
   ↓
Step 4: Shows recommended chemicals with dosage:
        "Carbendazim 50% WP — 2 gm/liter spray"
   ↓
Step 5: Priya checks her inventory — has the product in stock
   ↓
Step 6: Shows diagnosis report to farmer on phone — builds trust
   ↓
Step 7: Farmer buys product + shares recommendation with 3 neighbors
```

### Design Implications
- Quick-scan mode (single tap → camera → result)
- Product-linked treatment recommendations
- Shareable diagnosis reports (WhatsApp-optimized)
- Inventory-aware recommendations (future feature)

---

## Persona 5: Dr. Patil — The Agriculture Officer

### Profile
| Attribute | Detail |
|-----------|--------|
| **Age** | 50 years |
| **Location** | Wardha District, Maharashtra |
| **Role** | Block Agriculture Officer (Taluka level) |
| **Coverage** | 15,000 farmers across 85 villages |
| **Education** | M.Sc. Agriculture + UPSC qualified |
| **Language** | Hindi, Marathi, English |
| **Device** | Government-issued tablet + personal phone |
| **Connectivity** | 4G (urban), 2G/3G (village visits) |
| **Digital Literacy** | High — uses government portals |

### Goals
1. Distribute crop advisories to 15,000 farmers efficiently
2. Track PM-KISAN beneficiary enrollment and verification
3. Monitor pest/disease outbreaks across the block
4. Generate crop damage reports for insurance claims
5. Conduct soil health card distribution digitally

### Pain Points
1. **Cannot reach all farmers** — physically visits 2-3 villages/week max
2. **Paper-heavy reporting** — spends 40% time on paperwork
3. **No real-time data** — outbreak data comes 2 weeks late
4. **Political pressure** — scheme enrollment targets vs actual eligibility
5. **Trust deficit** — farmers skeptical of government advice

### Journey: "Generating weekly pest surveillance report"

```
Step 1: Dr. Patil opens AI Krushi Mitra admin dashboard (Monday morning)
   ↓
Step 2: Reviews pest surveillance map — aggregated from farmer scans
   ↓
Step 3: Sees 47 bollworm reports from 5 villages in past 7 days
   ↓
Step 4: System auto-generates surveillance report with:
        - Village-wise case count
        - Crop-wise distribution
        - Recommended action plan
        - Map visualization
   ↓
Step 5: Downloads report as PDF for submission to district office
   ↓
Step 6: Broadcasts mass advisory to affected villages
   ↓
Step 7: Tracks advisory compliance and reports efficacy next week
```

### Design Implications
- Admin dashboard with surveillance analytics
- Government-format report generation
- Mass notification/advisory broadcast
- Geo-tagged disease reporting heat maps
- Integration with government scheme portals

---

## Accessibility & Rural Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Large Touch Targets** | Minimum 48×48px for all interactive elements |
| **High Contrast** | WCAG AA minimum; consider bright sunlight outdoor use |
| **Voice-First** | Every screen navigable by voice command |
| **Low Data** | Pages < 200KB on first load; images lazy-loaded, WebP format |
| **Offline Graceful** | Show cached data with "Last updated" timestamp |
| **Cultural Sensitivity** | Crop images from Indian farms, not stock photos |
| **Numeric Formatting** | ₹ symbol, Indian numbering system (lakhs, crores) |
| **Seasonal Awareness** | UI themes/content adapt to Kharif/Rabi/Zaid seasons |
| **Error Recovery** | Never show technical errors; always provide "Try Again" with voice |
| **Multimodal Input** | Text + Voice + Camera as equal-class input methods |
