import { KNOWLEDGE_BASE, KnowledgeItem } from '../data/knowledge';
import { fetchCrops, fetchContent, fetchSchemes } from './dbService';

const chunkEmbeddingCache: Record<string, number[]> = {};

function cleanText(text: string): string {
  return text
    .replace(/[#*`_]/g, '') // remove markdown styling
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split text into overlapping chunks
 */
export function chunkText(text: string, size = 300, overlap = 50): string[] {
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

/**
 * Calculates cosine similarity between two vectors
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    normA += v1[i] * v1[i];
    normB += v2[i] * v2[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Simple TF-IDF like keyword match score to select best candidates
 */
function getKeywordScore(text: string, queryWords: string[]): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  queryWords.forEach((word) => {
    if (word.length < 3) return; // skip very short words
    const regex = new RegExp(word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      score += matches.length * (word.length / 3); // longer words count more
    }
  });
  return score;
}

/**
 * Retrieves the most semantically relevant knowledge chunks for a query
 */
export async function retrieveContext(
  query: string,
  userContext: { crops?: string[]; state?: string; district?: string } = {},
  apiKey?: string
): Promise<{ contextText: string; citations: { source: string; category: string }[] }> {
  let articles: KnowledgeItem[] = [];
  
  try {
    const firestoreCrops = await fetchCrops();
    const firestoreContent = await fetchContent();
    const firestoreSchemes = await fetchSchemes();

    // Map Crops
    if (firestoreCrops && firestoreCrops.length > 0) {
      firestoreCrops.forEach((c: any) => {
        articles.push({
          id: c.id,
          category: 'crop',
          title: c.name || { en: '', mr: '' },
          subtitle: { en: c.scientificName || '', mr: '' },
          image: c.imageUrl || '',
          tags: c.tags || [],
          stats: c.stats || [],
          sections: c.sections || []
        });
      });
    }

    // Map Content
    if (firestoreContent && firestoreContent.length > 0) {
      firestoreContent.forEach((c: any) => {
        articles.push({
          id: c.id,
          category: c.category || 'tech',
          title: c.title || { en: '', mr: '' },
          subtitle: c.subtitle || { en: '', mr: '' },
          image: c.image || '',
          tags: c.tags || [],
          stats: c.stats || [],
          sections: c.sections || []
        });
      });
    }

    // Map Schemes
    const activeLang = 'mr';
    const schemeDoc = firestoreSchemes?.find((doc: any) => doc.lang === activeLang) || firestoreSchemes?.[0];
    if (schemeDoc && Array.isArray(schemeDoc.schemes)) {
      schemeDoc.schemes.forEach((s: any, idx: number) => {
        articles.push({
          id: s.id || `scheme_${idx}`,
          category: 'scheme',
          title: { en: s.title || '', mr: s.title || '' },
          subtitle: { en: s.dept || '', mr: s.dept || '' },
          image: '',
          tags: s.benefits ? [s.benefits] : [],
          stats: [],
          sections: [
            {
              title: { en: 'Details', mr: 'माहिती' },
              content: { en: `${s.desc || ''} ${s.eligibility || ''}`, mr: `${s.desc || ''} ${s.eligibility || ''}` }
            }
          ]
        });
      });
    }
  } catch (err) {
    console.warn("Firestore RAG fetch failed, falling back to static knowledge base:", err);
  }

  if (articles.length === 0) {
    articles = KNOWLEDGE_BASE || [];
  }

  // Filter by user's crops if specified
  const filteredArticles = articles.filter((art) => {
    if (!userContext.crops || userContext.crops.length === 0) return true;
    const titleText = `${art.title.mr} ${art.title.en} ${art.title.hi || ''}`.toLowerCase();
    const categoryText = art.category.toLowerCase();
    return userContext.crops.some(
      (crop) => titleText.includes(crop.toLowerCase()) || categoryText.includes(crop.toLowerCase())
    );
  });

  const targetArticles = filteredArticles.length > 0 ? filteredArticles : articles;
  
  interface ChunkItem {
    id: string;
    text: string;
    source: string;
    category: string;
  }
  
  const allChunks: ChunkItem[] = [];
  targetArticles.forEach((art, artIdx) => {
    // Compile content from sections
    const contentText = art.sections
      .map((s) => `${s.title.mr} ${s.title.en} ${s.content.mr} ${s.content.en}`)
      .join('\n');
    
    const textChunks = chunkText(contentText, 250, 40);
    const sourceTitle = art.title.mr || art.title.en;
    
    textChunks.forEach((chunk, chunkIdx) => {
      allChunks.push({
        id: `art_${artIdx}_chunk_${chunkIdx}`,
        text: chunk,
        source: sourceTitle,
        category: art.category
      });
    });
  });

  if (allChunks.length === 0) {
    return { contextText: '', citations: [] };
  }

  // Keyword pre-filter to narrow candidates down to top 12
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const scoredChunks = allChunks.map((chunk) => ({
    chunk,
    score: getKeywordScore(chunk.text, queryWords)
  }));
  
  scoredChunks.sort((a, b) => b.score - a.score);
  const candidates = scoredChunks.slice(0, 12).map(c => c.chunk);

  // If API key is available, calculate semantic similarity
  const activeKey = apiKey || '';
  if (activeKey && candidates.length > 0) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: activeKey });

      // Embed query
      const queryEmbedResp = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: query
      });
      const queryVector = (queryEmbedResp as any).embedding?.values || (queryEmbedResp as any).embeddings?.[0]?.values;

      if (queryVector) {
        // Embed candidates that are not cached yet
        const uncachedCandidates = candidates.filter(c => !chunkEmbeddingCache[c.id]);
        if (uncachedCandidates.length > 0) {
          const embedPromises = uncachedCandidates.map(c =>
            ai.models.embedContent({
              model: 'text-embedding-004',
              contents: c.text
            }).then(resp => {
              const vector = (resp as any).embedding?.values || (resp as any).embeddings?.[0]?.values;
              if (vector) {
                chunkEmbeddingCache[c.id] = vector;
              }
            }).catch(() => {
              // Ignore
            })
          );
          await Promise.all(embedPromises);
        }

        // Calculate cosine similarity for all candidates
        const semanticScores = candidates.map(c => {
          const vector = chunkEmbeddingCache[c.id];
          return {
            chunk: c,
            score: vector ? cosineSimilarity(queryVector, vector) : 0
          };
        });

        // Sort by semantic similarity
        semanticScores.sort((a, b) => b.score - a.score);
        
        // Take top 3 best matching chunks
        const topMatches = semanticScores.slice(0, 3).filter(m => m.score > 0.45).map(m => m.chunk);
        if (topMatches.length > 0) {
          const contextText = topMatches.map(m => `[Source: ${m.source}]\n${m.text}`).join('\n\n');
          const citations = topMatches.map(m => ({ source: m.source, category: m.category }));
          return { contextText, citations };
        }
      }
    } catch (e) {
      console.warn('RAG Semantic Search Failed, falling back to keyword matches:', e);
    }
  }

  // Fallback: Return top 2 keyword-matched chunks if vector search fails/is bypassed
  const bestKeywordChunks = candidates.slice(0, 2);
  const contextText = bestKeywordChunks.map(c => `[Source: ${c.source}]\n${c.text}`).join('\n\n');
  const citations = bestKeywordChunks.map(c => ({ source: c.source, category: c.category }));
  return { contextText, citations };
}
