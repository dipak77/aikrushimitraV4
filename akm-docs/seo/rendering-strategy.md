# AI Krushi Mitra — SEO & Rendering Strategy

> **Version:** 1.0 | **Status:** Approved | **Owner:** Technical SEO Agent  
> **Last Updated:** 2026-06-28

---

## 1. Rendering Strategy by Page Type

| Page | Route | Rendering | Revalidation | JS Bundle | Indexed |
|------|-------|-----------|-------------|-----------|---------|
| Landing | `/` | SSR | On deploy | ~150KB | ✅ Yes |
| About | `/about/` | SSG | On deploy | ~50KB | ✅ Yes |
| Crop Hub | `/crops/` | SSG | Weekly | ~80KB | ✅ Yes |
| Crop Guide | `/crops/{crop}/` | SSG | Weekly | ~80KB | ✅ Yes |
| Disease Hub | `/diseases/` | SSG | Weekly | ~80KB | ✅ Yes |
| Disease Guide | `/diseases/{disease}/` | SSG | Weekly | ~80KB | ✅ Yes |
| Mandi Bhav Hub | `/mandi-bhav/` | ISR (15min) | 15 min | ~100KB | ✅ Yes |
| Mandi Price | `/mandi-bhav/{s}/{d}/{c}/` | ISR (15min) | 15 min | ~100KB | ✅ Yes |
| Weather | `/weather/{s}/{d}/` | ISR (30min) | 30 min | ~80KB | ✅ Yes |
| Scheme Hub | `/schemes/` | SSG | On change | ~80KB | ✅ Yes |
| Scheme Detail | `/schemes/{scheme}/` | SSG | On change | ~80KB | ✅ Yes |
| Blog Post | `/blog/{slug}/` | SSG | On publish | ~60KB | ✅ Yes |
| Privacy | `/privacy/` | SSG | On deploy | ~30KB | ✅ Yes |
| App (SPA) | `/app/**` | CSR | N/A | ~500KB | ❌ No (`noindex`) |

---

## 2. URL Architecture & Canonicals

### 2.1 URL Design Principles

1. **Trailing slash** — All URLs end with `/` (Firebase Hosting + Next.js `trailingSlash: true`)
2. **Lowercase** — All paths are lowercase with hyphens
3. **Descriptive** — URLs contain target keywords
4. **Flat hierarchy** — Maximum 4 levels deep
5. **Canonical** — Every page has explicit `<link rel="canonical">`

### 2.2 URL Patterns

```
# Landing & Static
https://aikrushimitra.in/
https://aikrushimitra.in/about/
https://aikrushimitra.in/contact/
https://aikrushimitra.in/privacy/

# Crop Content Hub
https://aikrushimitra.in/crops/
https://aikrushimitra.in/crops/soybean/
https://aikrushimitra.in/crops/cotton/
https://aikrushimitra.in/crops/onion/

# Disease Content Hub
https://aikrushimitra.in/diseases/
https://aikrushimitra.in/diseases/bacterial-blight/
https://aikrushimitra.in/diseases/rust-disease/

# Mandi Bhav (Programmatic SEO — 200+ pages)
https://aikrushimitra.in/mandi-bhav/
https://aikrushimitra.in/mandi-bhav/maharashtra/
https://aikrushimitra.in/mandi-bhav/maharashtra/pune/onion/
https://aikrushimitra.in/mandi-bhav/maharashtra/nashik/onion/
https://aikrushimitra.in/mandi-bhav/madhya-pradesh/indore/soybean/

# Weather (Programmatic SEO — 100+ pages)
https://aikrushimitra.in/weather/
https://aikrushimitra.in/weather/maharashtra/pune/
https://aikrushimitra.in/weather/maharashtra/nashik/

# Government Schemes
https://aikrushimitra.in/schemes/
https://aikrushimitra.in/schemes/pm-kisan/
https://aikrushimitra.in/schemes/pmfby/

# Blog
https://aikrushimitra.in/blog/
https://aikrushimitra.in/blog/best-soybean-varieties-2026/

# App (not indexed)
https://aikrushimitra.in/app/
https://aikrushimitra.in/app/dashboard/
https://aikrushimitra.in/app/scan/
```

---

## 3. Structured Data (Schema.org)

### 3.1 Organization (Global)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AI Krushi Mitra",
  "alternateName": "AI कृषी मित्र",
  "url": "https://aikrushimitra.in",
  "logo": "https://aikrushimitra.in/logo.png",
  "description": "India's #1 AI-powered smart farming assistant",
  "sameAs": [
    "https://twitter.com/aikrushimitra",
    "https://youtube.com/@aikrushimitra"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-XXXXXXXXXX",
    "contactType": "customer service",
    "availableLanguage": ["Marathi", "Hindi", "English"]
  }
}
```

### 3.2 WebApplication (Landing Page)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AI Krushi Mitra",
  "applicationCategory": "Agriculture",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "featureList": [
    "AI Crop Disease Detection",
    "Live Mandi Bhav Prices",
    "Voice-First Farming Assistant",
    "Weather Forecast",
    "Government Scheme Discovery"
  ],
  "inLanguage": ["mr", "hi", "en"]
}
```

### 3.3 Article (Crop/Disease Guides)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Soybean Cultivation Guide — Complete Farming Manual",
  "description": "...",
  "image": "https://aikrushimitra.in/images/crops/soybean.webp",
  "author": {
    "@type": "Organization",
    "name": "AI Krushi Mitra Research Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AI Krushi Mitra",
    "logo": { "@type": "ImageObject", "url": "https://aikrushimitra.in/logo.png" }
  },
  "datePublished": "2026-01-01",
  "dateModified": "2026-06-28",
  "mainEntityOfPage": "https://aikrushimitra.in/crops/soybean/"
}
```

### 3.4 Dataset (Mandi Bhav)

```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Onion Market Prices in Pune, Maharashtra",
  "description": "Daily APMC mandi bhav for onion...",
  "license": "https://creativecommons.org/publicdomain/zero/1.0/",
  "spatialCoverage": "Pune, Maharashtra, India",
  "temporalCoverage": "2026-06-28",
  "variableMeasured": "Modal crop price per quintal (INR)"
}
```

### 3.5 FAQPage (Crop/Disease Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "सोयाबीनला कोणत्या रोगांचा धोका आहे?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "सोयाबीनला प्रामुख्याने तांबेरा, पिवळा मोझॅक..."
      }
    }
  ]
}
```

### 3.6 HowTo (Treatment Protocols)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to treat Soybean Rust Disease",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Identify symptoms",
      "text": "Look for small tan to dark brown lesions on the underside of leaves..."
    },
    {
      "@type": "HowToStep",
      "name": "Apply fungicide",
      "text": "Spray Hexaconazole 5% EC at 1ml/liter water..."
    }
  ]
}
```

---

## 4. Technical SEO Checklist

### 4.1 Robots & Sitemap

**robots.txt:**
```
User-agent: *
Allow: /
Disallow: /app/
Disallow: /api/

Sitemap: https://aikrushimitra.in/sitemap.xml
Sitemap: https://aikrushimitra.in/sitemap-crops.xml
Sitemap: https://aikrushimitra.in/sitemap-diseases.xml
Sitemap: https://aikrushimitra.in/sitemap-mandi.xml
Sitemap: https://aikrushimitra.in/sitemap-weather.xml
Sitemap: https://aikrushimitra.in/sitemap-schemes.xml
Sitemap: https://aikrushimitra.in/sitemap-blog.xml
```

**Sitemap generation:**
- Static sitemaps for SSG pages (generated at build time)
- Dynamic sitemaps for ISR pages (regenerated daily)
- `<lastmod>` tag reflects actual content update date
- Maximum 50,000 URLs per sitemap file

### 4.2 Meta Tags Template

```html
<head>
  <title>{PageTitle} | AI Krushi Mitra</title>
  <meta name="description" content="{150-char description with keywords}">
  <link rel="canonical" href="{canonical URL}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="{PageTitle}">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="{1200x630 image}">
  <meta property="og:url" content="{canonical URL}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="mr_IN">
  <meta property="og:locale:alternate" content="hi_IN">
  <meta property="og:locale:alternate" content="en_IN">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{PageTitle}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{1200x630 image}">
  
  <!-- Language -->
  <meta http-equiv="content-language" content="mr">
  <link rel="alternate" hreflang="mr" href="{mr URL}">
  <link rel="alternate" hreflang="hi" href="{hi URL}">
  <link rel="alternate" hreflang="en" href="{en URL}">
  <link rel="alternate" hreflang="x-default" href="{en URL}">
  
  <!-- Performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="https://firestore.googleapis.com">
</head>
```

### 4.3 Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor | Our Target |
|--------|------|-------------------|------|------------|
| **LCP** | ≤2.5s | 2.5-4.0s | >4.0s | **≤2.0s** |
| **INP** | ≤200ms | 200-500ms | >500ms | **≤150ms** |
| **CLS** | ≤0.1 | 0.1-0.25 | >0.25 | **≤0.05** |

---

## 5. Topic Clusters & Internal Linking

### 5.1 Cluster Structure

```
Pillar Page: /crops/soybean/
    ├── Cluster: /diseases/soybean-rust/
    ├── Cluster: /diseases/yellow-mosaic-virus/
    ├── Cluster: /mandi-bhav/maharashtra/latur/soybean/
    ├── Cluster: /mandi-bhav/madhya-pradesh/indore/soybean/
    ├── Cluster: /schemes/pm-kisan/ (eligibility section)
    ├── Cluster: /weather/maharashtra/latur/ (soybean season)
    └── Cluster: /blog/best-soybean-varieties-2026/

Pillar Page: /mandi-bhav/maharashtra/nashik/onion/
    ├── Cluster: /crops/onion/
    ├── Cluster: /mandi-bhav/maharashtra/pune/onion/
    ├── Cluster: /weather/maharashtra/nashik/
    └── Cluster: /blog/onion-price-prediction-tips/
```

### 5.2 Internal Linking Rules

1. Every crop guide links to its common diseases (≥3 links)
2. Every disease guide links back to affected crops (≥2 links)
3. Every mandi bhav page links to the crop guide + weather for that region
4. Every page links to the parent hub page (breadcrumb)
5. Maximum 100 internal links per page
6. Use descriptive anchor text (not "click here")
7. Contextual links within body content (not just navigation)
