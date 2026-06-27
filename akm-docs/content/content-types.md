# AI Krushi Mitra — Content Types Specification

> **Version:** 1.0 | **Status:** Approved | **Owner:** Product Strategist  
> **Last Updated:** 2026-06-28

---

## 1. Crop Guide Data Structure

```json
{
  "id": "string (unique identifier, e.g. cotton)",
  "category": "string (crop | tech | livestock | scheme)",
  "title": {
    "mr": "string (Marathi title)",
    "en": "string (English title)",
    "hi": "string (optional Hindi title)"
  },
  "subtitle": {
    "mr": "string",
    "en": "string"
  },
  "image": "string (image URL)",
  "tags": ["string"],
  "stats": [
    {
      "label": { "mr": "string", "en": "string" },
      "value": "string",
      "icon": "string (lucide icon string)"
    }
  ],
  "sections": [
    {
      "title": { "mr": "string", "en": "string" },
      "content": { "mr": "string", "en": "string" }
    }
  ]
}
```

---

## 2. Crop Disease Diagnosis Payload

```json
{
  "id": "string (UUID)",
  "timestamp": "number (Epoch MS)",
  "imageUrl": "string",
  "crop": "string",
  "diagnosis": {
    "disease": "string (English scientific name)",
    "disease_local": "string (Local language name)",
    "confidence": "number (0.0 to 1.0)",
    "organic_treatment": "string",
    "chemical_treatment": "string",
    "prevention": "string"
  }
}
```
