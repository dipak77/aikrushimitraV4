import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { KNOWLEDGE_BASE } from '../apps/web/data/knowledge';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read credentials
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error("❌ firebase-applet-config.json not found!");
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (!firebaseConfig.apiKey) {
  console.error("❌ Firebase config does not contain a valid apiKey!");
  process.exit(1);
}

console.log("🔥 Initializing Firebase app with project ID:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log(`🌱 Seeding ${KNOWLEDGE_BASE.length} articles to Firestore...`);

  let countCrops = 0;
  let countContent = 0;
  let countSchemes = 0;

  for (const item of KNOWLEDGE_BASE) {
    let collectionName = '';
    let docData: any = {};

    if (item.category === 'crop') {
      collectionName = 'crops';
      docData = {
        id: item.id,
        name: item.title,      // Backwards-compatible naming
        title: item.title,     // Dual compatibility
        scientificName: item.subtitle.en, // Backwards-compatible
        subtitle: item.subtitle, // Dual compatibility
        imageUrl: item.image,
        image: item.image,
        tags: item.tags || [],
        stats: item.stats || [],
        sections: item.sections || [],
        bestVarieties: (item as any).bestVarieties || [],
        expectedYield: (item as any).expectedYield || { mr: '', en: '' },
        marketInfo: (item as any).marketInfo || { mr: '', en: '' }
      };
      countCrops++;
    } else if (item.category === 'scheme') {
      collectionName = 'schemes';
      docData = {
        id: item.id,
        name: item.title,
        title: item.title,
        subtitle: item.subtitle,
        image: item.image,
        imageUrl: item.image,
        tags: item.tags || [],
        stats: item.stats || [],
        sections: item.sections || [],
        benefits: (item as any).stats?.map((s: any) => s.value).join(', ') || ''
      };
      countSchemes++;
    } else {
      // 'tech' and 'livestock'
      collectionName = 'content';
      docData = {
        id: item.id,
        category: item.category,
        title: item.title,
        subtitle: item.subtitle,
        image: item.image,
        imageUrl: item.image,
        tags: item.tags || [],
        stats: item.stats || [],
        sections: item.sections || []
      };
      countContent++;
    }

    try {
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, docData);
      console.log(`   ✅ Seeded ${collectionName}/${item.id}`);
    } catch (err: any) {
      console.error(`   ❌ Failed to seed ${collectionName}/${item.id}:`, err.message);
    }
  }

  console.log(`\n🎉 Seeding finished!`);
  console.log(`   Crops seeded: ${countCrops}`);
  console.log(`   Content seeded: ${countContent}`);
  console.log(`   Schemes seeded: ${countSchemes}`);
}

seed().catch(err => {
  console.error("❌ Seeding failed with error:", err);
});
