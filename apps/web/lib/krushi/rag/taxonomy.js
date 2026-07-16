// Knowledge Intelligence Layer — Taxonomy, Canonical Entities, Synonyms, Knowledge Graph

// Crops
export const CROPS = [
  { id: 'crop_001', canonicalName: 'Cotton', type: 'crop', synonyms: ['Cotton', 'cotton', 'Kapas', 'कापूस', 'કપાસ', 'हತ್ತि', 'పత్తి', 'பருத்தி', 'কপাস'], translations: { hi: 'कापूस', mr: 'कापूस', en: 'Cotton', bn: 'কপাস', te: 'పత్తి', ta: 'பруத்தி' } },
  { id: 'crop_002', canonicalName: 'Soybean', type: 'crop', synonyms: ['Soybean', 'Soya', 'सोयाबीन', 'સોયાબીન', 'सोयाबीन'], translations: { hi: 'सोयाबीन', mr: 'सोयाबीन', en: 'Soybean', te: 'సోయాबीन', ta: 'சோயாபீன்' } },
  { id: 'crop_003', canonicalName: 'Wheat', type: 'crop', synonyms: ['Wheat', 'wheat', 'गेहूं', 'गहू', 'ઘઉં', 'गोधि', 'గోధుమ', 'கோதுமை'], translations: { hi: 'गेहूं', mr: 'गहू', en: 'Wheat', bn: 'গম', te: 'గోధుమ', ta: 'கோதுமை' } },
  { id: 'crop_004', canonicalName: 'Sugarcane', type: 'crop', synonyms: ['Sugarcane', 'उस', 'ऊस', 'गन्ना', 'શેરડી', 'ಕಬ್ಬು', 'చెరకు', 'கரும்பு'], translations: { hi: 'गन्ना', mr: 'ऊस', en: 'Sugarcane', te: 'చెరకు', ta: 'கரும்பு' } },
  { id: 'crop_005', canonicalName: 'Rice', type: 'crop', synonyms: ['Rice', 'Paddy', 'Dhan', 'धान', 'भात', 'ડાંગर', 'ಅಕ್ಕಿ', 'వరి', 'நெல்'], translations: { hi: 'धान', mr: 'भात', en: 'Rice', bn: 'ধান', te: 'వరి', ta: 'நெல்' } },
  { id: 'crop_006', canonicalName: 'Maize', type: 'crop', synonyms: ['Maize', 'Corn', 'मक्का', 'मकई', 'મકાઈ', 'ಮೆಕ್ಕೆ', 'మొక్కజొన్న', 'சோளம்'], translations: { hi: 'मक्का', mr: 'मका', en: 'Maize', te: 'మొక్కజొన్న', ta: 'சோளம்' } },
  { id: 'crop_007', canonicalName: 'Tomato', type: 'crop', synonyms: ['Tomato', 'टमाटर', 'टोमॅटो', 'ટમેટા', 'ಟೊम्याटೊ', 'టొమాటో', 'தக்காளி'], translations: { hi: 'टमाटर', mr: 'टोमॅटो', en: 'Tomato', te: 'టొమాటో', ta: 'தக்காளி' } },
  { id: 'crop_008', canonicalName: 'Onion', type: 'crop', synonyms: ['Onion', 'प्याज', 'कांदा', 'ડુંગળી', 'ಈರುಳ್ಳಿ', 'ఉల్లిपाय', 'வெங்காயம்'], translations: { hi: 'प्याज', mr: 'कांदा', en: 'Onion', te: 'ఉल्लीपाय', ta: 'வெங்காயம்' } },
  { id: 'crop_009', canonicalName: 'Chickpea', type: 'crop', synonyms: ['Chickpea', 'Gram', 'Chana', 'चना', 'हरभरा', 'ચણા', 'ಕಡಲೆ', 'శనగ', 'கடலை'], translations: { hi: 'चना', mr: 'हरभरा', en: 'Chickpea', te: 'శనగ', ta: 'கடலை' } },
  { id: 'crop_010', canonicalName: 'Groundnut', type: 'crop', synonyms: ['Groundnut', 'Peanut', 'Mungfali', 'मूंगफली', 'भुईमूग', 'મગફળી', 'ಕಡಲೆಕಾಯಿ', 'வேరుशनग', 'நிலக்கடலை'], translations: { hi: 'मूंगफली', mr: 'भुईमूग', en: 'Groundnut', te: 'வேరుशనగ', ta: 'நிலக்கடலை' } },
];

// Diseases & Pests
export const DISEASES = [
  { id: 'dis_001', canonicalName: 'Pink Bollworm', type: 'pest', synonyms: ['Pink Bollworm', 'गुलाबी सुंडी', 'गुलाबी बोलवर्म', 'Pink bollworm', 'Pectinophora gossypiella'], translations: { hi: 'गुलाबी सुंडी', mr: 'गुलाबी बोलवर्म', en: 'Pink Bollworm' } },
  { id: 'dis_002', canonicalName: 'Fall Armyworm', type: 'pest', synonyms: ['Fall Armyworm', 'FAW', 'Spodoptera frugiperda', 'फॉल आर्मीवर्म', 'लष्करी इल्ली', 'पडदा अळी'], translations: { hi: 'फॉल आर्मीवर्म', mr: 'लष्करी इल्ली', en: 'Fall Armyworm' } },
  { id: 'dis_003', canonicalName: 'Leaf Blight', type: 'disease', synonyms: ['Leaf Blight', 'पत्ती झुलसा', 'ಎಲೆ ಕರುकु', 'ఆకు మచ్చ వ్యాధి'], translations: { hi: 'पत्ती झुलसा', mr: 'पानावरील डाग', en: 'Leaf Blight' } },
  { id: 'dis_004', canonicalName: 'Blight', type: 'disease', synonyms: ['Blight', 'झुलसा', 'ब्लाईट', 'ब्लाइट'], translations: { hi: 'झुलसा', mr: 'ब्लाईट', en: 'Blight' } },
  { id: 'dis_005', canonicalName: 'Powdery Mildew', type: 'disease', synonyms: ['Powdery Mildew', 'फफूंद', 'powdery mildw', 'पुडी मिल्ड्यू'], translations: { hi: 'फफूंद', mr: 'पावडरी बुरशी', en: 'Powdery Mildew' } },
  { id: 'dis_006', canonicalName: 'Stem Borer', type: 'pest', synonyms: ['Stem Borer', 'तना छेदक', 'தண்டு துளையிடும் பூச்சி', 'కాండ తొలుచు పురుగు'], translations: { hi: 'तना छेदक', mr: 'खोड किडा', en: 'Stem Borer' } },
];

// Fertilizers
export const FERTILIZERS = [
  { id: 'fer_001', canonicalName: 'Urea', type: 'fertilizer', synonyms: ['Urea', 'यूरिया', 'યુરિયા', 'ಯೂರಿಯಾ', 'యూరియా', 'யூரியா'], translations: { hi: 'यूरिया', mr: 'यूरिया', en: 'Urea' } },
  { id: 'fer_002', canonicalName: 'DAP', type: 'fertilizer', synonyms: ['DAP', 'Di-Ammonium Phosphate', 'डीएपी', 'ડીએપી'], translations: { hi: 'डीएपी', mr: 'डीएपी', en: 'DAP' } },
  { id: 'fer_003', canonicalName: 'Vermicompost', type: 'fertilizer', synonyms: ['Vermicompost', 'वर्मीकम्पोस्ट', 'जैविक खाद', 'केंचवा खत', 'ಕೃಮಿ ಗೊಬ್ಬರ'], translations: { hi: 'वर्मीकम्पोस्ट', mr: 'केंचवा खत', en: 'Vermicompost' } },
  { id: 'fer_004', canonicalName: 'NPK', type: 'fertilizer', synonyms: ['NPK', 'एनपीके', 'NPK 10-26-26', 'NPK 20-20-20'], translations: { hi: 'एनपीके', mr: 'एनपीके', en: 'NPK' } },
];

// All entities combined for synonym lookup
export const ALL_ENTITIES = [...CROPS, ...DISEASES, ...FERTILIZERS];

// Synonym Resolution
const synonymIndex = new Map();
ALL_ENTITIES.forEach((entity) => {
  entity.synonyms.forEach((syn) => {
    synonymIndex.set(syn.toLowerCase().trim(), entity);
  });
});

export function resolveEntity(text) {
  const normalized = text.toLowerCase().trim();
  return synonymIndex.get(normalized) || null;
}

export function resolveAllEntities(text) {
  const found = [];
  const seen = new Set();
  for (const entity of ALL_ENTITIES) {
    for (const syn of entity.synonyms) {
      if (text.toLowerCase().includes(syn.toLowerCase())) {
        if (!seen.has(entity.id)) {
          found.push(entity);
          seen.add(entity.id);
        }
        break;
      }
    }
  }
  return found;
}

// Knowledge Graph Relations
export const KNOWLEDGE_GRAPH = [
  { from: 'crop_001', to: 'dis_001', relation: 'affected-by' },
  { from: 'crop_001', to: 'dis_005', relation: 'affected-by' },
  { from: 'crop_001', to: 'soil_black', relation: 'grown-in' },
  { from: 'crop_001', to: 'fer_001', relation: 'requires' },
  { from: 'crop_001', to: 'fer_002', relation: 'requires' },
  { from: 'dis_001', to: 'treat_pheromone_trap', relation: 'controlled-by', metadata: { treatment: 'Pheromone Trap' } },
  { from: 'dis_001', to: 'scheme_001', relation: 'available-under', metadata: { scheme: 'Subsidy on Pheromone Traps' } },
  { from: 'crop_002', to: 'dis_003', relation: 'affected-by' },
  { from: 'crop_004', to: 'dis_002', relation: 'affected-by' },
  { from: 'dis_002', to: 'treat_ipm', relation: 'controlled-by', metadata: { treatment: 'Integrated Pest Management' } },
  { from: 'crop_003', to: 'dis_004', relation: 'affected-by' },
  { from: 'crop_005', to: 'dis_006', relation: 'affected-by' },
  { from: 'crop_004', to: 'fer_003', relation: 'requires' },
];

export function getRelatedEntities(entityId) {
  const related = [];
  for (const rel of KNOWLEDGE_GRAPH) {
    if (rel.from === entityId) {
      const target = ALL_ENTITIES.find((e) => e.id === rel.to);
      if (target) related.push({ entity: target, relation: rel.relation, metadata: rel.metadata });
    } else if (rel.to === entityId) {
      const source = ALL_ENTITIES.find((e) => e.id === rel.from);
      if (source) related.push({ entity: source, relation: `inverse-${rel.relation}`, metadata: rel.metadata });
    }
  }
  return related;
}

// Translations and helpers
export const STAGES_HI = {
  'land-preparation': 'जमीन तैयारी',
  sowing: 'बुवाई',
  germination: 'अंकुरण',
  vegetative: 'वानस्पतिक वृद्धि',
  flowering: 'फूल आना',
  'boll-formation': 'बाली निर्माण',
  'grain-filling': 'दाना भराई',
  harvest: 'कटाई',
  'post-harvest': 'कटाई के बाद',
};

export const SEASONS_HI = {
  kharif: 'खरीफ',
  rabi: 'रबी',
  summer: 'गर्मी',
  monsoon: 'मानसून',
  winter: 'सर्दी',
  zaid: 'ज़ायद',
};

export const SOIL_TYPES_HI = {
  black: 'काली मिट्टी',
  red: 'लाल मिट्टी',
  sandy: 'बलुई मिट्टी',
  clay: 'चिकनी मिट्टी',
  loamy: 'दोमट मिट्टी',
  alluvial: 'जलोढ़ मिट्टी',
  laterite: 'लैटेराइट मिट्टी',
  alkaline: 'क्षारीय मिट्टी',
};

export const CONFIDENCE_SCORE = {
  'government-verified': 95,
  'expert-reviewed': 90,
  'community-verified': 70,
  'ai-generated': 50,
};

export const CONFIDENCE_HI = {
  'government-verified': 'सरकारी सत्यापित',
  'expert-reviewed': 'विशेषज्ञ समीक्षित',
  'community-verified': 'समुदाय सत्यापित',
  'ai-generated': 'AI जनित',
};

export const SEVERITY_HI = {
  normal: 'सामान्य',
  warning: 'चेतावनी',
  critical: 'गंभीर',
  emergency: 'आपातकाल',
};

export const PERSONA_HI = {
  farmer: 'किसान',
  officer: 'कृषि अधिकारी',
  researcher: 'शोधकर्ता',
  student: 'विद्यार्थी',
  dealer: 'डीलर',
  exporter: 'निर्यातक',
  ngo: 'एनजीओ',
  fpo: 'FPO',
  bank: 'बैंक',
  insurance: 'बीमा',
};
