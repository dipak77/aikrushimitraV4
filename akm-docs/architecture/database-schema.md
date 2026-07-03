# AI Krushi Mitra — Database Schema Specification

> **Version:** 1.0 | **Status:** Approved | **Owner:** Data Architect  
> **Last Updated:** 2026-06-28  
> **Database:** Cloud Firestore (Firebase)  
> **Project:** aikrushimitrav1

---

## 1. Collection Overview

| Collection | Purpose | Document Count (Est.) | Read Pattern | Write Pattern |
|------------|---------|----------------------|-------------|---------------|
| `users` | User profiles and preferences | 200K (1 year) | Read-heavy (session load) | Low (profile updates) |
| `conversations` | AI chat history | 2M (1 year) | Read on open | Append-only |
| `diagnoses` | Disease scan results | 5M (1 year) | Read on history | Append-only |
| `marketPrices` | APMC mandi price data | 500K (1 year) | Read-heavy (15min cache) | Batch write (scheduled) |
| `crops` | Crop reference data | ~100 | Read-only (cached) | Admin-only |
| `diseases` | Disease reference data | ~200 | Read-only (cached) | Admin-only |
| `schemes` | Government scheme catalog | ~500 | Read-heavy | Admin-only |
| `activityLogs` | User telemetry events | 50M (1 year) | Aggregate queries | Append-only |
| `alerts` | Pest outbreak + price alerts | 100K (1 year) | Push-triggered | System-generated |
| `content` | Blog posts, knowledge articles | ~1,000 | Read-heavy (SSG cached) | Editorial workflow |

---

## 2. Collection Schemas

### 2.1 `users/{userId}`

```typescript
interface UserDocument {
  // Identity
  uid: string;                    // Firebase Auth UID
  name: string;                   // Display name
  email?: string;                 // Email (Google OAuth)
  phone?: string;                 // Phone number (OTP auth)
  picture?: string;               // Profile photo URL
  provider: 'google' | 'phone' | 'guest';
  
  // Farm Profile
  village: string;
  taluka: string;
  district: string;
  state: string;
  pin?: string;                   // Postal code
  location?: GeoPoint;            // GPS coordinates
  landSize: string;               // e.g., "3 acres"
  landUnit: 'acre' | 'hectare' | 'guntha' | 'bigha';
  irrigationType: 'rainfed' | 'well' | 'borewell' | 'canal' | 'drip' | 'sprinkler';
  soilType?: 'black' | 'red' | 'laterite' | 'alluvial' | 'sandy' | 'clay';
  
  // Crops (current season)
  crops: CropEntry[];
  
  // Preferences
  language: Language;             // 'mr' | 'hi' | 'en' | ...
  notifications: boolean;
  voiceEnabled: boolean;
  offlineMode: boolean;
  
  // Metadata
  joinedAt: Timestamp;
  lastLogin: Timestamp;
  lastActive: Timestamp;
  appVersion?: string;
  deviceInfo?: DeviceInfo;
  onboardingComplete: boolean;
  
  // Subscription (P2)
  plan: 'free' | 'premium';
  planExpiry?: Timestamp;
}

interface CropEntry {
  cropId: string;                 // Reference to crops collection
  name: string;                   // Denormalized for quick display
  season: 'kharif' | 'rabi' | 'zaid';
  area?: string;                  // Area allocated
  sowingDate?: Timestamp;
}

interface DeviceInfo {
  os: string;                     // 'Android 13', 'iOS 17'
  browser: string;                // 'Chrome 120'
  screenWidth: number;
  screenHeight: number;
  networkType?: string;           // '4g', '3g', '2g', 'wifi'
  ram?: string;                   // '2GB', '4GB'
}
```

**Indexes:**
```
(state, district) — for regional queries
(state, crops.cropId) — for crop-specific advisories
(plan, planExpiry) — for subscription management
(lastActive) — for retention analysis
```

**Security Rules:**
```
allow read: if isOwner(userId)
allow create: if isOwner(userId) && isValidUserProfile(data)
allow update: if isOwner(userId) && isValidUserProfile(data) && immutableFields()
allow delete: if isOwner(userId)
```

---

### 2.2 `conversations/{conversationId}`

```typescript
interface ConversationDocument {
  id: string;
  userId: string;
  
  // Metadata
  startedAt: Timestamp;
  lastMessageAt: Timestamp;
  messageCount: number;
  language: Language;
  
  // Classification
  topic?: string;                 // Auto-detected: 'disease', 'market', 'weather', etc.
  crops?: string[];               // Crops discussed
  sentiment?: 'positive' | 'neutral' | 'negative';
  
  // Cost tracking
  totalInputTokens: number;
  totalOutputTokens: number;
  estimatedCost: number;          // USD
  
  // Quality
  userRating?: number;            // 1-5 stars
  feedbackText?: string;
}
```

**Subcollection: `conversations/{conversationId}/messages/{messageId}`**

```typescript
interface MessageDocument {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  
  // Timing
  timestamp: Timestamp;
  latencyMs?: number;             // Time to generate (assistant only)
  
  // AI metadata (assistant messages only)
  model?: string;                 // 'gemini-2.5-flash'
  inputTokens?: number;
  outputTokens?: number;
  ragChunksUsed?: number;         // Number of RAG chunks in context
  citations?: Citation[];
  confidence?: number;            // 0-1 grounding confidence
  
  // Input metadata (user messages only)
  inputMethod?: 'text' | 'voice';
  audioUrl?: string;              // If voice input was stored
  imageUrl?: string;              // If image was attached
}

interface Citation {
  source: string;                 // Document title
  url?: string;                   // Source URL
  chunkId: string;                // RAG chunk reference
  relevanceScore: number;
}
```

**Indexes:**
```
(userId, lastMessageAt DESC) — user's recent conversations
(topic, startedAt DESC) — topic analysis
```

---

### 2.3 `diagnoses/{diagnosisId}`

```typescript
interface DiagnosisDocument {
  id: string;
  userId: string;
  
  // Input
  imageUrl: string;               // Firebase Storage path
  imageThumbnailUrl?: string;     // 200px compressed version
  cropType: string;               // User-specified or detected
  
  // Result
  disease: string;                // Detected disease name
  diseaseName: LocalizedString;   // { en, hi, mr }
  confidence: number;             // 0-1 confidence score
  
  symptoms: string[];
  treatment: {
    organic: TreatmentStep[];
    chemical: TreatmentStep[];
  };
  prevention: string[];
  
  // Enrichment (from knowledge graph)
  relatedDiseases?: string[];
  affectedGrowthStage?: string;
  economicImpact?: string;        // 'low' | 'medium' | 'high' | 'critical'
  
  // Context
  location?: GeoPoint;
  weather?: {                     // Weather at time of scan
    temperature: number;
    humidity: number;
    rainfall24h: number;
  };
  
  // User feedback
  feedback?: {
    helpful: boolean;
    correctDisease: boolean;
    comment?: string;
    actualDisease?: string;       // User correction
  };
  
  // Metadata
  timestamp: Timestamp;
  language: Language;
  latencyMs: number;
  model: string;
}

interface TreatmentStep {
  product: string;
  dosage: string;
  method: string;                 // 'spray', 'drench', 'seed treatment'
  timing: string;
  precautions?: string[];
}

interface LocalizedString {
  en: string;
  hi: string;
  mr: string;
  [key: string]: string;
}
```

**Indexes:**
```
(userId, timestamp DESC) — user's scan history
(disease, timestamp DESC) — outbreak detection
(disease, location) — geo-aggregation for outbreaks
(cropType, disease) — crop-disease correlation
```

---

### 2.4 `marketPrices/{priceId}`

Document ID format: `{state}_{district}_{market}_{crop}_{date}`

```typescript
interface MarketPriceDocument {
  id: string;
  
  // Location
  state: string;
  district: string;
  market: string;                 // APMC market name
  marketCode?: string;            // Official APMC code
  
  // Commodity
  crop: string;
  variety?: string;
  grade?: string;                 // 'FAQ', 'A', 'B'
  
  // Pricing
  modalPrice: number;             // Most common price (₹/quintal)
  minPrice: number;
  maxPrice: number;
  unit: string;                   // 'quintal', 'kg'
  currency: string;               // 'INR'
  
  // Arrivals
  arrivalQuantity?: number;       // Tonnes arrived
  tradedQuantity?: number;        // Tonnes traded
  
  // Trend
  previousDayPrice?: number;
  priceChange: number;            // Absolute change
  priceChangePercent: number;     // Percentage change
  trend: 'up' | 'down' | 'stable';
  
  // Source
  date: string;                   // YYYY-MM-DD
  source: string;                 // 'agmarknet', 'state_board'
  fetchedAt: Timestamp;
  
  // AI Enhancement
  prediction5Day?: number;        // ML-predicted price in 5 days
  predictionConfidence?: number;
  seasonalTrend?: string;         // 'peak', 'trough', 'rising', 'falling'
}
```

**Indexes:**
```
(state, district, crop, date DESC) — primary query pattern
(crop, date DESC) — national crop price view
(state, date DESC) — state market overview
(crop, trend, date DESC) — trending prices
```

---

### 2.5 `crops/{cropId}`

```typescript
interface CropDocument {
  id: string;                     // Slug: 'soybean', 'cotton'
  
  // Names
  name: LocalizedString;          // { en: 'Soybean', mr: 'सोयाबीन', hi: 'सोयाबीन' }
  scientificName: string;
  aliases: LocalizedString[];     // Common alternate names
  
  // Classification
  category: 'cereal' | 'pulse' | 'oilseed' | 'cash_crop' | 'vegetable' | 'fruit' | 'spice' | 'fiber';
  family: string;                 // Botanical family
  
  // Growing Conditions
  seasons: ('kharif' | 'rabi' | 'zaid')[];
  regions: string[];              // Suitable states
  soilTypes: string[];
  phRange: { min: number; max: number };
  temperatureRange: { min: number; max: number };  // °C
  rainfallRange: { min: number; max: number };      // mm/year
  waterRequirement: 'low' | 'medium' | 'high';
  irrigationMethod: string[];
  
  // Calendar
  growthDuration: number;         // Days
  calendar: {
    [region: string]: {
      sowingStart: string;        // 'June-Week2'
      sowingEnd: string;
      harvestStart: string;
      harvestEnd: string;
      phases: GrowthPhase[];
    };
  };
  
  // Relationships (Knowledge Graph edges)
  commonDiseases: string[];       // Disease IDs
  commonPests: string[];          // Pest IDs
  companionCrops: string[];      // Good to grow together
  rotationCrops: string[];       // Good to rotate with
  
  // Economics
  averageYield: string;           // '8-12 quintals/acre'
  costOfCultivation: string;      // '₹15,000-20,000/acre'
  msp?: number;                   // Minimum Support Price (₹/quintal)
  
  // Nutritional (for vegetable/fruit)
  nutritionalInfo?: {
    calories: number;
    protein: number;
    fiber: number;
  };
  
  // Media
  imageUrl: string;
  thumbnailUrl: string;
  
  // Metadata
  lastUpdated: Timestamp;
  source: string;                 // 'ICAR', 'KVK', 'expert'
}

interface GrowthPhase {
  name: LocalizedString;
  startDay: number;
  endDay: number;
  tasks: LocalizedString[];
  inputs: { name: string; quantity: string; }[];
  risks: string[];
}
```

---

### 2.6 `diseases/{diseaseId}`

```typescript
interface DiseaseDocument {
  id: string;                     // Slug: 'bacterial-blight'
  
  // Names
  name: LocalizedString;
  scientificName?: string;
  causativeAgent: string;         // Pathogen name
  agentType: 'fungal' | 'bacterial' | 'viral' | 'nematode' | 'nutrient_deficiency' | 'pest';
  
  // Affected Crops
  affectedCrops: {
    cropId: string;
    susceptibility: 'low' | 'medium' | 'high';
    growthStage: string[];        // Which growth stages are vulnerable
  }[];
  
  // Identification
  symptoms: {
    visual: LocalizedString[];    // What it looks like
    progressive: LocalizedString[];  // How it progresses
    distinguishing: LocalizedString[];  // How to differentiate from similar diseases
  };
  images: {
    url: string;
    stage: string;                // 'early', 'mid', 'severe'
    caption: LocalizedString;
  }[];
  
  // Conditions
  favorableConditions: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    rainfall: string;
    season: string[];
    soilMoisture: string;
  };
  
  // Treatment
  treatment: {
    organic: TreatmentOption[];
    chemical: TreatmentOption[];
    biological: TreatmentOption[];
  };
  
  prevention: LocalizedString[];
  
  // Impact
  severity: 'low' | 'medium' | 'high' | 'critical';
  yieldLossRange: string;        // '10-30%'
  economicImpact: LocalizedString;
  
  // Related
  relatedDiseases: string[];
  confusedWith: string[];         // Often misidentified as
  
  // Metadata
  lastUpdated: Timestamp;
  source: string;
  expertReviewed: boolean;
  reviewedBy?: string;
}

interface TreatmentOption {
  product: LocalizedString;
  activeIngredient: string;
  dosage: LocalizedString;
  method: string;
  timing: LocalizedString;
  waitingPeriod?: number;         // Days before harvest
  precautions: LocalizedString[];
  cost?: string;                  // Approximate cost
}
```

---

### 2.7 `schemes/{schemeId}`

```typescript
interface SchemeDocument {
  id: string;
  
  // Names
  name: LocalizedString;
  shortName: string;              // 'PM-KISAN', 'PMFBY'
  
  // Classification
  category: 'subsidy' | 'insurance' | 'credit' | 'input' | 'marketing' | 'training' | 'infrastructure';
  level: 'central' | 'state' | 'district';
  department: LocalizedString;
  ministry: LocalizedString;
  
  // Applicability
  states: string[];               // Which states (empty = all India)
  crops?: string[];               // Applicable crops (empty = all)
  
  // Eligibility
  eligibility: {
    landSizeMax?: string;         // '5 acres'
    categories?: string[];        // 'SC', 'ST', 'OBC', 'General'
    incomeMax?: number;           // Annual income ceiling
    ageRange?: { min: number; max: number };
    additionalCriteria: LocalizedString[];
  };
  
  // Benefits
  benefits: {
    type: 'cash' | 'subsidy_percent' | 'insurance' | 'material' | 'training';
    amount?: string;              // '₹6,000/year', '50% subsidy'
    description: LocalizedString;
  }[];
  
  // Application
  applicationProcess: {
    steps: LocalizedString[];
    documents: LocalizedString[];  // Required documents
    portal?: string;              // Online application URL
    office?: string;              // Offline application office
    helpline?: string;            // Toll-free number
  };
  
  // Dates
  applicationDeadline?: Timestamp;
  disbursementSchedule?: string;
  
  // Status
  isActive: boolean;
  lastUpdated: Timestamp;
  source: string;
  officialUrl: string;
}
```

---

### 2.8 `activityLogs/{logId}`

```typescript
interface ActivityLogDocument {
  id: string;
  userId: string;
  sessionId: string;
  
  // Event
  event: string;                  // From event taxonomy
  category: 'navigation' | 'ai_feature' | 'content' | 'user_action' | 'error';
  
  // Context
  view: string;
  action?: string;
  metadata?: Record<string, any>;
  
  // Device & Network
  device: string;
  os: string;
  browser: string;
  networkType?: string;
  screenSize?: string;
  
  // Location
  location?: string;              // District, State
  
  // Timing
  timestamp: Timestamp;
  duration?: number;              // Milliseconds spent on view
  
  // Performance
  loadTime?: number;              // Page load time ms
  apiLatency?: number;            // API response time ms
}
```

**Indexes:**
```
(userId, timestamp DESC) — user activity timeline
(event, timestamp DESC) — event aggregation
(category, event, timestamp DESC) — category analysis
```

---

## 3. Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Collection names | camelCase, plural | `marketPrices`, `activityLogs` |
| Document IDs | kebab-case or composite key | `soybean`, `maharashtra_pune_onion_2026-06-28` |
| Field names | camelCase | `modalPrice`, `lastLogin` |
| Timestamp fields | Firestore Timestamp | `Timestamp.now()` |
| Boolean fields | `is` or `has` prefix | `isActive`, `hasNotifications` |
| Array fields | Plural noun | `crops`, `symptoms`, `benefits` |
| Enum values | snake_case | `'cash_crop'`, `'seed_treatment'` |

---

## 4. Backup Strategy

| Component | Frequency | Retention | Method |
|-----------|-----------|-----------|--------|
| Firestore data | Daily | 30 days | Firebase scheduled export to Cloud Storage |
| User profiles | Real-time | Indefinite | Firestore point-in-time recovery |
| Activity logs | Weekly archive | 1 year active, 5 years archive | Move to BigQuery after 90 days |
| Market prices | Daily | 2 years | Firestore + BigQuery export |
| AI conversations | Weekly | 1 year | Firestore + Cloud Storage archive |
