// =============================================================================
// RAG Service — Production-Grade Hybrid Retrieval Pipeline
//
// Architecture:
//   Firestore + Static KB → Pre-index at Startup →
//   Query: BM25 + Dense → RRF Fusion → Domain Rerank → Dedup → Return
//
// Upgrades from v1:
//   ✓ Pre-built index (Firestore fetch + chunks + BM25 + embeddings) at startup
//   ✓ Batch embeddings via batchEmbedContents
//   ✓ Hybrid retrieval with Reciprocal Rank Fusion (RRF)
//   ✓ Bounded LRU cache with TTL
//   ✓ BM25 sparse retrieval (proper TF-IDF normalization)
//   ✓ Configurable thresholds via env vars
//   ✓ Chunk deduplication
//   ✓ Concurrency-limited API calls
//   ✓ Query sanitization
//   ✓ Index stats + cache management exports
//   ✓ Graceful degradation at every stage
//   ✓ Null-safe property access throughout
// =============================================================================

import { KNOWLEDGE_BASE, KnowledgeItem } from '../data/knowledge';
import { fetchCrops, fetchContent, fetchSchemes } from './dbService';

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

// ─── Types ───────────────────────────────────────────────────────────────────
interface ChunkItem {
  id: string;
  text: string;
  source: string;
  category: string;
  authorityScore: number;
  expertReviewed: boolean;
  crops: string[];
  regions: string[];
  embedding?: number[];
  tokenCount: number;
}

interface Citation {
  source: string;
  category: string;
  score: number;
}

interface RetrievalResult {
  contextText: string;
  citations: Citation[];
}

// ─── BM25 Index (inline, no external dependency) ────────────────────────────
class BM25Index {
  private corpus: string[][];
  private docLengths: number[];
  private avgDocLength: number;
  private termDocFreq: Map<string, number>;
  private k1: number;
  private b: number;
  private N: number;

  constructor(corpus: string[][], k1 = 1.5, b = 0.75) {
    this.corpus = corpus;
    this.k1 = k1;
    this.b = b;
    this.N = corpus.length;
    this.docLengths = corpus.map(doc => doc.length);
    this.avgDocLength =
      this.docLengths.reduce((a, c) => a + c, 0) / Math.max(this.N, 1);
    this.termDocFreq = new Map();

    for (const doc of corpus) {
      const uniqueTerms = new Set(doc);
      for (const term of uniqueTerms) {
        this.termDocFreq.set(term, (this.termDocFreq.get(term) || 0) + 1);
      }
    }
  }

  private idf(term: string): number {
    const df = this.termDocFreq.get(term) || 0;
    return Math.log((this.N - df + 0.5) / (df + 0.5) + 1);
  }

  getScores(queryTerms: string[]): number[] {
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

  search(
    queryTerms: string[],
    topK: number
  ): Array<{ index: number; score: number }> {
    const scores = this.getScores(queryTerms);
    return scores
      .map((score, index) => ({ index, score }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

// ─── Reciprocal Rank Fusion ──────────────────────────────────────────────────
function reciprocalRankFusion(
  rankedLists: Array<Array<{ id: string; score: number }>>,
  k: number,
  topN: number
): Array<{ id: string; score: number }> {
  const fusedScores = new Map<string, number>();
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
  private cache: Map<string, { vector: number[]; expiresAt: number }>;
  private maxEntries: number;
  private ttlMs: number;

  constructor(maxEntries: number, ttlMs: number) {
    this.cache = new Map();
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
  }

  get(key: string): number[] | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.vector;
  }

  set(key: string, vector: number[]): void {
    if (this.cache.size >= this.maxEntries) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    this.cache.set(key, { vector, expiresAt: Date.now() + this.ttlMs });
  }

  has(key: string): boolean { return this.get(key) !== undefined; }
  get size(): number { return this.cache.size; }
  clear(): void { this.cache.clear(); }
}

// ─── Utilities ───────────────────────────────────────────────────────────────
function cleanText(text: string): string {
  if (typeof text !== 'string') return '';
  return text.replace(/[#*`_]/g, '').replace(/\s+/g, ' ').trim();
}

function sanitizeQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  return query
    .slice(0, CONFIG.MAX_QUERY_LEN)
    .replace(/[<>{}\\]/g, '')
    .replace(/```/g, '')
    .trim();
}

export function chunkText(
  text: string,
  size = CONFIG.CHUNK_SIZE,
  overlap = CONFIG.CHUNK_OVERLAP
): string[] {
  const words = cleanText(text).split(' ');
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + size);
    chunks.push(chunkWords.join(' '));
    if (i + size >= words.length) break;
    i += size - overlap;
  }
  return chunks;
}

export function cosineSimilarity(v1: number[], v2: number[]): number {
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

function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return String(hash);
}

function deduplicateChunks(chunks: ChunkItem[], threshold = 0.85): ChunkItem[] {
  const result: ChunkItem[] = [];
  const seenHashes = new Set<string>();
  for (const chunk of chunks) {
    const hash = simpleHash(chunk.text.slice(0, 150));
    if (seenHashes.has(hash)) continue;
    let isDup = false;
    for (const existing of result) {
      if (existing.embedding && chunk.embedding) {
        if (cosineSimilarity(existing.embedding, chunk.embedding) > threshold) {
          isDup = true;
          break;
        }
      }
    }
    if (!isDup) { seenHashes.add(hash); result.push(chunk); }
  }
  return result;
}

// ─── Safe Property Accessors ──────────────────────────────────────────────────
function safeStr(val: any): string {
  return typeof val === 'string' ? val : '';
}
function safeObj(val: any): { en?: string; mr?: string; hi?: string } {
  return val && typeof val === 'object' ? val : {};
}
function safeArr(val: any): any[] {
  return Array.isArray(val) ? val : [];
}

// ─── Firestore Data Loader ───────────────────────────────────────────────────
async function loadArticlesFromFirestore(): Promise<KnowledgeItem[]> {
  const articles: KnowledgeItem[] = [];

  try {
    const [firestoreCrops, firestoreContent, firestoreSchemes] = await Promise.all([
      fetchCrops().catch(() => []),
      fetchContent().catch(() => []),
      fetchSchemes().catch(() => []),
    ]);

    // Map Crops
    for (const c of safeArr(firestoreCrops)) {
      articles.push({
        id: safeStr(c.id),
        category: 'crop',
        title: safeObj(c.name),
        subtitle: { en: safeStr(c.scientificName), mr: '' },
        image: safeStr(c.imageUrl),
        tags: safeArr(c.tags),
        stats: safeArr(c.stats),
        sections: safeArr(c.sections),
      });
    }

    // Map Content
    for (const c of safeArr(firestoreContent)) {
      articles.push({
        id: safeStr(c.id),
        category: safeStr(c.category) || 'tech',
        title: safeObj(c.title),
        subtitle: safeObj(c.subtitle),
        image: safeStr(c.image),
        tags: safeArr(c.tags),
        stats: safeArr(c.stats),
        sections: safeArr(c.sections),
      });
    }

    // Map Schemes
    const activeLang = 'mr';
    const schemeDoc =
      firestoreSchemes?.find((doc: any) => doc?.lang === activeLang) ||
      firestoreSchemes?.[0];
    if (schemeDoc && Array.isArray(schemeDoc.schemes)) {
      schemeDoc.schemes.forEach((s: any, idx: number) => {
        const title = safeStr(s.title);
        const desc = safeStr(s.desc);
        const eligibility = safeStr(s.eligibility);
        const dept = safeStr(s.dept);
        articles.push({
          id: safeStr(s.id) || `scheme_${idx}`,
          category: 'scheme',
          title: { en: title, mr: title },
          subtitle: { en: dept, mr: dept },
          image: '',
          tags: s.benefits ? [safeStr(s.benefits)] : [],
          stats: [],
          sections: [{
            title: { en: 'Details', mr: 'माहिती' },
            content: {
              en: `${desc} ${eligibility}`,
              mr: `${desc} ${eligibility}`,
            },
          }],
        });
      });
    }
  } catch (err) {
    console.warn('[RAG] Firestore fetch failed:', err instanceof Error ? err.message : err);
  }

  return articles;
}

// ─── Index State ─────────────────────────────────────────────────────────────
let INDEXED_CHUNKS: ChunkItem[] = [];
let BM25: BM25Index | null = null;
let ALL_ARTICLES: KnowledgeItem[] = [];
const queryEmbeddingCache = new BoundedEmbeddingCache(
  CONFIG.CACHE_MAX_ENTRIES,
  CONFIG.CACHE_TTL_MS
);
const chunkEmbeddingCache = new BoundedEmbeddingCache(
  CONFIG.CACHE_MAX_ENTRIES,
  CONFIG.CACHE_TTL_MS
);
let isIndexBuilt = false;
let isBuilding = false;
let lastFirestoreFetch = 0;
const FIRESTORE_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 min

// ─── Chunk Builder ───────────────────────────────────────────────────────────
function buildChunks(articles: KnowledgeItem[]): ChunkItem[] {
  const chunks: ChunkItem[] = [];

  articles.forEach((art, artIdx) => {
    const sections = safeArr(art.sections);
    const contentText = sections
      .map(s => {
        const t = safeObj(s.title);
        const c = safeObj(s.content);
        return [safeStr(t.mr), safeStr(t.en), safeStr(c.mr), safeStr(c.en)].join(' ');
      })
      .join('\n');

    if (!contentText.trim()) return;

    const textChunks = chunkText(contentText, CONFIG.CHUNK_SIZE, CONFIG.CHUNK_OVERLAP);
    const titleObj = safeObj(art.title);
    const sourceTitle = safeStr(titleObj.mr) || safeStr(titleObj.en) || 'Knowledge Base';
    const lowerTitle = sourceTitle.toLowerCase();
    const isExpert =
      lowerTitle.includes('icar') ||
      lowerTitle.includes('kvk') ||
      safeStr(art.category) === 'crop';

    textChunks.forEach((chunk, chunkIdx) => {
      chunks.push({
        id: `art_${artIdx}_chunk_${chunkIdx}`,
        text: chunk,
        source: sourceTitle,
        category: safeStr(art.category) || 'general',
        authorityScore: isExpert ? 1.0 : 0.8,
        expertReviewed: isExpert,
        crops: safeArr(art.tags),
        regions: ['maharashtra', 'vidarbha', 'yavatmal', 'nashik', 'pune', 'nagpur'],
        tokenCount: chunk.split(/\s+/).length,
      });
    });
  });

  return chunks;
}

function buildBM25(chunks: ChunkItem[]): BM25Index {
  const tokenizedCorpus = chunks.map(c =>
    c.text.toLowerCase().split(/\s+/).filter(w => w.length > 0)
  );
  return new BM25Index(tokenizedCorpus, CONFIG.BM25_K1, CONFIG.BM25_B);
}

// ─── Batch Embedding ─────────────────────────────────────────────────────────
async function embedTextsBatch(texts: string[], ai: any): Promise<number[][]> {
  if (texts.length === 0) return [];

  try {
    const response = await ai.models.batchEmbedContents({
      model: CONFIG.EMBEDDING_MODEL,
      requests: texts.map(text => ({
        content: { parts: [{ text: text.slice(0, CONFIG.MAX_INPUT_LEN) }] },
      })),
    });
    return (response.embeddings || []).map((e: any) => e.values || []);
  } catch (batchErr) {
    console.warn(
      '[RAG] Batch embed failed, using individual calls:',
      batchErr instanceof Error ? batchErr.message : batchErr
    );
  }

  const results: number[][] = new Array(texts.length).fill([]);
  for (let i = 0; i < texts.length; i += CONFIG.EMBEDDING_CONCURRENCY) {
    const batch = texts.slice(i, i + CONFIG.EMBEDDING_CONCURRENCY);
    const promises = batch.map((text, j) =>
      ai.models
        .embedContent({
          model: CONFIG.EMBEDDING_MODEL,
          contents: text.slice(0, CONFIG.MAX_INPUT_LEN),
        })
        .then((resp: any) => {
          const v = resp.embeddings?.[0]?.values || resp.embedding?.values || [];
          results[i + j] = v;
        })
        .catch(() => { })
    );
    await Promise.all(promises);
  }
  return results;
}

async function embedQuery(query: string, ai: any): Promise<number[] | null> {
  const cacheKey = `query_${simpleHash(query)}`;
  const cached = queryEmbeddingCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await ai.models.embedContent({
      model: CONFIG.EMBEDDING_MODEL,
      contents: query,
    });
    const vector = response.embeddings?.[0]?.values || response.embedding?.values;
    if (vector) {
      queryEmbeddingCache.set(cacheKey, vector);
      return vector;
    }
  } catch (e) {
    console.warn('[RAG] Query embedding failed:', e instanceof Error ? e.message : e);
  }
  return null;
}

async function precomputeEmbeddings(chunks: ChunkItem[], ai: any): Promise<void> {
  const uncached = chunks.filter(c => !chunkEmbeddingCache.has(c.id));
  if (uncached.length === 0) {
    console.log(`[RAG] All ${chunks.length} chunk embeddings cached.`);
    return;
  }

  console.log(
    `[RAG] Embedding ${uncached.length} chunks (batch=${CONFIG.EMBEDDING_BATCH_SIZE})...`
  );

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

    const progress = Math.min(i + CONFIG.EMBEDDING_BATCH_SIZE, uncached.length);
    console.log(`[RAG] Embedded ${progress}/${uncached.length}...`);
  }

  const embedded = chunks.filter(c => c.embedding).length;
  console.log(`[RAG] Done: ${embedded}/${chunks.length} chunks have vectors.`);
}

// ─── Domain Reranker ─────────────────────────────────────────────────────────
function rerankChunk(
  chunk: ChunkItem,
  baseScore: number,
  userContext: Record<string, any> = {}
): number {
  let score = baseScore;
  if (chunk.expertReviewed) score *= 1.2;
  score *= chunk.authorityScore;
  if (userContext.state && chunk.regions.includes(userContext.state.toLowerCase())) {
    score *= 1.3;
  }
  if (userContext.crops && userContext.crops.length > 0) {
    const cropMatch = userContext.crops.some(
      (c: string) =>
        chunk.crops.includes(c.toLowerCase()) ||
        chunk.text.toLowerCase().includes(c.toLowerCase())
    );
    if (cropMatch) score *= 1.4;
  }
  return score;
}

// ─── Cross-Encoder Reranking (optional) ─────────────────────────────────────
async function rerankWithLLM(
  query: string,
  candidates: ChunkItem[],
  topK: number,
  ai: any
): Promise<ChunkItem[]> {
  if (!CONFIG.ENABLE_RERANK || candidates.length <= topK) {
    return candidates.slice(0, topK);
  }

  try {
    const prompt = `Given the query: "${query.slice(0, 200)}"
Rank these passages by relevance (1=most). Return ONLY passage numbers, comma-separated.

${candidates.map((c, i) => `[${i + 1}] ${c.text.slice(0, 200)}`).join('\n\n')}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const numbers = (response.text || '').match(/\d+/g);
    if (!numbers || numbers.length === 0) return candidates.slice(0, topK);

    const ranked: ChunkItem[] = [];
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
export async function buildIndex(apiKey?: string): Promise<void> {
  if (isBuilding) {
    console.log('[RAG] Build in progress, skipping...');
    return;
  }
  isBuilding = true;
  const startTime = Date.now();

  try {
    console.log('[RAG] Building index...');

    // 1. Load articles from Firestore + static fallback
    const firestoreArticles = await loadArticlesFromFirestore();
    ALL_ARTICLES =
      firestoreArticles.length > 0 ? firestoreArticles : KNOWLEDGE_BASE || [];
    lastFirestoreFetch = Date.now();
    console.log(
      `[RAG] Loaded ${ALL_ARTICLES.length} articles (${firestoreArticles.length} from Firestore, ${KNOWLEDGE_BASE?.length || 0} static).`
    );

    if (ALL_ARTICLES.length === 0) {
      console.warn('[RAG] No articles found. Index will be empty.');
      INDEXED_CHUNKS = [];
      BM25 = null;
      isIndexBuilt = true;
      return;
    }

    // 2. Build chunks
    INDEXED_CHUNKS = buildChunks(ALL_ARTICLES);
    console.log(
      `[RAG] Created ${INDEXED_CHUNKS.length} chunks from ${ALL_ARTICLES.length} articles.`
    );

    // 3. Build BM25 index
    BM25 = buildBM25(INDEXED_CHUNKS);
    console.log('[RAG] BM25 sparse index built.');

    // 4. Pre-compute embeddings (batch)
    const activeKey =
      apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (activeKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: activeKey });

        // Restore cached embeddings
        INDEXED_CHUNKS.forEach(chunk => {
          const cached = chunkEmbeddingCache.get(chunk.id);
          if (cached) chunk.embedding = cached;
        });

        await precomputeEmbeddings(INDEXED_CHUNKS, ai);
      } catch (e) {
        console.warn(
          '[RAG] Embedding pre-computation failed:',
          e instanceof Error ? e.message : e
        );
      }
    } else {
      console.warn('[RAG] No API key — BM25 keyword search only.');
    }

    isIndexBuilt = true;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[RAG] Index built in ${elapsed}s.`);
    console.log(`[RAG]   Chunks: ${INDEXED_CHUNKS.length}`);
    console.log(`[RAG]   BM25: ${BM25 ? 'ready' : 'N/A'}`);
    console.log(
      `[RAG]   Embeddings: ${INDEXED_CHUNKS.filter(c => c.embedding).length}/${INDEXED_CHUNKS.length}`
    );
    console.log(
      `[RAG]   Cache: query=${queryEmbeddingCache.size}, chunk=${chunkEmbeddingCache.size}`
    );
  } catch (e) {
    console.error('[RAG] Index build failed:', e instanceof Error ? e.message : e);
  } finally {
    isBuilding = false;
  }
}

// ─── Check if Firestore refresh needed ────────────────────────────────────────
async function maybeRefreshFirestore(apiKey?: string): Promise<void> {
  const elapsed = Date.now() - lastFirestoreFetch;
  if (elapsed < FIRESTORE_REFRESH_INTERVAL) return;
  console.log('[RAG] Firestore data stale, refreshing index...');
  await buildIndex(apiKey);
}

// ─── Main Retrieval Pipeline ────────────────────────────────────────────────
export async function retrieveContext(
  query: string,
  userContext: { crops?: string[]; state?: string; district?: string } = {},
  apiKey?: string
): Promise<RetrievalResult> {
  if (!isIndexBuilt) {
    await buildIndex(apiKey);
  }

  await maybeRefreshFirestore(apiKey);

  if (INDEXED_CHUNKS.length === 0) {
    return { contextText: '', citations: [] };
  }

  const sanitizedQuery = sanitizeQuery(query);
  if (!sanitizedQuery) {
    return { contextText: '', citations: [] };
  }

  const queryTerms = sanitizedQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2);

  // ── Stage 1: BM25 Sparse Retrieval ──
  let bm25Ranked: Array<{ id: string; score: number }> = [];
  if (BM25 && queryTerms.length > 0) {
    const bm25Results = BM25.search(queryTerms, CONFIG.TOP_K_RETRIEVAL);
    bm25Ranked = bm25Results.map(r => ({
      id: INDEXED_CHUNKS[r.index].id,
      score: r.score,
    }));
  }

  // ── Stage 2: Dense Vector Retrieval ──
  let denseRanked: Array<{ id: string; score: number }> = [];
  const activeKey =
    apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

  if (activeKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: activeKey });
      const queryVector = await embedQuery(sanitizedQuery, ai);

      if (queryVector) {
        const withEmbeddings = INDEXED_CHUNKS.filter(c => c.embedding);
        if (withEmbeddings.length > 0) {
          const scored = withEmbeddings.map(c => ({
            id: c.id,
            score: cosineSimilarity(queryVector, c.embedding!),
          }));
          scored.sort((a, b) => b.score - a.score);
          denseRanked = scored.slice(0, CONFIG.TOP_K_RETRIEVAL);
        }
      }
    } catch (e) {
      console.warn('[RAG] Dense retrieval failed:', e instanceof Error ? e.message : e);
    }
  }

  // ── Stage 3: Reciprocal Rank Fusion ──
  const rankedLists: Array<Array<{ id: string; score: number }>> = [];
  if (bm25Ranked.length > 0) rankedLists.push(bm25Ranked);
  if (denseRanked.length > 0) rankedLists.push(denseRanked);

  let fusedResults: Array<{ id: string; score: number }>;
  if (rankedLists.length >= 2) {
    fusedResults = reciprocalRankFusion(
      rankedLists,
      CONFIG.RRF_K,
      CONFIG.TOP_K_FUSION
    );
  } else if (rankedLists.length === 1) {
    fusedResults = rankedLists[0].slice(0, CONFIG.TOP_K_FUSION);
  } else {
    return { contextText: '', citations: [] };
  }

  // Map fused IDs back to chunks + apply domain reranker
  const chunkMap = new Map(INDEXED_CHUNKS.map(c => [c.id, c]));
  const reranked = fusedResults
    .map(f => {
      const chunk = chunkMap.get(f.id);
      if (!chunk) return null;
      return { chunk, score: rerankChunk(chunk, f.score, userContext) };
    })
    .filter((r): r is { chunk: ChunkItem; score: number } => r !== null)
    .sort((a, b) => b.score - a.score);

  // ── Stage 4: Cross-Encoder Reranking (optional) ──
  let topChunks: ChunkItem[];
  if (CONFIG.ENABLE_RERANK && activeKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: activeKey });
      topChunks = await rerankWithLLM(
        sanitizedQuery,
        reranked.slice(0, 15).map(r => r.chunk),
        CONFIG.TOP_K_FINAL,
        ai
      );
    } catch {
      topChunks = reranked.slice(0, CONFIG.TOP_K_FINAL).map(r => r.chunk);
    }
  } else {
    topChunks = reranked.slice(0, CONFIG.TOP_K_FINAL).map(r => r.chunk);
  }

  // ── Stage 5: Deduplication ──
  const deduplicated = deduplicateChunks(topChunks);

  // ── Stage 6: Threshold filter + assemble context ──
  const finalResults = deduplicated
    .map(chunk => {
      const fusedScore = fusedResults.find(f => f.id === chunk.id)?.score || 0;
      const rawSim =
        chunk.embedding && denseRanked.length > 0
          ? denseRanked.find(d => d.id === chunk.id)?.score || 0
          : 0;
      return {
        chunk,
        score: rerankChunk(chunk, fusedScore, userContext),
        rawSim,
      };
    })
    .filter(
      m => m.rawSim > CONFIG.SEMANTIC_THRESHOLD || m.score > CONFIG.SCORE_THRESHOLD
    )
    .sort((a, b) => b.score - a.score);

  if (finalResults.length === 0) {
    const fallback = reranked.slice(0, 3).map(r => ({
      chunk: r.chunk,
      score: r.score,
      rawSim: 0,
    }));
    if (fallback.length === 0) return { contextText: '', citations: [] };

    const contextText = fallback
      .map(m => `[Source: ${m.chunk.source}]\n${m.chunk.text}`)
      .join('\n\n');
    const citations = fallback.map(m => ({
      source: m.chunk.source,
      category: m.chunk.category,
      score: Math.min(95, Math.round(m.score * 100)),
    }));
    return { contextText, citations };
  }

  const contextText = finalResults
    .map(m => `[Source: ${m.chunk.source}]\n${m.chunk.text}`)
    .join('\n\n');

  const citations = finalResults.map(m => ({
    source: m.chunk.source,
    category: m.chunk.category,
    score: Math.min(99, Math.round(m.score * 100)),
  }));

  return { contextText, citations };
}

// ─── Public Utilities ───────────────────────────────────────────────────────
export function getIndexStats() {
  return {
    isBuilt: isIndexBuilt,
    totalArticles: ALL_ARTICLES.length,
    totalChunks: INDEXED_CHUNKS.length,
    embeddedChunks: INDEXED_CHUNKS.filter(c => c.embedding).length,
    cacheSize: chunkEmbeddingCache.size + queryEmbeddingCache.size,
    bm25Ready: BM25 !== null,
    lastFirestoreFetch: lastFirestoreFetch
      ? new Date(lastFirestoreFetch).toISOString()
      : null,
  };
}

export function clearCache(): void {
  queryEmbeddingCache.clear();
  chunkEmbeddingCache.clear();
  console.log('[RAG] Caches cleared.');
}

// ─── Auto-initialize ────────────────────────────────────────────────────────
buildIndex();

export default retrieveContext;