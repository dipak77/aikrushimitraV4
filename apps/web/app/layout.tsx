import React from 'react';
import '../index.css';

export const metadata = {
  title: "AI Krushi Mitra - #1 AI Smart Farming App | Live Mandi Rates, Crop Disease Detection & Weather Forecast",
  description: "AI Krushi Mitra is India's leading AI-powered kisan application. Get instant crop disease detection (पीक रोग निदान / फसल रोग पहचान), live mandi rates (मंडी भाव), soil analysis, and weather forecasts in 12+ Indian languages (Hindi, Marathi, Telugu, Tamil). Empowering 10 lakh+ farmers.",
  keywords: "AI Krushi Mitra, AI farming assistant, smart agriculture, crop disease detection, soil analysis, precision farming, Indian agriculture, AI agriculture India, farm management, crop advisory, weather forecast farming, mandi prices, कृषि मित्र, स्मार्ट खेती, पीक रोग निदान, आज का मंडी भाव",
  alternates: {
    canonical: 'https://aikrushimitra.in/',
    languages: {
      'x-default': 'https://aikrushimitra.in/',
      'en': 'https://aikrushimitra.in/?lang=en',
      'hi': 'https://aikrushimitra.in/?lang=hi',
      'mr': 'https://aikrushimitra.in/?lang=mr',
      'te': 'https://aikrushimitra.in/?lang=te',
      'ta': 'https://aikrushimitra.in/?lang=ta',
      'kn': 'https://aikrushimitra.in/?lang=kn',
      'bn': 'https://aikrushimitra.in/?lang=bn',
      'gu': 'https://aikrushimitra.in/?lang=gu',
      'pa': 'https://aikrushimitra.in/?lang=pa',
      'ml': 'https://aikrushimitra.in/?lang=ml',
      'or': 'https://aikrushimitra.in/?lang=or',
      'as': 'https://aikrushimitra.in/?lang=as',
    }
  },
  other: {
    'theme-color': '#020610',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Master JSON-LD schemas
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Krushi Mitra",
    "url": "https://aikrushimitra.in/",
    "applicationCategory": "AgricultureApplication",
    "operatingSystem": "Android, iOS, Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "description": "AI-powered agricultural advisor providing weather, market rates, and crop health analysis for Indian farmers.",
    "featureList": [
      "Daily Mandi Bhav (मंडी भाव)",
      "AI Crop Disease Detection",
      "Farmer Weather Forecast",
      "Soil Health Card Analysis",
      "Government Schemes Information"
    ],
    "author": {
      "@type": "Organization",
      "name": "AI Krushi Mitra Team"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is AI Krushi Mitra free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All core features including crop disease detection, weather alerts, and market prices are completely free for farmers. We believe every farmer deserves access to smart farming technology."
        }
      },
      {
        "@type": "Question",
        "name": "Which languages are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support 12+ Indian languages including Hindi, Marathi, Telugu, Tamil, Kannada, Bengali, Gujarati, Punjabi, Malayalam, Odia, Assamese, and English. You can interact via text or voice in any of these languages."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate is the crop disease detection?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI models achieve 95%+ accuracy in identifying crop diseases. The models are continuously trained on millions of images and validated by agricultural scientists to ensure reliability."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need a smartphone to use it?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AI Krushi Mitra works on any device with a web browser — smartphones, tablets, or computers. The platform is optimized for basic smartphones and works even on slower 2G networks."
        }
      }
    ]
  };

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Core Web Vitals Preconnect Links */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://esm.sh" />
        <link rel="preconnect" href="https://unpkg.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Leaflet Stylesheet */}
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
        
        {/* Dynamic Schema Injection */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="selection:bg-emerald-500/30 selection:text-emerald-50 bg-[#020617] text-[#f1f5f9] min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
