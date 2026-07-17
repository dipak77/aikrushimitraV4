// =============================================================================
// RAG Service — Production-Grade Hybrid Retrieval Pipeline (Pure ESM JavaScript)
//
// Uses dynamic imports with fallback so it works in mixed TS/JS ESM projects.
// If knowledge.js or dbService.js don't exist (because they're .ts), the service
// degrades gracefully: Firestore data only, empty arrays for failed imports.
// =============================================================================

// ─── Configuration ───────────────────────────────────────────────────────────
const CONFIG = {
  CHUNK_SIZE: parseInt(process.env.RAG_CHUNK_SIZE || '300', 10),
  CHUNK_OVERLAP: parseInt(process.env.RAG_CHUNK_OVERLAP || '50', 10),
  EMBEDDING_MODEL: process.env.RAG_EMBEDDING_MODEL || 'text-embedding-004',
  EMBEDDING_BATCH_SIZE: parseInt(process.env.RAG_EMBEDDING_BATCH || '100', 10),
  EMBEDDING_CONCURRENCY: parseInt(process.env.RAG_EMBEDDING_CONCURRENCY || '5', 10),
  CACHE_MAX_ENTRIES: parseInt(process.env.RAG_CACHE_MAX || '5000', 10),
  CACHE_TTL_MS: parseInt(process.env.RAG_CACHE_TTL_HOURS || '24', 10) * 60 * 60 * 1000,
  SEMANTIC_THRESHOLD: parseFloat(process.env.RAG_SEMANTIC_THRESHOLD || '0.35'),
  SCORE_THRESHOLD: parseFloat(process.env.RAG_SCORE_THRESHOLD || '0.45'),
  TOP_K_RETRIEVAL: parseInt(process.env.RAG_TOP_K_RETRIEVAL || '50', 10),
  TOP_K_FUSION: parseInt(process.env.RAG_TOP_K_FUSION || '20', 10),
  TOP_K_FINAL: parseInt(process.env.RAG_TOP_K_FINAL || '5', 10),
  RRF_K: parseInt(process.env.RAG_RRF_K || '60', 10),
  BM25_K1: parseFloat(process.env.RAG_BM25_K1 || '1.5'),
  BM25_B: parseFloat(process.env.RAG_BM25_B || '0.75'),
  ENABLE_RERANK: process.env.RAG_ENABLE_RERANK === 'true',
  MAX_QUERY_LEN: 500,
  MAX_INPUT_LEN: 2000,
};

// ─── Resilient Module Loader ─────────────────────────────────────────────────
// Tries .js → .ts → .mjs → .jsx → .tsx in order; returns null if all fail.
async function resilientImport(modulePath) {
  const extensions = ['.js', '.ts', '.mjs', '.jsx', '.tsx'];
  for (const ext of extensions) {
    try {
      return await import(modulePath + ext);
    } catch (e) {
      if (e.code !== 'ERR_MODULE_NOT_FOUND' && e.code !== 'ERR_UNKNOWN_FILE_EXTENSION') {
        throw e;
      }
    }
  }
  try {
    return await import(modulePath);
  } catch {
    return null;
  }
}

// ─── Lazy-loaded dependencies ─────────────────────────────────────────────────
let _knowledgeBase = null;
let _dbService = null;
let _depsLoaded = false;

async function ensureDependencies() {
  if (_depsLoaded) return;
  _depsLoaded = true;

  try {
    const kbModule = await resilientImport('../lib/krushi/rag/knowledge-base');
    _knowledgeBase = kbModule?.KNOWLEDGE_BASE || kbModule?.default || [];
  } catch (e) {
    console.warn('[RAG] Could not load knowledge base module:', e);
    _knowledgeBase = [];
  }

  try {
    _dbService = await resilientImport('./dbService');
  } catch {
    console.warn('[RAG] Could not load dbService module.');
    _dbService = null;
  }
}

function getKnowledgeBase() {
  return _knowledgeBase || [];
}

function getDbFunction(name) {
  if (_dbService && typeof _dbService[name] === 'function') {
    return _dbService[name];
  }
  return async () => [];
}

// ─── BM25 Index ──────────────────────────────────────────────────────────────
class BM25Index {
  constructor(corpus, k1 = 1.5, b = 0.75) {
    this.corpus = corpus;
    this.k1 = k1;
    this.b = b;
    this.N = corpus.length;
    this.docLengths = corpus.map(doc => doc.length);
    this.avgDocLength = this.docLengths.reduce((a, c) => a + c, 0) / Math.max(this.N, 1);
    this.termDocFreq = new Map();
    for (const doc of corpus) {
      const uniqueTerms = new Set(doc);
      for (const term of uniqueTerms) {
        this.termDocFreq.set(term, (this.termDocFreq.get(term) || 0) + 1);
      }
    }
  }
  idf(term) {
    const df = this.termDocFreq.get(term) || 0;
    return Math.log((this.N - df + 0.5) / (df + 0.5) + 1);
  }
  getScores(queryTerms) {
    const scores = new Array(this.N).fill(0);
    for (const term of queryTerms) {
      const idf = this.idf(term);
      if (idf === 0) continue;
      for (let i = 0; i < this.N; i++) {
        const doc = this.corpus[i];
        const docLen = this.docLengths[i];
        let tf = 0;
        for (const word of doc) { if (word === term) tf++; }
        if (tf === 0) continue;
        const denom = tf + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLength));
        scores[i] += (idf * (tf * (this.k1 + 1))) / denom;
      }
    }
    return scores;
  }
  search(queryTerms, topK) {
    const scores = this.getScores(queryTerms);
    return scores
      .map((score, index) => ({ index, score }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

// ─── Reciprocal Rank Fusion ──────────────────────────────────────────────────
function reciprocalRankFusion(rankedLists, k, topN) {
  const fusedScores = new Map();
  for (const rankedList of rankedLists) {
    rankedList.forEach((item, rank) => {
      const current = fusedScores.get(item.id) || 0;
      fusedScores.set(item.id, current + 1 / (k + rank + 1));
    });
  }
  return [...fusedScores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// ─── Bounded LRU Cache ───────────────────────────────────────────────────────
class BoundedEmbeddingCache {
  constructor(maxEntries, ttlMs) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
  }
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) { this.cache.delete(key); return undefined; }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.vector;
  }
  set(key, vector) {
    if (this.cache.size >= this.maxEntries) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    this.cache.set(key, { vector, expiresAt: Date.now() + this.ttlMs });
  }
  has(key) { return this.get(key) !== undefined; }
  get size() { return this.cache.size; }
  clear() { this.cache.clear(); }
}

// ─── Utilities ───────────────────────────────────────────────────────────────
function cleanText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[#*`_]/g, '').replace(/\s+/g, ' ').trim();
}
function sanitizeQuery(query) {
  if (!query || typeof query !== 'string') return '';
  return query.slice(0, CONFIG.MAX_QUERY_LEN).replace(/[<>{}\\]/g, '').replace(/```/g, '').trim();
}
export function chunkText(text, size = CONFIG.CHUNK_SIZE, overlap = CONFIG.CHUNK_OVERLAP) {
  const words = cleanText(text).split(' ');
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + size);
    chunks.push(chunkWords.join(' '));
    if (i + size >= words.length) break;
    i += size - overlap;
  }
  return chunks;
}
export function cosineSimilarity(v1, v2) {
  if (!v1 || !v2 || v1.length !== v2.length) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    normA += v1[i] * v1[i];
    normB += v2[i] * v2[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
function simpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return String(hash);
}
function deduplicateChunks(chunks, threshold = 0.85) {
  const result = [];
  const seenHashes = new Set();
  for (const chunk of chunks) {
    const hash = simpleHash(chunk.text.slice(0, 150));
    if (seenHashes.has(hash)) continue;
    let isDup = false;
    for (const existing of result) {
      if (existing.embedding && chunk.embedding) {
        if (cosineSimilarity(existing.embedding, chunk.embedding) > threshold) {
          isDup = true; break;
        }
      }
    }
    if (!isDup) { seenHashes.add(hash); result.push(chunk); }
  }
  return result;
}

// ─── Safe Property Accessors ──────────────────────────────────────────────────
function safeStr(val) { return typeof val === 'string' ? val : ''; }
function safeObj(val) { return val && typeof val === 'object' ? val : {}; }
function safeArr(val) { return Array.isArray(val) ? val : []; }

// ─── Firestore Data Loader ───────────────────────────────────────────────────
async function loadArticlesFromFirestore() {
  const articles = [];
  try {
    const fetchCrops = getDbFunction('fetchCrops');
    const fetchContent = getDbFunction('fetchContent');
    const fetchSchemes = getDbFunction('fetchSchemes');

    const [firestoreCrops, firestoreContent, firestoreSchemes] = await Promise.all([
      fetchCrops().catch(() => []),
      fetchContent().catch(() => []),
      fetchSchemes().catch(() => []),
    ]);

    for (const c of safeArr(firestoreCrops)) {
      articles.push({
        id: safeStr(c.id), category: 'crop', title: safeObj(c.name),
        subtitle: { en: safeStr(c.scientificName), mr: '' }, image: safeStr(c.imageUrl),
        tags: safeArr(c.tags), stats: safeArr(c.stats), sections: safeArr(c.sections),
      });
    }
    for (const c of safeArr(firestoreContent)) {
      articles.push({
        id: safeStr(c.id), category: safeStr(c.category) || 'tech', title: safeObj(c.title),
        subtitle: safeObj(c.subtitle), image: safeStr(c.image), tags: safeArr(c.tags),
        stats: safeArr(c.stats), sections: safeArr(c.sections),
      });
    }
    for (const s of safeArr(firestoreSchemes)) {
      if (s.schemes && Array.isArray(s.schemes)) {
        s.schemes.forEach((subScheme, idx) => {
          const title = safeStr(subScheme.title);
          const desc = safeStr(subScheme.desc);
          const eligibility = safeStr(subScheme.eligibility);
          const dept = safeStr(subScheme.dept);
          articles.push({
            id: safeStr(subScheme.id) || `scheme_${idx}`, category: 'scheme',
            title: { en: title, mr: title }, subtitle: { en: dept, mr: dept }, image: '',
            tags: subScheme.benefits ? [safeStr(subScheme.benefits)] : [], stats: [],
            sections: [{
              title: { en: 'Details', mr: 'माहिती' },
              content: { en: `${desc} ${eligibility}`, mr: `${desc} ${eligibility}` }
            }],
          });
        });
      } else {
        articles.push({
          id: safeStr(s.id),
          category: 'scheme',
          title: safeObj(s.title),
          subtitle: safeObj(s.subtitle),
          image: safeStr(s.image),
          tags: safeArr(s.tags),
          stats: safeArr(s.stats),
          sections: safeArr(s.sections),
        });
      }
    }
  } catch (err) {
    console.warn('[RAG] Firestore fetch failed:', err instanceof Error ? err.message : err);
  }
  return articles;
}

// ─── Index State ─────────────────────────────────────────────────────────────
let INDEXED_CHUNKS = [];
let BM25 = null;
let ALL_ARTICLES = [];
const queryEmbeddingCache = new BoundedEmbeddingCache(CONFIG.CACHE_MAX_ENTRIES, CONFIG.CACHE_TTL_MS);
const chunkEmbeddingCache = new BoundedEmbeddingCache(CONFIG.CACHE_MAX_ENTRIES, CONFIG.CACHE_TTL_MS);
let isIndexBuilt = false;
let isBuilding = false;
let lastFirestoreFetch = 0;
const FIRESTORE_REFRESH_INTERVAL = 10 * 60 * 1000;

// ─── Chunk Builder ───────────────────────────────────────────────────────────
function buildChunks(articles) {
  const chunks = [];
  articles.forEach((art, artIdx) => {
    // Support both 10X flat content string and legacy sections format
    let contentText = '';
    if (typeof art.content === 'string') {
      contentText = [art.title, art.titleHi, art.titleMr, art.content, art.summary, art.summaryHi, art.summaryMr].filter(Boolean).join('\n');
    } else {
      const sections = safeArr(art.sections);
      contentText = sections.map(s => {
        const t = safeObj(s.title); const c = safeObj(s.content);
        return [safeStr(t.mr), safeStr(t.en), safeStr(c.mr), safeStr(c.en)].join(' ');
      }).join('\n');
    }
    
    if (!contentText.trim()) return;
    const textChunks = chunkText(contentText, CONFIG.CHUNK_SIZE, CONFIG.CHUNK_OVERLAP);
    
    // Support both 10X and legacy titles
    let sourceTitle = 'Knowledge Base';
    if (typeof art.title === 'string') {
      sourceTitle = art.titleHi || art.title || 'Knowledge Base';
    } else if (art.title && typeof art.title === 'object') {
      sourceTitle = safeStr(art.title.mr) || safeStr(art.title.en) || 'Knowledge Base';
    }
    
    const lowerTitle = sourceTitle.toLowerCase();
    const isExpert = lowerTitle.includes('icar') || lowerTitle.includes('kvk') || safeStr(art.category) === 'crop' || art.confidence === 'government-verified' || safeObj(art.metadata).verified;
    const sourceUrl = art.metadata?.sourceUrl || art.sourceUrl || (
      art.category === 'crop'
        ? `/crops/${art.id}`
        : art.category === 'scheme'
        ? art.id === 'pmkisan'
          ? 'https://pmkisan.gov.in'
          : 'https://pmfby.gov.in'
        : ''
    );

    textChunks.forEach((chunk, chunkIdx) => {
      chunks.push({
        id: `art_${art.id || artIdx}_chunk_${chunkIdx}`, 
        text: chunk, 
        source: sourceTitle,
        sourceUrl,
        category: art.metadata?.category || safeStr(art.category) || 'general', 
        authorityScore: isExpert ? 1.0 : 0.8,
        expertReviewed: isExpert, 
        crops: art.metadata?.crop || safeArr(art.tags),
        regions: art.metadata?.state || ['maharashtra', 'vidarbha', 'yavatmal', 'nashik', 'pune', 'nagpur'],
        tokenCount: chunk.split(/\s+/).length,
      });
    });
  });
  return chunks;
}

function buildBM25(chunks) {
  const tokenizedCorpus = chunks.map(c => c.text.toLowerCase().split(/\s+/).filter(w => w.length > 0));
  return new BM25Index(tokenizedCorpus, CONFIG.BM25_K1, CONFIG.BM25_B);
}

// ─── Batch Embedding ─────────────────────────────────────────────────────────
async function embedTextsBatch(texts, ai) {
  if (texts.length === 0) return [];
  try {
    const response = await ai.models.batchEmbedContents({
      model: CONFIG.EMBEDDING_MODEL,
      requests: texts.map(text => ({ content: { parts: [{ text: text.slice(0, CONFIG.MAX_INPUT_LEN) }] } })),
    });
    return (response.embeddings || []).map(e => e.values || []);
  } catch (batchErr) {
    console.warn('[RAG] Batch embed failed, using individual calls:', batchErr instanceof Error ? batchErr.message : batchErr);
  }
  const results = new Array(texts.length).fill([]);
  for (let i = 0; i < texts.length; i += CONFIG.EMBEDDING_CONCURRENCY) {
    const batch = texts.slice(i, i + CONFIG.EMBEDDING_CONCURRENCY);
    const promises = batch.map((text, j) =>
      ai.models.embedContent({ model: CONFIG.EMBEDDING_MODEL, contents: text.slice(0, CONFIG.MAX_INPUT_LEN) })
        .then(resp => { results[i + j] = resp.embeddings?.[0]?.values || resp.embedding?.values || []; })
        .catch(() => { })
    );
    await Promise.all(promises);
  }
  return results;
}

async function embedQuery(query, ai) {
  const cacheKey = `query_${simpleHash(query)}`;
  const cached = queryEmbeddingCache.get(cacheKey);
  if (cached) return cached;
  try {
    const response = await ai.models.embedContent({ model: CONFIG.EMBEDDING_MODEL, contents: query });
    const vector = response.embeddings?.[0]?.values || response.embedding?.values;
    if (vector) { queryEmbeddingCache.set(cacheKey, vector); return vector; }
  } catch (e) {
    console.warn('[RAG] Query embedding failed:', e instanceof Error ? e.message : e);
  }
  return null;
}

async function precomputeEmbeddings(chunks, ai) {
  const uncached = chunks.filter(c => !chunkEmbeddingCache.has(c.id));
  if (uncached.length === 0) { console.log(`[RAG] All ${chunks.length} chunk embeddings cached.`); return; }
  console.log(`[RAG] Embedding ${uncached.length} chunks (batch=${CONFIG.EMBEDDING_BATCH_SIZE})...`);
  for (let i = 0; i < uncached.length; i += CONFIG.EMBEDDING_BATCH_SIZE) {
    const batch = uncached.slice(i, i + CONFIG.EMBEDDING_BATCH_SIZE);
    const texts = batch.map(c => c.text);
    const vectors = await embedTextsBatch(texts, ai);
    batch.forEach((chunk, j) => {
      if (vectors[j] && vectors[j].length > 0) {
        chunk.embedding = vectors[j];
        chunkEmbeddingCache.set(chunk.id, vectors[j]);
      }
    });
    console.log(`[RAG] Embedded ${Math.min(i + CONFIG.EMBEDDING_BATCH_SIZE, uncached.length)}/${uncached.length}...`);
  }
  console.log(`[RAG] Done: ${chunks.filter(c => c.embedding).length}/${chunks.length} chunks have vectors.`);
}

// ─── Domain Reranker ─────────────────────────────────────────────────────────
function rerankChunk(chunk, baseScore, userContext = {}) {
  let score = baseScore;
  if (chunk.expertReviewed) score *= 1.2;
  score *= chunk.authorityScore;
  if (userContext.state && chunk.regions.includes(userContext.state.toLowerCase())) score *= 1.3;
  if (userContext.crops && userContext.crops.length > 0) {
    const cropMatch = userContext.crops.some(c =>
      chunk.crops.includes(c.toLowerCase()) || chunk.text.toLowerCase().includes(c.toLowerCase())
    );
    if (cropMatch) score *= 1.4;
  }
  return score;
}

// ─── Cross-Encoder Reranking (optional) ─────────────────────────────────────
async function rerankWithLLM(query, candidates, topK, ai) {
  if (!CONFIG.ENABLE_RERANK || candidates.length <= topK) return candidates.slice(0, topK);
  try {
    const prompt = `Given the query: "${query.slice(0, 200)}"
Rank these passages by relevance (1=most). Return ONLY passage numbers, comma-separated.
${candidates.map((c, i) => `[${i + 1}] ${c.text.slice(0, 200)}`).join('\n\n')}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    const numbers = (response.text || '').match(/\d+/g);
    if (!numbers || numbers.length === 0) return candidates.slice(0, topK);
    const ranked = [];
    for (const numStr of numbers) {
      const idx = parseInt(numStr, 10) - 1;
      if (idx >= 0 && idx < candidates.length && !ranked.includes(candidates[idx])) {
        ranked.push(candidates[idx]);
        if (ranked.length >= topK) break;
      }
    }
    for (const c of candidates) {
      if (ranked.length >= topK) break;
      if (!ranked.includes(c)) ranked.push(c);
    }
    return ranked;
  } catch (e) {
    console.warn('[RAG] LLM rerank failed:', e instanceof Error ? e.message : e);
    return candidates.slice(0, topK);
  }
}

// ─── Index Build Pipeline ────────────────────────────────────────────────────
export async function buildIndex(apiKey) {
  if (isBuilding) { console.log('[RAG] Build in progress, skipping...'); return; }
  isBuilding = true;
  const startTime = Date.now();
  try {
    await ensureDependencies();
    console.log('[RAG] Building index...');
    const firestoreArticles = await loadArticlesFromFirestore();
    const staticKB = getKnowledgeBase();
    ALL_ARTICLES = firestoreArticles.length > 0 ? firestoreArticles : (staticKB || []);
    lastFirestoreFetch = Date.now();
    console.log(`[RAG] Loaded ${ALL_ARTICLES.length} articles (${firestoreArticles.length} Firestore, ${staticKB?.length || 0} static).`);
    if (ALL_ARTICLES.length === 0) {
      INDEXED_CHUNKS = []; BM25 = null; isIndexBuilt = true; return;
    }
    INDEXED_CHUNKS = buildChunks(ALL_ARTICLES);
    console.log(`[RAG] Created ${INDEXED_CHUNKS.length} chunks.`);
    BM25 = buildBM25(INDEXED_CHUNKS);
    console.log('[RAG] BM25 sparse index built.');
    const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (activeKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: activeKey });
        INDEXED_CHUNKS.forEach(chunk => {
          const cached = chunkEmbeddingCache.get(chunk.id);
          if (cached) chunk.embedding = cached;
        });
        await precomputeEmbeddings(INDEXED_CHUNKS, ai);
      } catch (e) {
        console.warn('[RAG] Embedding pre-computation failed:', e instanceof Error ? e.message : e);
      }
    } else {
      console.warn('[RAG] No API key — BM25 keyword search only.');
    }
    isIndexBuilt = true;
    console.log(`[RAG] Index built in ${((Date.now() - startTime) / 1000).toFixed(2)}s.`);
  } catch (e) {
    console.error('[RAG] Index build failed:', e instanceof Error ? e.message : e);
  } finally {
    isBuilding = false;
  }
}

async function maybeRefreshFirestore(apiKey) {
  if (Date.now() - lastFirestoreFetch < FIRESTORE_REFRESH_INTERVAL) return;
  console.log('[RAG] Firestore data stale, refreshing index...');
  await buildIndex(apiKey);
}

// ─── Main Retrieval Pipeline ────────────────────────────────────────────────
export async function retrieveContext(query, userContext = {}, apiKey) {
  if (!isIndexBuilt) await buildIndex(apiKey);
  await maybeRefreshFirestore(apiKey);
  if (INDEXED_CHUNKS.length === 0) return { contextText: '', citations: [] };
  const sanitizedQuery = sanitizeQuery(query);
  if (!sanitizedQuery) return { contextText: '', citations: [] };
  const queryTerms = sanitizedQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  let bm25Ranked = [];
  if (BM25 && queryTerms.length > 0) {
    bm25Ranked = BM25.search(queryTerms, CONFIG.TOP_K_RETRIEVAL)
      .map(r => ({ id: INDEXED_CHUNKS[r.index].id, score: r.score }));
  }

  let denseRanked = [];
  const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (activeKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const queryVector = await embedQuery(sanitizedQuery, ai);
      if (queryVector) {
        const withEmb = INDEXED_CHUNKS.filter(c => c.embedding);
        if (withEmb.length > 0) {
          denseRanked = withEmb
            .map(c => ({ id: c.id, score: cosineSimilarity(queryVector, c.embedding) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, CONFIG.TOP_K_RETRIEVAL);
        }
      }
    } catch (e) {
      console.warn('[RAG] Dense retrieval failed:', e instanceof Error ? e.message : e);
    }
  }

  const rankedLists = [];
  if (bm25Ranked.length > 0) rankedLists.push(bm25Ranked);
  if (denseRanked.length > 0) rankedLists.push(denseRanked);
  let fusedResults;
  if (rankedLists.length >= 2) {
    fusedResults = reciprocalRankFusion(rankedLists, CONFIG.RRF_K, CONFIG.TOP_K_FUSION);
  } else if (rankedLists.length === 1) {
    fusedResults = rankedLists[0].slice(0, CONFIG.TOP_K_FUSION);
  } else {
    return { contextText: '', citations: [] };
  }

  const chunkMap = new Map(INDEXED_CHUNKS.map(c => [c.id, c]));
  const reranked = fusedResults
    .map(f => {
      const chunk = chunkMap.get(f.id);
      if (!chunk) return null;
      return { chunk, score: rerankChunk(chunk, f.score, userContext) };
    })
    .filter(r => r !== null)
    .sort((a, b) => b.score - a.score);

  let topChunks;
  if (CONFIG.ENABLE_RERANK && activeKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: activeKey });
      topChunks = await rerankWithLLM(sanitizedQuery, reranked.slice(0, 15).map(r => r.chunk), CONFIG.TOP_K_FINAL, ai);
    } catch {
      topChunks = reranked.slice(0, CONFIG.TOP_K_FINAL).map(r => r.chunk);
    }
  } else {
    topChunks = reranked.slice(0, CONFIG.TOP_K_FINAL).map(r => r.chunk);
  }

  const deduplicated = deduplicateChunks(topChunks);

  const finalResults = deduplicated
    .map(chunk => {
      const fusedScore = fusedResults.find(f => f.id === chunk.id)?.score || 0;
      const rawSim = chunk.embedding && denseRanked.length > 0
        ? denseRanked.find(d => d.id === chunk.id)?.score || 0 : 0;
      return { chunk, score: rerankChunk(chunk, fusedScore, userContext), rawSim };
    })
    .filter(m => m.rawSim > CONFIG.SEMANTIC_THRESHOLD || m.score > CONFIG.SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  if (finalResults.length === 0) {
    const fallback = reranked.slice(0, 3).map(r => ({ chunk: r.chunk, score: r.score }));
    if (fallback.length === 0) return { contextText: '', citations: [] };
    return {
      contextText: fallback.map(m => `[Source: ${m.chunk.source}]\n${m.chunk.text}`).join('\n\n'),
      citations: fallback.map(m => ({ source: m.chunk.source, category: m.chunk.category, score: Math.min(95, Math.round(m.score * 100)), url: m.chunk.sourceUrl, text: m.chunk.text })),
    };
  }
  return {
    contextText: finalResults.map(m => `[Source: ${m.chunk.source}]\n${m.chunk.text}`).join('\n\n'),
    citations: finalResults.map(m => ({ source: m.chunk.source, category: m.chunk.category, score: Math.min(99, Math.round(m.score * 100)), url: m.chunk.sourceUrl, text: m.chunk.text })),
  };
}

// ─── Public Utilities ───────────────────────────────────────────────────────
export function getIndexStats() {
  return {
    isBuilt: isIndexBuilt, totalArticles: ALL_ARTICLES.length,
    totalChunks: INDEXED_CHUNKS.length,
    embeddedChunks: INDEXED_CHUNKS.filter(c => c.embedding).length,
    cacheSize: chunkEmbeddingCache.size + queryEmbeddingCache.size,
    bm25Ready: BM25 !== null,
  };
}

export function clearCache() {
  queryEmbeddingCache.clear();
  chunkEmbeddingCache.clear();
  console.log('[RAG] Caches cleared.');
}

// ─── Auto-initialize ────────────────────────────────────────────────────────
buildIndex();