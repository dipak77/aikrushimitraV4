// RAG Engine — Hybrid Search (metadata + keyword + vector), Re-ranking, Query Rewrite, Citations

import { KNOWLEDGE_BASE } from './knowledge-base.js';
import { resolveAllEntities, ALL_ENTITIES, getRelatedEntities } from './taxonomy.js';

// Query Rewrite
export function rewriteQuery(query) {
  const detectedEntities = resolveAllEntities(query);

  // Detect intent
  const intentMap = {
    'बीमारी|रोग|पत्ती|पीली|धब्बा|झुलसा|फफूंद|सुंडी|disease|blight|rot|mildew|pest|worm|borer': 'diagnosis',
    'इलाज|उपचार|दवा|छिड़काव|spray|treatment|cure|medicine': 'treatment',
    'योजना|सब्सिडी|सहायता|scheme|subsidy|pm-kisan|pmkisan|govt|government': 'scheme',
    'मौसम|बारिश|तापमान|weather|rain|temperature|forecast': 'weather',
    'भाव|बाजार|कीमत|मंडी|market|price|mandi|rate': 'market',
    'सिंचाई|पानी|irrigation|water|drip|sprinkler': 'irrigation',
    'मिट्टी|जांच|ph|soil|test|nutrient|npk': 'soil',
    'खाद|उर्वरक|fertilizer|urea|dap|compost|npk': 'fertilizer',
    'कीट|सुंडी|मक्खी|pest|insect|bug|armyworm|bollworm': 'pest',
  };

  let intent = 'general';
  const lowerQuery = query.toLowerCase();
  for (const [pattern, mappedIntent] of Object.entries(intentMap)) {
    if (new RegExp(pattern, 'i').test(lowerQuery)) {
      intent = mappedIntent;
      break;
    }
  }

  // Detect language
  const isHindi = /[\u0900-\u097F]/.test(query);
  const isMarathi = /[\u0900-\u097F]/.test(query) && /आहे|होते|करा|नाही/.test(query);
  const detectedLanguage = isMarathi ? 'mr' : isHindi ? 'hi' : 'en';

  // Extract keywords
  const stopwords = new Set(['का', 'के', 'की', 'में', 'है', 'हैं', 'को', 'से', 'पर', 'और', 'या', 'the', 'a', 'an', 'is', 'are', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'how', 'what', 'why']);
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));

  // Rewrite: expand with canonical names
  let rewritten = query;
  for (const entity of detectedEntities) {
    if (!rewritten.toLowerCase().includes(entity.canonicalName.toLowerCase())) {
      rewritten += ` ${entity.canonicalName}`;
    }
  }

  return { original: query, rewritten, intent, detectedEntities, detectedLanguage, keywords };
}

// Metadata Filter
function matchesFilter(doc, filters) {
  const m = doc.metadata;
  if (filters.crop && filters.crop.length > 0) {
    if (!filters.crop.some((c) => m.crop?.includes(c))) return false;
  }
  if (filters.season && filters.season.length > 0) {
    if (!filters.season.some((s) => m.season?.includes(s))) return false;
  }
  if (filters.state && filters.state.length > 0) {
    if (!filters.state.some((s) => m.state?.includes(s) || m.state?.includes('all'))) return false;
  }
  if (filters.soilType && filters.soilType.length > 0) {
    if (!filters.soilType.some((s) => m.soilType?.includes(s))) return false;
  }
  if (filters.growthStage && filters.growthStage.length > 0) {
    if (!filters.growthStage.some((s) => m.growthStage?.includes(s))) return false;
  }
  if (filters.diseaseType && filters.diseaseType.length > 0) {
    if (!filters.diseaseType.some((s) => m.diseaseType?.includes(s))) return false;
  }
  if (filters.documentType && filters.documentType.length > 0) {
    if (!filters.documentType.includes(m.documentType)) return false;
  }
  if (filters.confidence && filters.confidence.length > 0) {
    if (!filters.confidence.includes(doc.confidence)) return false;
  }
  if (filters.language && !m.language.includes(filters.language)) return false;
  if (filters.persona && !m.personas.includes(filters.persona)) return false;
  return true;
}

// Keyword Search (BM25-like)
function keywordScore(doc, keywords) {
  let score = 0;
  const docText = (doc.title + ' ' + doc.titleHi + ' ' + doc.content + ' ' + doc.summary + ' ' + doc.tags.join(' ') + ' ' + doc.keywords.join(' ')).toLowerCase();

  for (const kw of keywords) {
    const count = (docText.match(new RegExp(kw, 'gi')) || []).length;
    score += count * 2;

    // Title match bonus
    if (doc.title.toLowerCase().includes(kw) || doc.titleHi.includes(kw)) {
      score += 5;
    }
    // Tag match bonus
    if (doc.tags.some((t) => t.toLowerCase().includes(kw))) {
      score += 3;
    }
  }
  return score;
}

// Vector Search (simulated cosine similarity)
function vectorScore(doc, queryEmbedding) {
  if (!doc.embeddingPlaceholder || doc.embeddingPlaceholder.length === 0) return 0;
  const docEmb = doc.embeddingPlaceholder;
  const minLen = Math.min(docEmb.length, queryEmbedding.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < minLen; i++) {
    dotProduct += docEmb[i] * queryEmbedding[i];
    normA += docEmb[i] * docEmb[i];
    normB += queryEmbedding[i] * queryEmbedding[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dotProduct / denom : 0;
}

// Generate query pseudo-embeddings
function generateQueryEmbedding(query, entities) {
  const dim = 5;
  const embedding = new Array(dim).fill(0);
  for (const entity of entities) {
    const idx = ALL_ENTITIES.indexOf(entity) % dim;
    embedding[idx] += 0.5;
  }
  if (/कपास|cotton/i.test(query)) embedding[0] += 0.3;
  if (/सोया|soybean/i.test(query)) embedding[1] += 0.3;
  if (/गेहूं|wheat/i.test(query)) embedding[2] += 0.3;
  if (/सुंडी|worm|bollworm/i.test(query)) embedding[3] += 0.3;
  if (/योजना|scheme|subsidy/i.test(query)) embedding[4] += 0.3;
  return embedding;
}

// Hybrid Search
export function hybridSearch(query, filters, topK = 5) {
  const rq = rewriteQuery(query);
  const queryEmbedding = generateQueryEmbedding(query, rq.detectedEntities);

  const results = [];

  for (const doc of KNOWLEDGE_BASE) {
    // Apply metadata filters
    if (filters && !matchesFilter(doc, filters)) continue;

    // Calculate scores
    const kwScore = keywordScore(doc, rq.keywords);
    const vScore = vectorScore(doc, queryEmbedding);

    // Metadata matching score (entity-based)
    let metaScore = 0;
    for (const entity of rq.detectedEntities) {
      if (doc.metadata.crop?.includes(entity.id)) metaScore += 10;
      if (doc.metadata.disease?.includes(entity.id)) metaScore += 10;
      if (doc.tags.some((t) => entity.canonicalName.toLowerCase().includes(t))) metaScore += 3;
    }

    // Combined score
    const totalScore = kwScore * 0.4 + vScore * 30 + metaScore * 0.3 + (doc.confidenceScore / 100) * 5;

    // Filter minimum relevance
    if (totalScore > 0.5 || kwScore > 0 || vScore > 0.1 || metaScore > 0) {
      results.push({
        doc,
        score: totalScore,
        keywordScore: kwScore,
        vectorScore: vScore,
        metadataScore: metaScore,
        matchedEntities: rq.detectedEntities.filter((e) =>
          doc.metadata.crop?.includes(e.id) ||
          doc.metadata.disease?.includes(e.id) ||
          doc.tags.some((t) => e.canonicalName.toLowerCase().includes(t))
        ),
        citation: {
          title: doc.title,
          source: doc.metadata.source,
          confidence: doc.confidenceScore,
          version: doc.version,
        },
      });
    }
  }

  // Rank sorting
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}

// Context Compression
export function compressContext(results, maxChars = 2000) {
  let context = '';
  for (const result of results) {
    const snippet = result.doc.summary || result.doc.content.slice(0, 300);
    const addition = `[${result.doc.id}] ${result.doc.title}\n${snippet}\nSource: ${result.doc.metadata.source} | Confidence: ${result.doc.confidenceScore}%\n\n`;
    if (context.length + addition.length > maxChars) break;
    context += addition;
  }
  return context;
}

// Citation Generation
export function generateCitations(results) {
  return results.map((r) => {
    const [id] = r.doc.id.split('_');
    return `[${id.toUpperCase()}-${r.doc.id.slice(-3)}] ${r.doc.title} — ${r.doc.metadata.source} (${r.doc.confidenceScore}% confidence)`;
  });
}

// AI Auto-Tagging Ingestion Analyzer
export function autoTagDocument(content) {
  const entities = resolveAllEntities(content);

  const tags = {
    crop: entities.filter((e) => e.type === 'crop').map((e) => e.id),
    disease: entities.filter((e) => e.type === 'disease' || e.type === 'pest').map((e) => e.id),
    season: [],
    state: [],
    soilType: [],
    growthStage: [],
    diseaseType: entities.filter((e) => e.type === 'pest').length > 0 ? ['pest'] : entities.filter((e) => e.type === 'disease').length > 0 ? ['fungal'] : [],
    language: /[\u0900-\u097F]/.test(content) ? 'hi' : 'en',
    documentType: 'article',
    keywords: [],
    entities,
    confidence: 0,
  };

  // Detect season
  if (/खरीफ|kharif|मानसून|monsoon/i.test(content)) tags.season.push('kharif');
  if (/रबी|rabi|सर्दी|winter/i.test(content)) tags.season.push('rabi');
  if (/गर्मी|summer/i.test(content)) tags.season.push('summer');

  // Detect states
  const statePatterns = {
    Maharashtra: 'महाराष्ट्र|Maharashtra',
    Gujarat: 'गुजरात|Gujarat|ગુજરાત',
    Punjab: 'पंजाब|Punjab|ਪੰਜਾਬ',
    'Uttar Pradesh': 'उत्तर प्रदेश|Uttar Pradesh|UP',
    Karnataka: 'कर्नाटक|Karnataka|ಕರ್ನಾಟಕ',
    'Madhya Pradesh': 'मध्य प्रदेश|Madhya Pradesh|MP',
  };
  for (const [state, pattern] of Object.entries(statePatterns)) {
    if (new RegExp(pattern, 'i').test(content)) tags.state.push(state);
  }

  // Detect soil types
  if (/काली|black/i.test(content)) tags.soilType.push('black');
  if (/लाल|red/i.test(content)) tags.soilType.push('red');
  if (/बलुई|sandy/i.test(content)) tags.soilType.push('sandy');
  if (/दोमट|loamy/i.test(content)) tags.soilType.push('loamy');

  // Keywords generator
  const stopwords = new Set(['का', 'के', 'की', 'में', 'है', 'हैं', 'को', 'से', 'पर', 'और', 'the', 'a', 'is', 'are', 'in', 'on']);
  tags.keywords = content
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopwords.has(w))
    .slice(0, 20);

  tags.confidence = Math.min(95, 50 + entities.length * 10 + tags.season.length * 5 + tags.state.length * 5);

  return tags;
}
