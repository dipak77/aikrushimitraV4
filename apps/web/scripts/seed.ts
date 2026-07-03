import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { KNOWLEDGE_BASE } from '../data/knowledge';
import { MOCK_MARKET, MOCK_VEGETABLES, CROP_SCHEDULES } from '../data/mock';
import { SCHEMES_DATA } from '../constants';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error(`❌ Firebase config file not found at: ${configPath}`);
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
console.log(`📡 Connecting to Firebase project: ${firebaseConfig.projectId}`);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Recursive function to strip/convert Lucide react components into string names
function sanitizeIcon(val: any): any {
  if (!val) return null;
  if (typeof val === 'function') {
    // If it's a React component, return its name (e.g. 'Leaf', 'Sprout')
    return val.name || 'Icon';
  }
  if (typeof val === 'object') {
    if (Array.isArray(val)) {
      return val.map(sanitizeIcon);
    }
    const res: any = {};
    for (const key of Object.keys(val)) {
      // If it's a React element/object or has $$typeof symbol, convert to string
      const propertyValue = val[key];
      if (propertyValue && typeof propertyValue === 'object' && propertyValue.$$typeof) {
        res[key] = 'ReactComponent';
      } else {
        res[key] = sanitizeIcon(propertyValue);
      }
    }
    return res;
  }
  return val;
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed crops and content from KNOWLEDGE_BASE
  for (const item of KNOWLEDGE_BASE) {
    if (item.category === 'crop') {
      console.log(`🌾 Seeding crop guide: ${item.id}`);
      await setDoc(doc(db, 'crops', item.id), {
        id: item.id,
        name: item.title,
        scientificName: '', // Static data doesn't have this, keeping standard structure
        aliases: [],
        category: 'cash_crop', // default category mapping
        seasons: item.tags.filter(t => ['kharif', 'rabi', 'zaid'].includes(t.toLowerCase())),
        regions: ['maharashtra'], // default region
        soilTypes: [],
        phRange: { min: 6.0, max: 7.5 },
        temperatureRange: { min: 15, max: 35 },
        rainfallRange: { min: 500, max: 1000 },
        waterRequirement: item.stats.find(s => s.icon === 'droplet')?.value || 'medium',
        irrigationMethod: [],
        growthDuration: parseInt(item.stats.find(s => s.icon === 'clock')?.value || '100'),
        calendar: {},
        commonDiseases: [],
        commonPests: [],
        companionCrops: [],
        rotationCrops: [],
        averageYield: item.expectedYield ? item.expectedYield.en : '',
        costOfCultivation: '',
        msp: 0,
        imageUrl: item.image,
        thumbnailUrl: item.image,
        lastUpdated: Date.now(),
        source: 'static_knowledge',
        tags: item.tags,
        stats: item.stats,
        sections: item.sections,
        bestVarieties: item.bestVarieties || [],
        marketInfo: item.marketInfo || null
      });
    } else if (item.category === 'scheme') {
      // Skip scheme category here as we will seed the full SCHEMES_DATA translations below
      continue;
    } else {
      // livestock, tech, etc. -> content collection
      console.log(`📖 Seeding content article: ${item.id} (${item.category})`);
      await setDoc(doc(db, 'content', item.id), {
        id: item.id,
        category: item.category,
        title: item.title,
        subtitle: item.subtitle,
        image: item.image,
        tags: item.tags,
        stats: item.stats,
        sections: item.sections,
        lastUpdated: Date.now()
      });
    }
  }

  // 2. Seed market prices from MOCK_MARKET and MOCK_VEGETABLES
  console.log('📈 Seeding market prices...');
  const dateStr = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD
  
  for (const crop of MOCK_MARKET) {
    const cropSlug = crop.name.toLowerCase();
    const docId = `maharashtra_yavatmal_apmc_${cropSlug}_${dateStr}`;
    console.log(`   - Market rate for: ${crop.name}`);
    await setDoc(doc(db, 'marketPrices', docId), {
      id: docId,
      state: 'maharashtra',
      district: 'Yavatmal',
      market: 'Yavatmal APMC',
      crop: crop.name,
      modalPrice: crop.price,
      minPrice: crop.price - 100,
      maxPrice: crop.price + 150,
      unit: 'quintal',
      currency: 'INR',
      priceChange: parseInt(crop.trend) || 0,
      trend: crop.trend.startsWith('+') ? 'up' : crop.trend.startsWith('-') ? 'down' : 'stable',
      date: dateStr,
      source: 'mock_market',
      fetchedAt: Date.now(),
      arrivalQuantity: crop.arrival === 'High' ? 120 : crop.arrival === 'Med' ? 60 : 20,
      history: crop.history || []
    });
  }

  for (const veg of MOCK_VEGETABLES) {
    const docId = `vegetables_mandi_${veg.id}`;
    console.log(`   - Veg Mandi Item: ${veg.nameEn}`);
    await setDoc(doc(db, 'marketPrices', docId), {
      id: docId,
      crop: veg.nameEn,
      nameMr: veg.nameMr,
      nameHi: veg.nameHi,
      nameEn: veg.nameEn,
      modalPrice: veg.price,
      unit: veg.unit,
      category: veg.category,
      image: veg.image,
      source: 'mock_vegetables',
      date: dateStr,
      fetchedAt: Date.now()
    });
  }

  // 3. Seed Crop Schedules
  console.log('📅 Seeding crop schedules...');
  for (const lang of Object.keys(CROP_SCHEDULES)) {
    console.log(`   - Language calendar: ${lang}`);
    const schedules = CROP_SCHEDULES[lang as keyof typeof CROP_SCHEDULES];
    const sanitizedSchedules = sanitizeIcon(schedules);
    await setDoc(doc(db, 'cropSchedules', lang), {
      lang,
      schedules: sanitizedSchedules
    });
  }

  // 4. Seed Schemes Data (SCHEMES_DATA)
  console.log('🏛️ Seeding government schemes translations...');
  for (const lang of Object.keys(SCHEMES_DATA)) {
    console.log(`   - Schemes list for language: ${lang}`);
    const schemes = SCHEMES_DATA[lang as keyof typeof SCHEMES_DATA];
    const sanitizedSchemes = sanitizeIcon(schemes);
    await setDoc(doc(db, 'schemes', lang), {
      lang,
      schemes: sanitizedSchemes
    });
  }

  console.log('✅ Database seeding completed successfully!');
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed with error:', err);
  process.exit(1);
});
