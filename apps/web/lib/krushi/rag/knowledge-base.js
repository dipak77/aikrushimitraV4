// Knowledge Document Store — Rich metadata, versioning, confidence scoring

export const KNOWLEDGE_BASE = [
  {
    id: 'kb_001',
    title: 'Pink Bollworm Management in Cotton',
    titleHi: 'कपास में गुलाबी सुंडी प्रबंधन',
    content: `गुलाबी सुंडी (Pink Bollworm) कपास की सबसे विनाशकारी कीट है। यह फूल और बालियों को नुकसान पहुंचाती है।

**लक्षण:**
• बालियों में छेद दिखाई देते हैं
• बीयां काली हो जाती हैं
• सूखी बालियां खुली रहती हैं

**प्रबंधन:**
1. फेरोमोन ट्रैप का उपयोग करें (प्रति एकड़ 4-5 ट्रैप)
2. Bt कपास की किस्में लगाएं
3. फसल चक्र अपनाएं
4. नीम तेल 5ml प्रति लीटर पानी में छिड़काव करें
5. अगर कीट बढ़े तो स्पिनोसैड 45SC का छिड़काव करें

**सरकारी सहायता:**
महासभा सरकार फेरोमोन ट्रैप पर 50% सब्सिडी देती है।

**रोकथाम का समय:**
जुलाई-अगस्त (फूल आने के दौरान) सबसे महत्वपूर्ण है।`,
    summary: 'गुलाबी सुंडी की रोकथाम के लिए फेरोमोन ट्रैप, Bt कपास, नीम तेल और सरकारी सब्सिडी की जानकारी।',
    metadata: {
      crop: ['crop_001'],
      disease: ['dis_001'],
      season: ['kharif', 'monsoon'],
      state: ['Maharashtra', 'Gujarat', 'Telangana'],
      soilType: ['black'],
      growthStage: ['flowering', 'boll-formation'],
      diseaseType: ['pest'],
      language: ['hi', 'en'],
      documentType: 'extension-manual',
      source: 'ICAR-CICR',
      sourceUrl: 'https://cicr.org.in',
      year: 2025,
      organic: false,
      verified: true,
      priority: 'high',
      personas: ['farmer', 'officer'],
      geo: { lat: 21.0, lng: 75.5, country: 'India', state: 'Maharashtra' },
    },
    confidence: 'government-verified',
    confidenceScore: 95,
    qualityRating: 92,
    usageCount: 1543,
    userFeedback: 89,
    version: '2.1',
    lastUpdated: '2025-07-01',
    tags: ['cotton', 'pink-bollworm', 'pest-management', 'kharif'],
    keywords: ['गुलाबी सुंडी', 'कपास', 'फेरोमोन ट्रैप', 'Bt cotton', 'कीट नियंत्रण'],
    embeddingPlaceholder: [0.8, 0.3, 0.6, 0.1, 0.9],
  },
  {
    id: 'kb_002',
    title: 'Soybean Yellow Mosaic Virus Management',
    titleHi: 'सोयाबीन पीली मोज़ेक वायरस प्रबंधन',
    content: `पीली मोज़ेक वायरस (Yellow Mosaic Virus) सोयाबीन की प्रमुख बीमारी है। यह सफेद मक्खी (Whitefly) द्वारा फैलती है।

**लक्षण:**
• पत्तियां पीली हो जाती हैं
• मोज़ेक जैसे पैटर्न बनते हैं
• पौधे की वृद्धि रुक जाती है

**प्रबंधन:**
1. प्रतिरोधी किस्में लगाएं (JS 335, PK 416)
2. सफेद मक्खी के लिए इमिडाक्लोप्रिड छिड़काव
3. रोगित पौधों को तुरंत हटाएं
4. खरपतवार नियंत्रण रखें
5. बारिश के बाद जल निकासी सुनिश्चित करें

**समय:**
जुलाई-सितंबर (वानस्पतिक वृद्धि चरण) में सबसे अधिक जोखिम।`,
    summary: 'सोयाबीन पीली मोज़ेक वायरस की रोकथाम — प्रतिरोधी किस्में, सफेद मक्खी नियंत्रण, रोगित पौधे हटाना।',
    metadata: {
      crop: ['crop_002'],
      disease: ['dis_003'],
      season: ['kharif'],
      state: ['Maharashtra', 'Madhya Pradesh', 'Rajasthan'],
      soilType: ['black', 'alluvial'],
      growthStage: ['vegetative', 'flowering'],
      diseaseType: ['viral'],
      language: ['hi', 'en'],
      documentType: 'extension-manual',
      source: 'ICAR-IISR',
      year: 2025,
      verified: true,
      priority: 'high',
      personas: ['farmer', 'officer'],
      geo: { lat: 22.0, lng: 78.0, country: 'India', state: 'Madhya Pradesh' },
    },
    confidence: 'expert-reviewed',
    confidenceScore: 90,
    qualityRating: 88,
    usageCount: 892,
    userFeedback: 56,
    version: '1.5',
    lastUpdated: '2025-06-15',
    tags: ['soybean', 'yellow-mosaic', 'viral-disease', 'kharif'],
    keywords: ['पीली मोज़ेक', 'सोयाबीन', 'सफेद मक्खी', 'वायरस', 'whitefly'],
    embeddingPlaceholder: [0.7, 0.5, 0.4, 0.8, 0.3],
  },
  {
    id: 'kb_003',
    title: 'Wheat Blight Treatment and Prevention',
    titleHi: 'गेहूं में झुलसा उपचार और रोकथाम',
    content: `गेहूं में झुलसा (Blight) फंगल बीमारी है जो उमस और नमी के कारण होती है।

**लक्षण:**
• पत्तियों पर भूरे धब्बे
• पत्तियां सूखने लगती हैं
• बालियां हल्दी-भूरी हो जाती हैं

**उपचार:**
1. प्रोपिकोनाज़ोल 25 EC का छिड़काव (1ml प्रति लीटर)
2. बीज उपचार करें (कार्बेन्डाज़िम)
3. प्रतिरोधी किस्में चुनें (HD 2967, PBW 725)
4. संतुलित सिंचाई रखें
5. अतिरिक्त नाइट्रोजन से बचें

**रोकथाम:**
नवंबर में बुवाई के समय बीज उपचार अनिवार्य है।`,
    summary: 'गेहूं झुलसा — प्रोपिकोनाज़ोल छिड़काव, बीज उपचार, प्रतिरोधी किस्में।',
    metadata: {
      crop: ['crop_003'],
      disease: ['dis_004'],
      season: ['rabi', 'winter'],
      state: ['Punjab', 'Haryana', 'Uttar Pradesh'],
      soilType: ['loamy', 'alluvial'],
      growthStage: ['vegetative', 'flowering', 'grain-filling'],
      diseaseType: ['fungal'],
      language: ['hi', 'en'],
      documentType: 'extension-manual',
      source: 'ICAR-IIWBR',
      year: 2025,
      verified: true,
      priority: 'high',
      personas: ['farmer', 'officer', 'student'],
      geo: { lat: 30.7, lng: 76.7, country: 'India', state: 'Punjab' },
    },
    confidence: 'government-verified',
    confidenceScore: 95,
    qualityRating: 90,
    usageCount: 1245,
    userFeedback: 72,
    version: '2.0',
    lastUpdated: '2025-06-20',
    tags: ['wheat', 'blight', 'fungal', 'rabi'],
    keywords: ['झुलसा', 'गेहूं', 'फंगल', 'प्रोपिकोनाज़ोल', 'बीज उपचार'],
    embeddingPlaceholder: [0.6, 0.8, 0.3, 0.5, 0.7],
  },
  {
    id: 'kb_004',
    title: 'PM-KISAN Scheme Details',
    titleHi: 'PM-KISAN योजना विवरण',
    content: `प्रधानमंत्री किसान सम्मान निधि (PM-KISAN) योजना के तहत सभी योग्य किसानों को प्रति वर्ष ₹6000 की आर्थिक सहायता दी जाती है।

**योग्यता:**
• भूमि धारक किसान परिवार
• आय ₹2 लाख से कम (विशेष श्रेणियां छोड़कर)

**सहायता राशि:**
• वर्ष में 3 किस्तें (₹2000 प्रति किस्त)
• सीधे बैंक खाते में (DBT)

**आवेदन:**
pmkisan.gov.in पर ऑनलाइन आवेदन करें या नजदीकी CSC केंद्र पर जाएं।

**आवश्यक दस्तावेज़:**
• आधार कार्ड
• बैंक खाता
• भूमि पत्र
• मोबाइल नंबर`,
    summary: 'PM-KISAN योजना — ₹6000 वार्षिक सहायता, 3 किस्तें, DBT, आवेदन प्रक्रिया।',
    metadata: {
      season: ['kharif', 'rabi'],
      state: ['all'],
      language: ['hi', 'en'],
      documentType: 'scheme',
      source: 'Govt of India',
      sourceUrl: 'pmkisan.gov.in',
      year: 2025,
      verified: true,
      priority: 'high',
      personas: ['farmer', 'officer', 'ngo'],
    },
    confidence: 'government-verified',
    confidenceScore: 95,
    qualityRating: 95,
    usageCount: 5432,
    userFeedback: 312,
    version: '3.2',
    lastUpdated: '2025-07-02',
    tags: ['pm-kisan', 'scheme', 'subsidy', 'government'],
    keywords: ['PM-KISAN', 'किसान सम्मान निधि', '6000', 'सब्सिडी', 'DBT'],
    embeddingPlaceholder: [0.9, 0.2, 0.5, 0.4, 0.8],
  },
  {
    id: 'kb_005',
    title: 'Drip Irrigation Best Practices',
    titleHi: 'टपक सिंचाई सर्वोत्तम अभ्यास',
    content: `टपक सिंचाई (Drip Irrigation) पानी की बचत का सबसे प्रभावी तरीका है। इससे 40-70% पानी बचत होती है।

**फायदे:**
• 40-70% पानी की बचत
• खाद का बेहतर उपयोग (फर्टिगेशन)
• खरपतवार कम
• उपज में 20-30% वृद्धि

**स्थापना:**
1. मुख्य पाइप लाइन
2. सब-मेन लाइन
3. लेटरल लाइन (प्रति पंक्ति)
4. ड्रिपर (प्रति पौधे) — 4 LPH या 8 LPH

**अनुरक्षण:**
• मासिक फ़िल्टर सफाई
• एसिड ट्रीटमेंट (3 महीने में)
• लीक की जांच

**सब्सिडी:**
PMKSY के तहत 55-90% सब्सिडी उपलब्ध है।`,
    summary: 'टपक सिंचाई — 40-70% पानी बचत, फर्टिगेशन, PMKSY सब्सिडी।',
    metadata: {
      season: ['kharif', 'rabi', 'summer'],
      state: ['Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu'],
      soilType: ['black', 'red', 'sandy'],
      irrigation: ['drip'],
      language: ['hi', 'en'],
      documentType: 'extension-manual',
      source: 'ICAR-IIWM',
      year: 2025,
      verified: true,
      priority: 'medium',
      personas: ['farmer', 'officer'],
    },
    confidence: 'expert-reviewed',
    confidenceScore: 90,
    qualityRating: 87,
    usageCount: 723,
    userFeedback: 45,
    version: '1.8',
    lastUpdated: '2025-06-10',
    tags: ['drip-irrigation', 'water-saving', 'pmksy', 'fertigation'],
    keywords: ['टपक सिंचाई', 'drip', 'पानी बचत', 'फर्टिगेशन', 'PMKSY'],
    embeddingPlaceholder: [0.5, 0.7, 0.8, 0.3, 0.6],
  },
  {
    id: 'kb_006',
    title: 'Fall Armyworm in Sugarcane',
    titleHi: 'गन्ने में फॉल आर्मीवर्म',
    content: `फॉल आर्मीवर्म (Fall Armyworm/FAW) गन्ने की नई पत्तियों को नुकसान पहुंचाता है।

**लक्षण:**
• पत्तियों पर खिड़की जैसे छेद
• गोल छेद (window-pane effect)
• पत्तियां निगली हुई दिखती हैं

**एकीकृत कीट प्रबंधन (IPM):**
1. निगरानी — फेरोमोन ट्रैप लगाएं
2. जैविक — Trichogramma कीट का उपयोग
3. बायो-कीटनाशक — NPV वायरस
4. रासायनिक — क्लोरोएनेट्रानिप्रोपाइल
5. सांस्कृतिक — रोगित पत्तियां जलाएं

**जोखिम का समय:**
जुलाई-नवंबर (नई पत्तियों के दौरान)।`,
    summary: 'फॉल आर्मीवर्म IPM — फेरोमोन ट्रैप, Trichogramma, NPV, क्लोरोएनेट्रानिप्रोपाइल।',
    metadata: {
      crop: ['crop_004'],
      disease: ['dis_002'],
      season: ['kharif', 'monsoon'],
      state: ['Maharashtra', 'Uttar Pradesh', 'Karnataka'],
      growthStage: ['vegetative'],
      diseaseType: ['pest'],
      language: ['hi', 'en'],
      documentType: 'extension-manual',
      source: 'ICAR-SBI',
      year: 2025,
      verified: true,
      priority: 'high',
      personas: ['farmer', 'officer', 'researcher'],
    },
    confidence: 'expert-reviewed',
    confidenceScore: 90,
    qualityRating: 85,
    usageCount: 567,
    userFeedback: 38,
    version: '1.3',
    lastUpdated: '2025-06-25',
    tags: ['fall-armyworm', 'sugarcane', 'ipm', 'pest'],
    keywords: ['फॉल आर्मीवर्म', 'गन्ना', 'FAW', 'Spodoptera', 'IPM'],
    embeddingPlaceholder: [0.4, 0.6, 0.9, 0.2, 0.5],
  },
  {
    id: 'kb_007',
    title: 'Soil Testing and Nutrient Management',
    titleHi: 'मिट्टी जांच और पोषक प्रबंधन',
    content: `मिट्टी जांच हर 2-3 वर्ष में करानी चाहिए। इससे सही खाद का चुनाव होता है।

**जांच पैरामीटर:**
• pH स्तर (6.0-7.5 इष्टतम)
• नाइट्रोजन (N)
• फॉस्फोरस (P)
• पोटेशियम (K)
• जैविक कार्बन

**पोषक अनुशंसा:**
• कम N → यूरिया बढ़ाएं + जैविक खाद
• कम P → DAP लगाएं
• कम K → म्यूरेट ऑफ पोटाश

**मिट्टी स्वास्थ्य कार्ड:**
मुफ़्त मिट्टी जांच — नजदीकी कृषि विज्ञान केंद्र (KVK) पर।`,
    summary: 'मिट्टी जांच — pH, NPK, जैविक कार्बन; खाद अनुशंसा; मुफ़्त मिट्टी स्वास्थ्य कार्ड।',
    metadata: {
      season: ['kharif', 'rabi'],
      state: ['all'],
      soilType: ['black', 'red', 'sandy', 'loamy', 'alluvial'],
      language: ['hi', 'en'],
      documentType: 'extension-manual',
      source: 'ICAR-IISR',
      year: 2025,
      verified: true,
      priority: 'medium',
      personas: ['farmer', 'officer', 'student'],
    },
    confidence: 'government-verified',
    confidenceScore: 95,
    qualityRating: 89,
    usageCount: 987,
    userFeedback: 67,
    version: '2.1',
    lastUpdated: '2025-06-18',
    tags: ['soil-testing', 'nutrient-management', 'npk', 'soil-health-card'],
    keywords: ['मिट्टी जांच', 'soil test', 'NPK', 'पोषक', 'मिट्टी स्वास्थ्य कार्ड'],
    embeddingPlaceholder: [0.7, 0.4, 0.6, 0.7, 0.4],
  },
  {
    id: 'kb_008',
    title: 'Vermicompost Production Guide',
    titleHi: 'वर्मीकम्पोस्ट उत्पादन गाइड',
    content: `वर्मीकम्पोस्ट जैविक खेती का आधार है। यह 45-60 दिनों में तैयार होता है।

**सामग्री:**
• केंचुआ (Eisenia fetida) — 1 kg प्रति टन
• गोबर / कम्पोस्ट
• कृषि अपशिष्ट

**विधि:**
1. छाया में बिस्तर बनाएं (3x4x1 फीट)
2. नीचे गोबर की परत
3. ऊपर केंचुआ छोड़ें
4. नमी 60-70% बनाए रखें
5. 45-60 दिन बाद तैयार

**फायदे:**
• उपज 15-20% बढ़ती है
• मिट्टी सुधरती है
• ₹50-80/kg बिक्री`,
    summary: 'वर्मीकम्पोस्ट — केंचुआ, गोबर, 45-60 दिन, ₹50-80/kg आय।',
    metadata: {
      crop: ['crop_001', 'crop_002', 'crop_003'],
      season: ['kharif', 'rabi', 'summer'],
      state: ['all'],
      soilType: ['loamy', 'alluvial'],
      language: ['hi', 'en'],
      documentType: 'extension-manual',
      source: 'NCOF',
      year: 2025,
      organic: true,
      verified: true,
      priority: 'medium',
      personas: ['farmer', 'ngo', 'fpo'],
    },
    confidence: 'expert-reviewed',
    confidenceScore: 90,
    qualityRating: 86,
    usageCount: 445,
    userFeedback: 28,
    version: '1.5',
    lastUpdated: '2025-05-30',
    tags: ['vermicompost', 'organic-farming', 'earthworm', 'compost'],
    keywords: ['वर्मीकम्पोस्ट', 'केंचुआ', 'जैविक खाद', 'compost', 'organic'],
    embeddingPlaceholder: [0.3, 0.5, 0.7, 0.6, 0.9],
  },
];

export function getDocumentById(id) {
  return KNOWLEDGE_BASE.find((d) => d.id === id);
}

export function getDocumentsByCrop(cropId) {
  return KNOWLEDGE_BASE.filter((d) => d.metadata.crop?.includes(cropId));
}

export function getDocumentsByDisease(diseaseId) {
  return KNOWLEDGE_BASE.filter((d) => d.metadata.disease?.includes(diseaseId));
}

export function getDocumentsByState(state) {
  return KNOWLEDGE_BASE.filter(
    (d) => d.metadata.state?.includes(state) || d.metadata.state?.includes('all')
  );
}

export function getDocumentsByType(docType) {
  return KNOWLEDGE_BASE.filter((d) => d.metadata.documentType === docType);
}

export function getDocumentsByConfidence(level) {
  return KNOWLEDGE_BASE.filter((d) => d.confidence === level);
}
