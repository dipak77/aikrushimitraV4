# AI Krushi Mitra — Extended User Journeys

> **Version:** 1.0 | **Status:** Approved | **Owner:** Product Strategy Agent  
> **Last Updated:** 2026-06-28

---

## 1. Disease Detection User Journey (Ramesh)

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Ramesh (Farmer)
    participant App as App (Mobile Client)
    participant Cam as Device Camera
    participant API as server.js (Express API)
    participant AI as Gemini 2.5 Flash

    Farmer->>App: Tap "Scan Crop" button on Dashboard
    App->>Cam: Launch camera overlay
    Farmer->>Cam: Click photo of spotted Soybean leaf
    Cam-->>App: Return base64 image data
    App->>Farmer: Confirm image is clear (Show preview)
    Farmer->>App: Tap "Analyze"
    App->>API: POST /api/vision { imageBase64, cropType: 'soybean' }
    API->>AI: generateContent (DISEASE_DIAGNOSIS_V1 system prompt)
    AI-->>API: Return diagnosis JSON (Disease, Organic/Chemical cures)
    API-->>App: Return parsed JSON
    App->>Farmer: Render local language Marathi cards with cures & dosages
    Farmer->>App: Share diagnosis summary to village WhatsApp group
```

---

## 2. Market Price Check & Alert Journey (Sunita)

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Sunita (Farmer)
    participant App as App (Mobile Client)
    participant Store as useMarketStore (Zustand)
    participant API as APMC Price Proxy

    Farmer->>App: Navigates to "Market Bhav" tab
    App->>Store: Check cached prices for Yavatmal Cotton
    alt Cached prices are fresh (<15 mins)
        Store-->>App: Return cached prices
        App->>Farmer: Display price dashboard immediately (no load)
    else Cached prices are stale
        App->>API: Fetch latest rates from Agmarknet API
        API-->>App: Return fresh mandi bhav
        App->>Store: Update latestPrices state
        App->>Farmer: Render fresh price indicator (e.g. ₹7,200/quintal)
    end
    Farmer->>App: Tap "Set Alert" when price exceeds ₹7,500
    App->>Store: addAlert('cotton', 7500, 'above')
```

---

## 3. Soil Test Report Analysis Journey (Rajesh)

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Rajesh (FPO Lead)
    participant App as App (Mobile Client)
    participant API as /api/soil/advisory (Express)
    participant AI as Gemini 3.5 Flash (Soil Interpreter)

    Farmer->>App: Enter Soil Analysis screen
    Farmer->>App: Select NPK slider levels (e.g. N: 45, P: 32, K: 15)
    Farmer->>App: Select planned crop: "Pomegranate"
    Farmer->>App: Tap "Get Fertilizer Plan"
    App->>API: POST /api/soil/advisory { npk, crop, userContext }
    API->>AI: generateContent (SOIL_INTERPRETER_V1 system instruction)
    AI-->>API: Return customized basal & top-dressing schedule
    API-->>App: Return fertilizer advice text
    App->>Farmer: Render soil advice panel with specific bag recommendations per acre
```
